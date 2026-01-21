import { Test, TestingModule } from '@nestjs/testing';
import { RatingsService } from './ratings.service';
import { Repository } from 'typeorm';
import { Rating } from '../entities/rating.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RestaurantsService } from 'src/restaurants/providers/restaurants.service';
import {
   NotFoundException,
   BadRequestException,
} from '@nestjs/common';
import { CreateRatingDto } from '../dtos/create-rating.dto';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import { UserRole } from 'src/users/enums/userRole.enum';
import { CuisineType } from 'src/restaurants/enums/cuisine-type.enum';
import { PriceRange } from 'src/restaurants/enums/price-range.enum';

describe('RatingsService', () => {
   let ratingsService: RatingsService;
   let ratingsRepository: Repository<Rating>;
   let restaurantsService: RestaurantsService;

   // Mock data
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

   const mockRestaurant: Partial<Restaurant> = {
      id: 1,
      name: 'Test Restaurant',
      description: 'Test Description',
      cuisineType: CuisineType.BISTRO,
      priceRange: PriceRange.MEDIUM,
      adress: 'Test Address',
      city: 'Test City',
      latitude: 45.0,
      longitude: 15.0,
      phone: undefined,
      email: undefined,
      website: undefined,
      workingHours: '{}',
      verified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      averageRating: 0,
      totalRatings: 0,
      user: mockUser as User,
      favorite: [],
      events: [],
      ratings: [],
      comments: [],
      verificationRequests: [],
      photos: [],
   } as Restaurant;

   const mockRating = {
      id: 1,
      rating: 5,
      comment: 'Odlično!',
      user: mockUser,
      restaurant: mockRestaurant,
      createdAt: new Date(),
   } as Rating;

   beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
         providers: [
            RatingsService,
            {
               provide: getRepositoryToken(Rating),
               useValue: {
                  findOne: jest.fn(),
                  find: jest.fn(),
                  create: jest.fn(),
                  save: jest.fn(),
                  remove: jest.fn(),
               },
            },
            {
               provide: RestaurantsService,
               useValue: {
                  getRestaurant: jest.fn(),
                  updateRestaurantRating: jest.fn(),
               },
            },
         ],
      }).compile();

      ratingsService = module.get<RatingsService>(RatingsService);
      ratingsRepository = module.get<Repository<Rating>>(getRepositoryToken(Rating));
      restaurantsService = module.get<RestaurantsService>(RestaurantsService);
   });

   afterEach(() => {
      jest.clearAllMocks();
   });

   describe('create - Redovni slučaj', () => {
      it('should successfully create a new rating for a restaurant', async () => {
         // ARRANGE
         const userId = 1;
         const createRatingDto: CreateRatingDto = {
            restaurantId: 1,
            rating: 5,
            comment: 'Odlična hrana i atmosfera!',
         };

         (restaurantsService.getRestaurant as jest.Mock).mockResolvedValue(mockRestaurant);
         (ratingsRepository.findOne as jest.Mock).mockResolvedValue(null); // No existing rating
         (ratingsRepository.create as jest.Mock).mockReturnValue(mockRating);
         (ratingsRepository.save as jest.Mock).mockResolvedValue(mockRating);
         (restaurantsService.updateRestaurantRating as jest.Mock).mockResolvedValue(undefined);

         // ACT
         const result = await ratingsService.create(createRatingDto, userId);

         // ASSERT
         expect(result).toBeDefined();
         expect(result.rating).toBe(5);
         expect(result.comment).toBe('Odlično!');
         expect(restaurantsService.getRestaurant).toHaveBeenCalledWith(createRatingDto.restaurantId);
         expect(ratingsRepository.findOne).toHaveBeenCalledWith({
            where: {
               user: { id: userId },
               restaurant: { id: createRatingDto.restaurantId },
            },
         });
         expect(ratingsRepository.save).toHaveBeenCalledTimes(1);
         expect(restaurantsService.updateRestaurantRating).toHaveBeenCalledWith(
            createRatingDto.restaurantId,
         );
      });

      it('should create rating without comment', async () => {
         // ARRANGE
         const userId = 1;
         const createRatingDto: CreateRatingDto = {
            restaurantId: 1,
            rating: 4,
         };

         const ratingWithoutComment = {
            ...mockRating,
            rating: 4,
            comment: undefined,
         };

         (restaurantsService.getRestaurant as jest.Mock).mockResolvedValue(mockRestaurant);
         (ratingsRepository.findOne as jest.Mock).mockResolvedValue(null);
         (ratingsRepository.create as jest.Mock).mockReturnValue(ratingWithoutComment);
         (ratingsRepository.save as jest.Mock).mockResolvedValue(ratingWithoutComment);
         (restaurantsService.updateRestaurantRating as jest.Mock).mockResolvedValue(undefined);

         // ACT
         const result = await ratingsService.create(createRatingDto, userId);

         // ASSERT
         expect(result).toBeDefined();
         expect(result.rating).toBe(4);
         expect(result.comment).toBeUndefined();
      });
   });

   describe('create - Rubni uvjet: Nepostojeći restoran', () => {
      it('should throw NotFoundException when restaurant does not exist', async () => {
         // ARRANGE
         const userId = 1;
         const createRatingDto: CreateRatingDto = {
            restaurantId: 999,
            rating: 5,
            comment: 'Test',
         };

         (restaurantsService.getRestaurant as jest.Mock).mockResolvedValue(null);

         // ACT & ASSERT
         await expect(ratingsService.create(createRatingDto, userId)).rejects.toThrow(
            NotFoundException,
         );
         await expect(ratingsService.create(createRatingDto, userId)).rejects.toThrow(
            'Restaurant not found.',
         );

         expect(restaurantsService.getRestaurant).toHaveBeenCalledWith(createRatingDto.restaurantId);
         expect(ratingsRepository.findOne).not.toHaveBeenCalled();
         expect(ratingsRepository.save).not.toHaveBeenCalled();
         expect(restaurantsService.updateRestaurantRating).not.toHaveBeenCalled();
      });

      it('should check restaurant existence before proceeding', async () => {
         // ARRANGE
         const userId = 1;
         const createRatingDto: CreateRatingDto = {
            restaurantId: 1,
            rating: 5,
         };

         (restaurantsService.getRestaurant as jest.Mock).mockResolvedValue(mockRestaurant);
         (ratingsRepository.findOne as jest.Mock).mockResolvedValue(null);
         (ratingsRepository.create as jest.Mock).mockReturnValue(mockRating);
         (ratingsRepository.save as jest.Mock).mockResolvedValue(mockRating);
         (restaurantsService.updateRestaurantRating as jest.Mock).mockResolvedValue(undefined);

         // ACT
         await ratingsService.create(createRatingDto, userId);

         // ASSERT
         expect(restaurantsService.getRestaurant).toHaveBeenCalledWith(createRatingDto.restaurantId);
         expect(restaurantsService.getRestaurant).toHaveBeenCalledTimes(1);
      });
   });

   describe('create - Izazivanje pogreške: Dupla ocjena restorana', () => {
      it('should throw BadRequestException when user tries to rate same restaurant twice', async () => {
         // ARRANGE
         const userId = 1;
         const createRatingDto: CreateRatingDto = {
            restaurantId: 1,
            rating: 5,
            comment: 'Pokušavam ponovno ocijeniti',
         };

         const existingRating = {
            id: 1,
            rating: 4,
            comment: 'Prethodna ocjena',
            user: mockUser,
            restaurant: mockRestaurant,
         } as Rating;

         (restaurantsService.getRestaurant as jest.Mock).mockResolvedValue(mockRestaurant);
         (ratingsRepository.findOne as jest.Mock).mockResolvedValue(existingRating);

         // ACT & ASSERT
         await expect(ratingsService.create(createRatingDto, userId)).rejects.toThrow(
            BadRequestException,
         );
         await expect(ratingsService.create(createRatingDto, userId)).rejects.toThrow(
            'You have already rated this restaurant. Use update instead.',
         );

         expect(restaurantsService.getRestaurant).toHaveBeenCalledWith(createRatingDto.restaurantId);
         expect(ratingsRepository.findOne).toHaveBeenCalledWith({
            where: {
               user: { id: userId },
               restaurant: { id: createRatingDto.restaurantId },
            },
         });
         expect(ratingsRepository.save).not.toHaveBeenCalled();
         expect(restaurantsService.updateRestaurantRating).not.toHaveBeenCalled();
      });

      it('should not allow duplicate ratings from same user', async () => {
         // ARRANGE
         const userId = 1;
         const createRatingDto: CreateRatingDto = {
            restaurantId: 1,
            rating: 5,
         };

         // First rating succeeds
         (restaurantsService.getRestaurant as jest.Mock).mockResolvedValue(mockRestaurant);
         (ratingsRepository.findOne as jest.Mock)
            .mockResolvedValueOnce(null) // First call - no existing rating
            .mockResolvedValueOnce(mockRating); // Second call - rating now exists

         (ratingsRepository.create as jest.Mock).mockReturnValue(mockRating);
         (ratingsRepository.save as jest.Mock).mockResolvedValue(mockRating);
         (restaurantsService.updateRestaurantRating as jest.Mock).mockResolvedValue(undefined);

         // First rating succeeds
         const result1 = await ratingsService.create(createRatingDto, userId);
         expect(result1).toBeDefined();

         // Second rating attempt fails
         await expect(ratingsService.create(createRatingDto, userId)).rejects.toThrow(
            BadRequestException,
         );
      });

      it('should verify existing rating check is performed', async () => {
         // ARRANGE
         const userId = 1;
         const createRatingDto: CreateRatingDto = {
            restaurantId: 1,
            rating: 5,
         };

         (restaurantsService.getRestaurant as jest.Mock).mockResolvedValue(mockRestaurant);
         (ratingsRepository.findOne as jest.Mock).mockResolvedValue(null);
         (ratingsRepository.create as jest.Mock).mockReturnValue(mockRating);
         (ratingsRepository.save as jest.Mock).mockResolvedValue(mockRating);
         (restaurantsService.updateRestaurantRating as jest.Mock).mockResolvedValue(undefined);

         // ACT
         await ratingsService.create(createRatingDto, userId);

         // ASSERT
         expect(ratingsRepository.findOne).toHaveBeenCalledWith({
            where: {
               user: { id: userId },
               restaurant: { id: createRatingDto.restaurantId },
            },
         });
         expect(ratingsRepository.findOne).toHaveBeenCalledTimes(1);
      });
   });

   describe('create - Integracija s restaurantsService', () => {
      it('should call updateRestaurantRating after successful rating creation', async () => {
         // ARRANGE
         const userId = 1;
         const createRatingDto: CreateRatingDto = {
            restaurantId: 1,
            rating: 5,
         };

         (restaurantsService.getRestaurant as jest.Mock).mockResolvedValue(mockRestaurant);
         (ratingsRepository.findOne as jest.Mock).mockResolvedValue(null);
         (ratingsRepository.create as jest.Mock).mockReturnValue(mockRating);
         (ratingsRepository.save as jest.Mock).mockResolvedValue(mockRating);
         (restaurantsService.updateRestaurantRating as jest.Mock).mockResolvedValue(undefined);

         // ACT
         await ratingsService.create(createRatingDto, userId);

         // ASSERT
         expect(restaurantsService.updateRestaurantRating).toHaveBeenCalledWith(
            createRatingDto.restaurantId,
         );
         expect(restaurantsService.updateRestaurantRating).toHaveBeenCalledTimes(1);
      });
   });
});
