import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Repository } from "typeorm";
import { Favorite } from "../entities/favorite.entity";
import { InjectRepository } from "@nestjs/typeorm";


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
}