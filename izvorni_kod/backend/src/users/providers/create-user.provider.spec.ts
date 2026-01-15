import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserProvider } from './create-user.provider';
import { FindUserProvider } from './find-user.provider';
import { HashingProvider } from 'src/auth/providers/hashing.provider';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, ConflictException, RequestTimeoutException } from '@nestjs/common';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UserRole } from '../enums/userRole.enum';

describe('CreateUserProvider', () => {
   let createUserProvider: CreateUserProvider;
   let findUserProvider: FindUserProvider;
   let hashingProvider: HashingProvider;
   let usersRepository: Repository<User>;

   // Mock user data
   const mockValidCreateUserDto: CreateUserDto = {
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'Password123!',
      role: UserRole.user,
   };

   const mockExistingUser: Partial<User> = {
      id: 1,
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'hashedPassword123',
      googleId: undefined,
      role: UserRole.user,
      isBlocked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      restaurant: [],
      favorite: [],
      ratings: [],
      comments: [],
   } as User;

   const mockCreatedUser: Partial<User> = {
      id: 2,
      email: 'new.user@example.com',
      firstName: 'New',
      lastName: 'User',
      password: 'hashedPassword456',
      googleId: undefined,
      role: UserRole.user,
      isBlocked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      restaurant: [],
      favorite: [],
      ratings: [],
      comments: [],
   } as User;

   beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
         providers: [
            CreateUserProvider,
            {
               provide: FindUserProvider,
               useValue: {
                  findOneByEmail: jest.fn(),
               },
            },
            {
               provide: HashingProvider,
               useValue: {
                  hashPassword: jest.fn(),
               },
            },
            {
               provide: getRepositoryToken(User),
               useValue: {
                  create: jest.fn(),
                  save: jest.fn(),
               },
            },
         ],
      }).compile();

      createUserProvider = module.get<CreateUserProvider>(CreateUserProvider);
      findUserProvider = module.get<FindUserProvider>(FindUserProvider);
      hashingProvider = module.get<HashingProvider>(HashingProvider);
      usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
   });

   afterEach(() => {
      jest.clearAllMocks();
   });

   describe('createUser - Redovni slučaj', () => {
      it('should successfully create a new user', async () => {
         // ARRANGE
         const createUserDto: CreateUserDto = {
            email: 'new.user@example.com',
            firstName: 'New',
            lastName: 'User',
            password: 'Password123!',
            role: UserRole.user,
         };

         (findUserProvider.findOneByEmail as jest.Mock).mockResolvedValue(null);
         (hashingProvider.hashPassword as jest.Mock).mockResolvedValue('hashedPassword456');
         (usersRepository.create as jest.Mock).mockReturnValue(mockCreatedUser);
         (usersRepository.save as jest.Mock).mockResolvedValue(mockCreatedUser);

         // ACT
         const result = await createUserProvider.createUser(createUserDto);

         // ASSERT
         expect(result).toBeDefined();
         expect(result.email).toBe('new.user@example.com');
         expect(result.firstName).toBe('New');
         expect(result.lastName).toBe('User');
         expect(findUserProvider.findOneByEmail).toHaveBeenCalledWith(createUserDto.email);
         expect(hashingProvider.hashPassword).toHaveBeenCalledWith(createUserDto.password);
         expect(usersRepository.create).toHaveBeenCalled();
         expect(usersRepository.save).toHaveBeenCalled();
      });
   });

   describe('Duplicate Email Registration', () => {
      it('should throw BadRequestException when email is already in use', async () => {
         // ARRANGE
         const createUserDto = mockValidCreateUserDto;
         (findUserProvider.findOneByEmail as jest.Mock).mockResolvedValue(mockExistingUser);

         // ACT & ASSERT
         await expect(createUserProvider.createUser(createUserDto)).rejects.toThrow(
            BadRequestException,
         );
         await expect(createUserProvider.createUser(createUserDto)).rejects.toThrow(
            'User already exists, please check your email.',
         );

         // Verify that the repository was never called (early exit)
         expect(usersRepository.create).not.toHaveBeenCalled();
         expect(usersRepository.save).not.toHaveBeenCalled();
      });

      it('should check for existing user before creating', async () => {
         // ARRANGE
         const createUserDto = mockValidCreateUserDto;
         (findUserProvider.findOneByEmail as jest.Mock).mockResolvedValue(null);
         (hashingProvider.hashPassword as jest.Mock).mockResolvedValue('hashedpassword123');
         (usersRepository.create as jest.Mock).mockReturnValue(mockCreatedUser);
         (usersRepository.save as jest.Mock).mockResolvedValue(mockCreatedUser);

         // ACT
         await createUserProvider.createUser(createUserDto);

         // ASSERT
         expect(findUserProvider.findOneByEmail).toHaveBeenCalledWith(createUserDto.email);
         expect(findUserProvider.findOneByEmail).toHaveBeenCalledTimes(1);
      });

      it('should not allow duplicate email across multiple registration attempts', async () => {
         // ARRANGE
         const createUserDto = mockValidCreateUserDto;

         // First attempt succeeds
         (findUserProvider.findOneByEmail as jest.Mock)
            .mockResolvedValueOnce(null) // First call - user doesn't exist
            .mockResolvedValueOnce(mockExistingUser); // Second call - user now exists

         (hashingProvider.hashPassword as jest.Mock).mockResolvedValue('hashedpassword123');
         (usersRepository.create as jest.Mock).mockReturnValue(mockCreatedUser);
         (usersRepository.save as jest.Mock).mockResolvedValue(mockCreatedUser);

         // First registration succeeds
         const result1 = await createUserProvider.createUser(createUserDto);
         expect(result1).toBeDefined();

         // Second registration attempt with same email fails
         await expect(createUserProvider.createUser(createUserDto)).rejects.toThrow(
            BadRequestException,
         );
      });
   });

   describe('createUser - Error Handling', () => {
      it('should throw ConflictException when email constraint is violated', async () => {
         // ARRANGE
         const createUserDto = mockValidCreateUserDto;
         const dbError = new Error('Database error') as any;
         dbError.detail = 'Key (email)=(john.doe@example.com) already exists.';

         (findUserProvider.findOneByEmail as jest.Mock).mockResolvedValue(null);
         (hashingProvider.hashPassword as jest.Mock).mockResolvedValue('hashedPassword123');
         (usersRepository.create as jest.Mock).mockReturnValue(mockCreatedUser);
         (usersRepository.save as jest.Mock).mockRejectedValue(dbError);

         // ACT & ASSERT
         await expect(createUserProvider.createUser(createUserDto)).rejects.toThrow(
            ConflictException,
         );
         await expect(createUserProvider.createUser(createUserDto)).rejects.toThrow(
            'Email must be unique',
         );
      });

      it('should throw RequestTimeoutException on general database error', async () => {
         // ARRANGE
         const createUserDto = mockValidCreateUserDto;
         const dbError = new Error('Connection timeout');

         (findUserProvider.findOneByEmail as jest.Mock).mockResolvedValue(null);
         (hashingProvider.hashPassword as jest.Mock).mockResolvedValue('hashedPassword123');
         (usersRepository.create as jest.Mock).mockReturnValue(mockCreatedUser);
         (usersRepository.save as jest.Mock).mockRejectedValue(dbError);

         // ACT & ASSERT
         await expect(createUserProvider.createUser(createUserDto)).rejects.toThrow(
            RequestTimeoutException,
         );
      });
   });

   describe('createUser - Password Hashing', () => {
      it('should hash password before saving', async () => {
         // ARRANGE
         const createUserDto: CreateUserDto = {
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            password: 'PlainPassword123!',
            role: UserRole.user,
         };

         (findUserProvider.findOneByEmail as jest.Mock).mockResolvedValue(null);
         (hashingProvider.hashPassword as jest.Mock).mockResolvedValue('hashedVersion');
         (usersRepository.create as jest.Mock).mockReturnValue(mockCreatedUser);
         (usersRepository.save as jest.Mock).mockResolvedValue(mockCreatedUser);

         // ACT
         await createUserProvider.createUser(createUserDto);

         // ASSERT
         expect(hashingProvider.hashPassword).toHaveBeenCalledWith('PlainPassword123!');
         expect(usersRepository.create).toHaveBeenCalledWith({
            ...createUserDto,
            password: 'hashedVersion',
         });
      });
   });
});
