import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Event } from '../entities/event.entity';
import { CreateEventDto } from '../dtos/create-event.dto';
import { UpdateEventDto } from '../dtos/update-event.dto';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { Favorite } from 'src/favorites/entities/favorite.entity';
import { RestaurantsService } from 'src/restaurants/providers/restaurants.service';
import { FavoritesService } from 'src/favorites/providers/favorites.service';

@Injectable()
export class EventsService {
    constructor(
        @InjectRepository(Event)
        private readonly eventsRepository: Repository<Event>,

        private readonly restaurantsService: RestaurantsService,

        private readonly favoritesService: FavoritesService,
    ) {}

    public async createEvent(createEventDto: CreateEventDto, userId: number): Promise<Event> {
        // Dohvati restoran
        const restaurant = await this.restaurantsService.getRestaurant(+createEventDto.restaurantId);

        if (!restaurant) {
            throw new NotFoundException('Restaurant not found.');
        }

        // Provjeri je li korisnik vlasnik restorana
        if (restaurant.user.id !== userId) {
            throw new ForbiddenException('You do not own this restaurant.');
        }

        // Kreiraj event
        const event = this.eventsRepository.create({
            title: createEventDto.title,
            description: createEventDto.description,
            eventDate: new Date(createEventDto.eventDate),
            imageUrl: createEventDto.imageUrl,
            restaurant: { id: +createEventDto.restaurantId },
        });

        return await this.eventsRepository.save(event);
    }

    public async findAll(restaurantId?: string): Promise<Event[]> {
        const queryBuilder = this.eventsRepository
            .createQueryBuilder('event')
            .leftJoinAndSelect('event.restaurant', 'restaurant')
            .where('event.isActive = :isActive', { isActive: true })
            .orderBy('event.eventDate', 'ASC');

        // Filter po restaurantId ako je proslijeđen
        if (restaurantId) {
            queryBuilder.andWhere('restaurant.id = :restaurantId', {
                restaurantId: +restaurantId
            });
        }

        return await queryBuilder.getMany();
    }
    
    public async findById(id: string): Promise<Event> {
        const event = await this.eventsRepository.findOne({
            where: { id },
            relations: ['restaurant'],
        });

        if (!event) {
            throw new NotFoundException('Event not found.');
        }

        return event;
    }

    public async updateEvent(
        id: string,
        updateEventDto: UpdateEventDto,
        userId: number
    ): Promise<Event> {
        // Dohvati event sa restoranom i vlasnikom
        const event = await this.eventsRepository.findOne({
            where: { id },
            relations: ['restaurant', 'restaurant.user'],
        });

        if (!event) {
            throw new NotFoundException('Event not found.');
        }

        // Provjeri vlasništvo
        if (event.restaurant.user.id !== userId) {
            throw new ForbiddenException('You do not own this event.');
        }

        // Ažuriraj event
        if (updateEventDto.title) {
            event.title = updateEventDto.title;
        }
        if (updateEventDto.description) {
            event.description = updateEventDto.description;
        }
        if (updateEventDto.eventDate) {
            event.eventDate = new Date(updateEventDto.eventDate);
        }
        if (updateEventDto.imageUrl !== undefined) {
            event.imageUrl = updateEventDto.imageUrl;
        }
        if (updateEventDto.isActive !== undefined) {
            event.isActive = updateEventDto.isActive;
        }

        return await this.eventsRepository.save(event);
    }

    /**
     * Brisanje eventa
     * Provjera: korisnik mora biti vlasnik restorana ili admin
     */
    public async delete(id: string, userId: number, isAdmin: boolean = false): Promise<void> {
        const event = await this.eventsRepository.findOne({
            where: { id },
            relations: ['restaurant', 'restaurant.user'],
        });

        if (!event) {
            throw new NotFoundException('Event not found.');
        }

        // Admin može obrisati sve, vlasnik samo svoj event
        if (!isAdmin && event.restaurant.user.id !== userId) {
            throw new ForbiddenException('You do not have permission to delete this event.');
        }

        await this.eventsRepository.remove(event);
    }

    /**
     * Dohvat evenata restorana koje korisnik ima u favoritima (F-006)
     * Vraća sve aktivne evente omiljenih restorana
     */
    public async findEventsByFavoriteRestaurants(userId: number): Promise<Event[]> {
        // Dohvati sve favorite restorane korisnika
        const favorites = await this.favoritesService.getFavorites(userId);

        if (favorites.length === 0) {
            return [];
        }

        // Izvuci restaurant ID-eve
        const restaurantIds = favorites.map(fav => fav.restaurant.id);

        // Dohvati sve aktivne evente tih restorana
        const events = await this.eventsRepository
            .createQueryBuilder('event')
            .leftJoinAndSelect('event.restaurant', 'restaurant')
            .where('event.isActive = :isActive', { isActive: true })
            .andWhere('restaurant.id IN (:...restaurantIds)', { restaurantIds })
            .orderBy('event.eventDate', 'ASC')
            .getMany();

        return events;
    }
}
