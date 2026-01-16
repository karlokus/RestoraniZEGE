import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from '../entities/restaurant.entity';

@Injectable()
export class FindRestaurantProvider {
    constructor(
        @InjectRepository(Restaurant)
        private readonly RestaurantsRepository: Repository<Restaurant>,
    ) {}

    public async findOneById(id: number) {
        return await this.RestaurantsRepository.findOne({
            where: { id },
            relations: ['user'],
        });
    }

    public async findOneByEmail(email: string) {
        return await this.RestaurantsRepository.findOneBy({
            email: email,
        });
    }

    public async findOneByRestaurantname(restaurantName: string) {
        return await this.RestaurantsRepository.findOneBy({
            name: restaurantName,
        });
    }
}