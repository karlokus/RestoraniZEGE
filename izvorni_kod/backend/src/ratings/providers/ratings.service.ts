import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
    Inject,
    forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Rating } from '../entities/rating.entity';
import { CreateRatingDto } from '../dtos/create-rating.dto';
import { UpdateRatingDto } from '../dtos/update-rating.dto';
import { RestaurantsService } from 'src/restaurants/providers/restaurants.service';

@Injectable()
export class RatingsService {
    constructor(
        @InjectRepository(Rating)
        private readonly ratingsRepository: Repository<Rating>,

        @Inject(forwardRef(() => RestaurantsService))
        private readonly restaurantsService: RestaurantsService,
    ) {}

    /**
     * Kreiranje nove ocjene
     * Nakon kreiranja, ažurira prosječnu ocjenu restorana
     */
    public async create(createRatingDto: CreateRatingDto, userId: number): Promise<Rating> {
        // Provjeri da restoran postoji
        const restaurant = await this.restaurantsService.getRestaurant(createRatingDto.restaurantId);


        if (!restaurant) {
            throw new NotFoundException('Restaurant not found.');
        }

        // Provjeri je li korisnik već ocijenio ovaj restoran
        const existingRating = await this.ratingsRepository.findOne({
            where: {
                user: { id: userId },
                restaurant: { id: createRatingDto.restaurantId },
            },
        });

        if (existingRating) {
            throw new BadRequestException('You have already rated this restaurant. Use update instead.');
        }

        // Kreiraj novu ocjenu
        const rating = this.ratingsRepository.create({
            rating: createRatingDto.rating,
            comment: createRatingDto.comment,
            user: { id: userId },
            restaurant: { id: createRatingDto.restaurantId },
        });

        const savedRating = await this.ratingsRepository.save(rating);

        // Ažuriraj prosječnu ocjenu restorana
        await this.restaurantsService.updateRestaurantRating(createRatingDto.restaurantId);

        return savedRating;
    }

    /**
     * Dohvat svih ocjena restorana
     */
    public async findByRestaurant(restaurantId: number): Promise<Rating[]> {
        return await this.ratingsRepository.find({
            where: { restaurant: { id: restaurantId } },
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });
    }

    /**
     * Dohvat svih ocjena restorana
     */
    public async findByRestaurantId(restaurantId: number): Promise<Rating[]> {
        return await this.ratingsRepository.find({
            where: { restaurant: { id: restaurantId } }
        });
    }

    /**
     * Dohvat svih ocjena korisnika
     */
    public async findByUser(userId: number): Promise<Rating[]> {
        return await this.ratingsRepository.find({
            where: { user: { id: userId } },
            relations: ['restaurant'],
            order: { createdAt: 'DESC' },
        });
    }

    /**
     * Dohvat ocjene po ID-u
     */
    public async findById(id: number): Promise<Rating> {
        const rating = await this.ratingsRepository.findOne({
            where: { id },
            relations: ['user', 'restaurant'],
        });

        if (!rating) {
            throw new NotFoundException('Rating not found.');
        }

        return rating;
    }

    /**
     * Ažuriranje ocjene
     * Samo vlasnik može ažurirati svoju ocjenu
     */
    public async update(
        id: number,
        updateRatingDto: UpdateRatingDto,
        userId: number,
    ): Promise<Rating> {
        const rating = await this.ratingsRepository.findOne({
            where: { id },
            relations: ['user', 'restaurant'],
        });

        if (!rating) {
            throw new NotFoundException('Rating not found.');
        }

        // Provjeri vlasništvo
        if (rating.user.id !== userId) {
            throw new ForbiddenException('You can only update your own ratings.');
        }

        // Ažuriraj polja
        if (updateRatingDto.rating !== undefined) {
            rating.rating = updateRatingDto.rating;
        }
        if (updateRatingDto.comment !== undefined) {
            rating.comment = updateRatingDto.comment;
        }

        const updatedRating = await this.ratingsRepository.save(rating);

        // Ažuriraj prosječnu ocjenu restorana
        await this.restaurantsService.updateRestaurantRating(rating.restaurant.id);

        return updatedRating;
    }

    /**
     * Brisanje ocjene
     * Samo vlasnik ili admin može obrisati ocjenu
     */
    public async delete(id: number, userId: number, isAdmin: boolean = false): Promise<void> {
        const rating = await this.ratingsRepository.findOne({
            where: { id },
            relations: ['user', 'restaurant'],
        });

        if (!rating) {
            throw new NotFoundException('Rating not found.');
        }

        // Admin može obrisati sve, vlasnik samo svoju ocjenu
        if (!isAdmin && rating.user.id !== userId) {
            throw new ForbiddenException('You can only delete your own ratings.');
        }

        const restaurantId = rating.restaurant.id;

        await this.ratingsRepository.remove(rating);

        // Ažuriraj prosječnu ocjenu restorana
        await this.restaurantsService.updateRestaurantRating(restaurantId);
    }

    /**
     * HELPER: Ažuriranje prosječne ocjene restorana
     * Izračunava prosječnu ocjenu i ukupan broj ocjena za restoran
     */
    /*private async updateRestaurantRating(restaurantId: number): Promise<void> {
        // Dohvati sve ocjene restorana
        const ratings = await this.ratingsRepository.find({
            where: { restaurant: { id: restaurantId } },
        });

        const totalRatings = ratings.length;
        const averageRating = totalRatings > 0
            ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
            : 0;

        // Ažuriraj restoran
        await this.restaurantsRepository.update(restaurantId, {
            averageRating: parseFloat(averageRating.toFixed(2)),
            totalRatings,
        });
    }*/
}