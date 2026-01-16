import { Test, TestingModule } from '@nestjs/testing';
import { SignInProvider } from './sign-in.provider';
import { FindUserProvider } from 'src/users/providers/find-user.provider';
import { HashingProvider } from './hashing.provider';
import { GenerateTokensProvider } from './generate-tokens.provider';
import { UnauthorizedException, RequestTimeoutException } from '@nestjs/common';
import { SignInDto } from '../dtos/signin.dto';
import { User } from 'src/users/entities/user.entity';
import { UserRole } from 'src/users/enums/userRole.enum';

describe('SignInProvider', () => {
   let signInProvider: SignInProvider;
   let findUserProvider: FindUserProvider;
   let hashingProvider: HashingProvider;
   let generateTokensProvider: GenerateTokensProvider;

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

   const mockTokens = {
      accessToken: 'mock.access.token',
      refreshToken: 'mock.refresh.token',
   };

   beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
         providers: [
            SignInProvider,
            {
               provide: FindUserProvider,
               useValue: {
                  findOneByEmail: jest.fn(),
               },
            },
            {
               provide: HashingProvider,
               useValue: {
                  comparePassword: jest.fn(),
               },
            },
            {
               provide: GenerateTokensProvider,
               useValue: {
                  generateTokens: jest.fn(),
               },
            },
         ],
      }).compile();

      signInProvider = module.get<SignInProvider>(SignInProvider);
      findUserProvider = module.get<FindUserProvider>(FindUserProvider);
      hashingProvider = module.get<HashingProvider>(HashingProvider);
      generateTokensProvider = module.get<GenerateTokensProvider>(GenerateTokensProvider);
   });

   afterEach(() => {
      jest.clearAllMocks();
   });

   describe('signIn - Redovni slučaj', () => {
      it('should successfully sign in user with correct credentials', async () => {
         // ARRANGE
         const signInDto: SignInDto = {
            email: 'john.doe@example.com',
            password: 'correctPassword123',
         };

         (findUserProvider.findOneByEmail as jest.Mock).mockResolvedValue(mockUser);
         (hashingProvider.comparePassword as jest.Mock).mockResolvedValue(true);
         (generateTokensProvider.generateTokens as jest.Mock).mockResolvedValue(mockTokens);

         // ACT
         const result = await signInProvider.signIn(signInDto);

         // ASSERT
         expect(result).toBeDefined();
         expect(result.accessToken).toBe(mockTokens.accessToken);
         expect(result.refreshToken).toBe(mockTokens.refreshToken);
         expect(findUserProvider.findOneByEmail).toHaveBeenCalledWith(signInDto.email);
         expect(hashingProvider.comparePassword).toHaveBeenCalledWith(
            signInDto.password,
            mockUser.password,
         );
         expect(generateTokensProvider.generateTokens).toHaveBeenCalledWith(mockUser);
      });
   });

   describe('signIn - Izazivanje pogreške: Nepostojeći korisnik', () => {
      it('should throw UnauthorizedException when user does not exist', async () => {
         // ARRANGE
         const signInDto: SignInDto = {
            email: 'nonexistent@example.com',
            password: 'anyPassword123',
         };

         (findUserProvider.findOneByEmail as jest.Mock).mockResolvedValue(null);

         // ACT & ASSERT
         await expect(signInProvider.signIn(signInDto)).rejects.toThrow(
            UnauthorizedException,
         );
         await expect(signInProvider.signIn(signInDto)).rejects.toThrow(
            'Incorrect email or password',
         );

         expect(findUserProvider.findOneByEmail).toHaveBeenCalledWith(signInDto.email);
         expect(hashingProvider.comparePassword).not.toHaveBeenCalled();
         expect(generateTokensProvider.generateTokens).not.toHaveBeenCalled();
      });

      it('should throw UnauthorizedException when password is incorrect', async () => {
         // ARRANGE
         const signInDto: SignInDto = {
            email: 'john.doe@example.com',
            password: 'wrongPassword123',
         };

         (findUserProvider.findOneByEmail as jest.Mock).mockResolvedValue(mockUser);
         (hashingProvider.comparePassword as jest.Mock).mockResolvedValue(false);

         // ACT & ASSERT
         await expect(signInProvider.signIn(signInDto)).rejects.toThrow(
            UnauthorizedException,
         );
         await expect(signInProvider.signIn(signInDto)).rejects.toThrow(
            'Incorrect email or password',
         );

         expect(findUserProvider.findOneByEmail).toHaveBeenCalledWith(signInDto.email);
         expect(hashingProvider.comparePassword).toHaveBeenCalledWith(
            signInDto.password,
            mockUser.password,
         );
         expect(generateTokensProvider.generateTokens).not.toHaveBeenCalled();
      });

      it('should throw RequestTimeoutException when user has no password (Google user)', async () => {
         // ARRANGE
         const googleUser = {
            ...mockUser,
            password: null,
         } as unknown as User;

         const signInDto: SignInDto = {
            email: 'john.doe@example.com',
            password: 'anyPassword123',
         };

         (findUserProvider.findOneByEmail as jest.Mock).mockResolvedValue(googleUser);

         // ACT & ASSERT
         await expect(signInProvider.signIn(signInDto)).rejects.toThrow(
            RequestTimeoutException,
         );

         expect(findUserProvider.findOneByEmail).toHaveBeenCalledWith(signInDto.email);
         expect(generateTokensProvider.generateTokens).not.toHaveBeenCalled();
      });
   });

   describe('signIn - Rubni uvjeti', () => {
      it('should throw RequestTimeoutException on password comparison error', async () => {
         // ARRANGE
         const signInDto: SignInDto = {
            email: 'john.doe@example.com',
            password: 'password123',
         };

         const dbError = new Error('Password comparison failed');

         (findUserProvider.findOneByEmail as jest.Mock).mockResolvedValue(mockUser);
         (hashingProvider.comparePassword as jest.Mock).mockRejectedValue(dbError);

         // ACT & ASSERT
         await expect(signInProvider.signIn(signInDto)).rejects.toThrow(
            RequestTimeoutException,
         );

         expect(findUserProvider.findOneByEmail).toHaveBeenCalledWith(signInDto.email);
         expect(hashingProvider.comparePassword).toHaveBeenCalledWith(
            signInDto.password,
            mockUser.password,
         );
         expect(generateTokensProvider.generateTokens).not.toHaveBeenCalled();
      });
   });
});
