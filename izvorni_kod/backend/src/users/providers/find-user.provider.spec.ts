import { Test, TestingModule } from '@nestjs/testing';
import { FindUserProvider } from './find-user.provider';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RequestTimeoutException } from '@nestjs/common';
import { UserRole } from '../enums/userRole.enum';

describe('FindUserProvider', () => {
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

   beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
         providers: [
            FindUserProvider,
            {
               provide: getRepositoryToken(User),
               useValue: {
                  findOneBy: jest.fn(),
               },
            },
         ],
      }).compile();

      findUserProvider = module.get<FindUserProvider>(FindUserProvider);
      usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
   });

   afterEach(() => {
      jest.clearAllMocks();
   });

   describe('findOneByEmail', () => {
      it('should successfully find a user by email', async () => {
         // ARRANGE
         const email = 'john.doe@example.com';
         (usersRepository.findOneBy as jest.Mock).mockResolvedValue(mockUser);

         // ACT
         const result = await findUserProvider.findOneByEmail(email);

         // ASSERT
         expect(result).toBeDefined();
         expect(result?.email).toBe(email);
         expect(result?.firstName).toBe('John');
         expect(result?.lastName).toBe('Doe');
         expect(usersRepository.findOneBy).toHaveBeenCalledWith({ email });
         expect(usersRepository.findOneBy).toHaveBeenCalledTimes(1);
      });

      it('should return null when user is not found', async () => {
         // ARRANGE
         const email = 'nonexistent@example.com';
         (usersRepository.findOneBy as jest.Mock).mockResolvedValue(null);

         // ACT
         const result = await findUserProvider.findOneByEmail(email);

         // ASSERT
         expect(result).toBeNull();
         expect(usersRepository.findOneBy).toHaveBeenCalledWith({ email });
      });

      it('should throw RequestTimeoutException on database error', async () => {
         // ARRANGE
         const email = 'john.doe@example.com';
         const dbError = new Error('Database connection failed');
         (usersRepository.findOneBy as jest.Mock).mockRejectedValue(dbError);

         // ACT & ASSERT
         await expect(findUserProvider.findOneByEmail(email)).rejects.toThrow(
            RequestTimeoutException,
         );
         await expect(findUserProvider.findOneByEmail(email)).rejects.toThrow(
            'Unable to process your request at the moment, please try later',
         );
      });
   });

   describe('findOneById', () => {
      it('should successfully find a user by id', async () => {
         // ARRANGE
         const userId = 1;
         (usersRepository.findOneBy as jest.Mock).mockResolvedValue(mockUser);

         // ACT
         const result = await findUserProvider.findOneById(userId);

         // ASSERT
         expect(result).toBeDefined();
         expect(result?.id).toBe(userId);
         expect(result?.email).toBe('john.doe@example.com');
         expect(usersRepository.findOneBy).toHaveBeenCalledWith({ id: userId });
      });

      it('should return null when user is not found by id', async () => {
         // ARRANGE
         const userId = 999;
         (usersRepository.findOneBy as jest.Mock).mockResolvedValue(null);

         // ACT
         const result = await findUserProvider.findOneById(userId);

         // ASSERT
         expect(result).toBeNull();
         expect(usersRepository.findOneBy).toHaveBeenCalledWith({ id: userId });
      });
   });

   describe('findOneByGoogleId', () => {
      it('should successfully find a user by Google ID', async () => {
         // ARRANGE
         const googleId = 'google123456';
         const googleUser = {
            ...mockUser,
            googleId: googleId,
         } as User;
         (usersRepository.findOneBy as jest.Mock).mockResolvedValue(googleUser);

         // ACT
         const result = await findUserProvider.findOneByGoogleId(googleId);

         // ASSERT
         expect(result).toBeDefined();
         expect(result?.googleId).toBe(googleId);
         expect(usersRepository.findOneBy).toHaveBeenCalledWith({ googleId });
      });

      it('should return null when user with Google ID is not found', async () => {
         // ARRANGE
         const googleId = 'nonexistent-google-id';
         (usersRepository.findOneBy as jest.Mock).mockResolvedValue(null);

         // ACT
         const result = await findUserProvider.findOneByGoogleId(googleId);

         // ASSERT
         expect(result).toBeNull();
      });

      it('should throw RequestTimeoutException on database error', async () => {
         // ARRANGE
         const googleId = 'google123456';
         const dbError = new Error('Connection timeout');
         (usersRepository.findOneBy as jest.Mock).mockRejectedValue(dbError);

         // ACT & ASSERT
         await expect(findUserProvider.findOneByGoogleId(googleId)).rejects.toThrow(
            RequestTimeoutException,
         );
      });
   });
});
