import { BadRequestException, ConflictException, Injectable, RequestTimeoutException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { CreateRestaurantDto } from "../dtos/create-restaurant.dto";
import { UpdateRestaurantDto } from "../dtos/update-restaurant.dto";

import { Restaurant } from "../entities/restaurant.entity";
import { FindRestaurantProvider } from "./find-restaurant.provider";

@Injectable()
export class RestaurantsService {

    constructor(
        @InjectRepository(Restaurant)
        private RestaurantsRepository: Repository<Restaurant>,

        private readonly findRestaurantProvider: FindRestaurantProvider,
    ) {}

    public async getAllRestaurants() {
        return await this.RestaurantsRepository.find();
    }

    public async getRestaurant(id: number) {
        return await this.findRestaurantProvider.findOneById(id);
    }

    public async createRestaurant(createRestaurantDto: CreateRestaurantDto) {
        let Restaurant: Restaurant | null;
        
        /* nadi mi Restauranta s emailom koji je dosao na endpoint */
        try {
            Restaurant = await this.findRestaurantProvider.findOneByEmail(createRestaurantDto.email!);
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
        if (Restaurant) {
            throw new BadRequestException('Restaurant already exists, please check your email.');
        }
        const newRestaurant = this.RestaurantsRepository.create(createRestaurantDto);

        /* kreiraj Restauranta */
        try {
            return await this.RestaurantsRepository.save(newRestaurant);
        } catch (error: unknown) {
            const errMessage = (error as Error).message;
            if (error instanceof Error && 'detail' in error) {
                const detail = (error as { detail: string }).detail;
                if (detail.includes('email')) {
                    throw new ConflictException('Email must be unique');
                }
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
        let Restaurant: Restaurant | null;

        /* nadi mi Restauranta po id-u koji je dosao na endpoint */
        try {
            Restaurant = await this.findRestaurantProvider.findOneById(id);
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
        if (!Restaurant) {
            throw new BadRequestException('Restaurant does not exist');
        }

        Restaurant.name = updateRestaurantDto.name ?? Restaurant.name;
        Restaurant.email = updateRestaurantDto.email ?? Restaurant.email;
        Restaurant.role = updateRestaurantDto.role ?? Restaurant.role;

        try {
            await this.RestaurantsRepository.save(Restaurant);
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
        return Restaurant;
    }

    public async removeRestaurant(id: number) {
        const result = await this.RestaurantsRepository.delete(id);
        return { deleted: result.affected! > 0 ? true : false, id}
    }
}