import { Test, TestingModule } from '@nestjs/testing';
import { UpdateUserProvider } from './update-user.provider';
import { FindUserProvider } from './find-user.provider';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, RequestTimeoutException, ConflictException } from '@nestjs/common';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UserRole } from '../enums/userRole.enum';

describe('UpdateUserProvider', () => {
   let updateUserProvider: UpdateUserProvider;
   let findUserProvider: FindUserProvider;
   let usersRepository: Repository<User>;

   // Mock user data
   const mockUser: Partial<User> = {
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

   const mockUpdatedUser: Partial<User> = {
      id: 1,
      email: 'john.updated@example.com',
      firstName: 'John',
      lastName: 'Updated',
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

   beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
         providers: [
            UpdateUserProvider,
            {
               provide: FindUserProvider,
               useValue: {
                  findOneById: jest.fn(),
               },
            },
            {
               provide: getRepositoryToken(User),
               useValue: {
                  save: jest.fn(),
               },
            },
         ],
      }).compile();

      updateUserProvider = module.get<UpdateUserProvider>(UpdateUserProvider);
      findUserProvider = module.get<FindUserProvider>(FindUserProvider);
      usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
   });

   afterEach(() => {
      jest.clearAllMocks();
   });

   describe('updateUser - Redovni slučaj', () => {
      it('should successfully update user information', async () => {
         // ARRANGE
         const userId = 1;
         const updateUserDto: UpdateUserDto = {
            firstName: 'John',
            lastName: 'Updated',
            email: 'john.updated@example.com',
         };

         (findUserProvider.findOneById as jest.Mock).mockResolvedValue(mockUser);
         (usersRepository.save as jest.Mock).mockResolvedValue({
            ...mockUser,
            ...updateUserDto,
         });

         // ACT
         const result = await updateUserProvider.updateUser(updateUserDto, userId);

         // ASSERT
         expect(result).toBeDefined();
         expect(result.firstName).toBe(updateUserDto.firstName);
         expect(result.lastName).toBe(updateUserDto.lastName);
         expect(result.email).toBe(updateUserDto.email);
         expect(findUserProvider.findOneById).toHaveBeenCalledWith(userId);
         expect(findUserProvider.findOneById).toHaveBeenCalledTimes(1);
         expect(usersRepository.save).toHaveBeenCalledTimes(1);
      });

      it('should update only provided fields', async () => {
         // ARRANGE
         const userId = 1;
         const partialUpdateDto: UpdateUserDto = {
            firstName: 'UpdatedFirstName',
         };

         (findUserProvider.findOneById as jest.Mock).mockResolvedValue(mockUser);
         (usersRepository.save as jest.Mock).mockImplementation((user) => Promise.resolve(user));

         // ACT
         const result = await updateUserProvider.updateUser(partialUpdateDto, userId);

         // ASSERT
         expect(result.firstName).toBe('UpdatedFirstName');
         expect(result.lastName).toBe(mockUser.lastName); // Unchanged
         expect(result.email).toBe(mockUser.email); // Unchanged
      });
   });

   describe('updateUser - Izazivanje pogreške', () => {
      it('should throw BadRequestException when user does not exist', async () => {
         // ARRANGE
         const userId = 999;
         const updateUserDto: UpdateUserDto = {
            firstName: 'NonExistent',
            lastName: 'User',
         };

         (findUserProvider.findOneById as jest.Mock).mockResolvedValue(null);

         // ACT & ASSERT
         await expect(updateUserProvider.updateUser(updateUserDto, userId)).rejects.toThrow(
            BadRequestException,
         );
         await expect(updateUserProvider.updateUser(updateUserDto, userId)).rejects.toThrow(
            'User does not exist',
         );

         expect(findUserProvider.findOneById).toHaveBeenCalledWith(userId);
         expect(usersRepository.save).not.toHaveBeenCalled();
      });

      it('should throw ConflictException when email is not unique', async () => {
         // ARRANGE
         const userId = 1;
         const updateUserDto: UpdateUserDto = {
            email: 'duplicate@example.com',
         };

         const dbError = new Error('Database error') as any;
         dbError.detail = 'Key (email)=(duplicate@example.com) already exists.';

         (findUserProvider.findOneById as jest.Mock).mockResolvedValue(mockUser);
         (usersRepository.save as jest.Mock).mockRejectedValue(dbError);

         // ACT & ASSERT
         await expect(updateUserProvider.updateUser(updateUserDto, userId)).rejects.toThrow(
            ConflictException,
         );
         await expect(updateUserProvider.updateUser(updateUserDto, userId)).rejects.toThrow(
            'Email must be uniqqque',
         );
      });

      it('should throw RequestTimeoutException on database connection error', async () => {
         // ARRANGE
         const userId = 1;
         const updateUserDto: UpdateUserDto = {
            firstName: 'Test',
         };

         const dbError = new Error('Connection timeout');

         (findUserProvider.findOneById as jest.Mock).mockRejectedValue(dbError);

         // ACT & ASSERT
         await expect(updateUserProvider.updateUser(updateUserDto, userId)).rejects.toThrow(
            RequestTimeoutException,
         );
         expect(usersRepository.save).not.toHaveBeenCalled();
      });
   });

   describe('updateUser - Rubni uvjeti', () => {
      it('should handle empty update object', async () => {
         // ARRANGE
         const userId = 1;
         const emptyUpdateDto: UpdateUserDto = {};

         (findUserProvider.findOneById as jest.Mock).mockResolvedValue(mockUser);
         (usersRepository.save as jest.Mock).mockImplementation((user) => Promise.resolve(user));

         // ACT
         const result = await updateUserProvider.updateUser(emptyUpdateDto, userId);

         // ASSERT
         expect(result.firstName).toBe(mockUser.firstName);
         expect(result.lastName).toBe(mockUser.lastName);
         expect(result.email).toBe(mockUser.email);
         expect(usersRepository.save).toHaveBeenCalledTimes(1);
      });
   });
});
