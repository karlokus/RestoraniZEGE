import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Repository } from "typeorm";
import { Favorite } from "../entities/favorite.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entity";


@Injectable()
export class FavoritesService {

    constructor(
        @InjectRepository(Favorite)
        private readonly favoritesRepository: Repository<Favorite>,
    ) {}

    public async getFavorites(userId: number) {
        return await this.favoritesRepository.find({
            where: { 
                user: { id: userId } 
            },
            relations: ['restaurant'],
        });
    }

    public async addFavorite(userId: number, restaurantId: number) {
        const exists = await this.favoritesRepository.findOne({
            where: {
                user: { id: userId },
                restaurant: { id: restaurantId },
            },
        });

        if (exists) {
            throw new BadRequestException('Restaurant is already in favorites.');
        }

        const favorite = this.favoritesRepository.create({
            user: { id: userId },
            restaurant: { id: restaurantId },
        });

        return await this.favoritesRepository.save(favorite);
    }

    public async removeFavorite(userId: number, restaurantId: number) {
        const favorite = await this.favoritesRepository.findOne({
            where: {
                user: { id: userId },
                restaurant: { id: restaurantId }
            },
        });

        if (!favorite) {
            throw new NotFoundException('Favorite not found.');
        }

        return await this.favoritesRepository.remove(favorite);
    }

    /**
     * Get all users who have favorited a specific restaurant
     * Used for sending notifications when restaurant creates new events
     */
    public async getUsersByFavoritedRestaurant(restaurantId: number): Promise<User[]> {
        const favorites = await this.favoritesRepository.find({
            where: {
                restaurant: { id: restaurantId },
            },
            relations: ['user'],
        });

        // Extract unique users from favorites
        return favorites.map(fav => fav.user);
    }
}