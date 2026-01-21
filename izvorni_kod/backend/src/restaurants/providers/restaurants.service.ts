import { BadRequestException, ConflictException, forwardRef, Inject, Injectable, RequestTimeoutException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { CreateRestaurantDto } from "../dtos/create-restaurant.dto";
import { UpdateRestaurantDto } from "../dtos/update-restaurant.dto";
import { SearchRestaurantsDto } from "../dtos/search-restaurants.dto";

import { Restaurant } from "../entities/restaurant.entity";
import { FindRestaurantProvider } from "./find-restaurant.provider";
import { RatingsService } from "src/ratings/providers/ratings.service";
import { GeocodeProvider } from "./geocode.provider";

@Injectable()
export class RestaurantsService {

    constructor(
        @InjectRepository(Restaurant)
        private restaurantsRepository: Repository<Restaurant>,

        private readonly findRestaurantProvider: FindRestaurantProvider,

        private readonly geocodeProvider: GeocodeProvider,

        @Inject(forwardRef(() => RatingsService))
        private readonly ratingsService: RatingsService,
    ) { }

    public async getAllRestaurants() {
        return await this.restaurantsRepository.find({
            relations: ['user', 'photos'],
        });
    }

    public async getAllVerifiedRestaurants() {
        return await this.restaurantsRepository.find({
            where: { verified: true },
            relations: ['user', 'photos'],
        });
    }

    public async getRestaurant(id: number) {
        return await this.findRestaurantProvider.findOneById(id);
    }

    public async createRestaurant(createRestaurantDto: CreateRestaurantDto, userId: number) {
        let restaurant: Restaurant | null;

        /* nadi mi Restauranta s emailom koji je dosao na endpoint */
        try {
            restaurant = await this.findRestaurantProvider.findOneByEmail(createRestaurantDto.email!);
        } catch (error) {
            const errMessage = (error as Error).message;
            throw new RequestTimeoutException(
                'Unable to process your request at the moment, please try later',
                {
                    description: 'Error connecting to the database, error message: ' + errMessage,
                },
            );
        }

        /* ako Restaurant postoji nemozemo ga opet kreirati */
        if (restaurant) {
            throw new BadRequestException('Restaurant already exists, please check your email.');
        }

        let coordinates;
        if (createRestaurantDto.adress && createRestaurantDto.city) {
            coordinates = await this.geocodeProvider.geocode(createRestaurantDto.adress, createRestaurantDto.city);
        }

        if (!coordinates) {
            throw new Error('Adresa nije pronađena, upišite ispravnu adresu');
        } else {
            createRestaurantDto.longitude = coordinates.longitude;
            createRestaurantDto.latitude = coordinates.latitude;
        }

        /* kreiraj restoran sa vlasnikom (trenutno prijavljeni korisnik) */
        const newRestaurant = this.restaurantsRepository.create({
            ...createRestaurantDto,
            user: { id: userId },
        });

        /* kreiraj Restauranta */
        try {
            return await this.restaurantsRepository.save(newRestaurant);
        } catch (error: unknown) {
            const errMessage = (error as Error).message;
            if (error instanceof Error && 'detail' in error) {
                const detail = (error as { detail: string }).detail;
                if (detail.includes('email')) {
                    throw new ConflictException('Email već postoji u bazi');
                }
                if (detail.includes('phone')) {
                    throw new ConflictException('Telefonski broj već postoji u bazi');
                }
                if (detail.includes('website')) {
                    throw new ConflictException('Website već postoji u bazi');
                }
            }
            // Ako je duplicate key error za ID (primarni ključ)
            if (errMessage.includes('duplicate key') && errMessage.includes('PK_')) {
                throw new ConflictException('ID restorana već postoji. Molimo pokušajte ponovno.');
            }
            throw new RequestTimeoutException(
                'Unable to process your request at the moment, please try later',
                {
                    description: 'Error connecting to the database, error message: ' + errMessage,
                },
            );
        }
    }

    public async updateRestaurant(updateRestaurantDto: UpdateRestaurantDto, id: number) {
        let restaurant: Restaurant | null;

        /* nadi mi Restauranta po id-u koji je dosao na endpoint */
        try {
            restaurant = await this.findRestaurantProvider.findOneById(id);
        } catch (error) {
            const errMessage = (error as Error).message;
            throw new RequestTimeoutException(
                'Unable to process your request at the moment, please try later',
                {
                    description: 'Error connecting to the database, error message: ' + errMessage,
                },
            );
        }

        /* ako Restaurant ne postoji nemožemo ga ni mijenjat */
        if (!restaurant) {
            throw new BadRequestException('Restaurant does not exist');
        }

        // Geocoding samo ako se ažurira adresa ili grad
        if (updateRestaurantDto.adress || updateRestaurantDto.city) {
            const addressToGeocode = updateRestaurantDto.adress || restaurant.adress;
            const cityToGeocode = updateRestaurantDto.city || restaurant.city;

            if (addressToGeocode && cityToGeocode) {
                const coordinates = await this.geocodeProvider.geocode(addressToGeocode, cityToGeocode);

                if (!coordinates) {
                    throw new Error('Adresa nije pronađena, upišite ispravnu adresu');
                }

                updateRestaurantDto.longitude = coordinates.longitude;
                updateRestaurantDto.latitude = coordinates.latitude;
            }
        }

        Object.assign(restaurant, updateRestaurantDto);

        try {
            await this.restaurantsRepository.save(restaurant);
        } catch (error: unknown) {
            if (error instanceof Error && 'detail' in error) {
                const detail = (error as { detail: string }).detail;
                if (detail.includes('email')) {
                    throw new ConflictException('Email must be uniqqque');
                }
            }
            throw new RequestTimeoutException(
                'Unable to process your request at the moment, please try later',
                {
                    description: 'Error connecting to the database',
                },
            );
        }
        return restaurant;
    }

    public async removeRestaurant(id: number) {
        const result = await this.restaurantsRepository.delete(id);
        return { deleted: result.affected! > 0 ? true : false, id }
    }

    /**
     * Pretraga i filtriranje restorana s pagination
     * PUBLIC endpoint - svi mogu pretraživati restorane
     */
    public async search(searchDto: SearchRestaurantsDto) {
        const {
            search,
            cuisineType,
            city,
            minRating,
            verifiedOnly,
            maxPriceRange,
            page = 1,
            limit = 10,
            sortBy = 'name',
            sortOrder = 'ASC'
        } = searchDto;

        const query = this.restaurantsRepository.createQueryBuilder('restaurant');

        // Uključi photos relaciju za slike restorana
        query.leftJoinAndSelect('restaurant.photos', 'photos');

        // Search po nazivu
        if (search) {
            query.andWhere('restaurant.name ILIKE :search', { search: `%${search}%` });
        }

        // Filter po tipu kuhinje
        if (cuisineType) {
            query.andWhere('restaurant.cuisineType = :cuisineType', { cuisineType });
        }

        // Filter po gradu
        if (city) {
            query.andWhere('restaurant.city ILIKE :city', { city: `%${city}%` });
        }

        // Filter po minimalnoj ocjeni
        if (minRating !== undefined) {
            query.andWhere('restaurant.averageRating >= :minRating', { minRating });
        }

        // Samo verificirani restorani
        if (verifiedOnly) {
            query.andWhere('restaurant.verified = :verified', { verified: true });
        }

        // Filter po maksimalnom cjenovnom razredu
        if (maxPriceRange !== undefined) {
            query.andWhere('restaurant.priceRange <= :maxPriceRange', { maxPriceRange });
        }

        // Sorting
        const allowedSortFields = ['name', 'averageRating', 'createdAt', 'priceRange'];
        const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'name';
        query.orderBy(`restaurant.${safeSortBy}`, sortOrder);

        // Pagination
        const skip = (page - 1) * limit;
        query.skip(skip).take(limit);

        // Execute query
        const [restaurants, total] = await query.getManyAndCount();

        return {
            data: restaurants,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * HELPER: Ažuriranje prosječne ocjene restorana
     * Izračunava prosječnu ocjenu i ukupan broj ocjena za restoran
     */
    public async updateRestaurantRating(restaurantId: number): Promise<void> {
        // Dohvati sve ocjene restorana
        const ratings = await this.ratingsService.findByRestaurantId(restaurantId);

        const totalRatings = ratings.length;
        const averageRating = totalRatings > 0
            ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
            : 0;

        // Ažuriraj restoran
        await this.restaurantsRepository.update(restaurantId, {
            averageRating: parseFloat(averageRating.toFixed(2)),
            totalRatings,
        });
    }

    /**
     * HELPER: Broj svih restorana (za admin dashboard)
     */
    public async count(): Promise<number> {
        return await this.restaurantsRepository.count();
    }
}