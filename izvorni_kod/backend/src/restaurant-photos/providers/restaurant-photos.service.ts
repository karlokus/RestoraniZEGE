import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { cloudinary } from 'src/config/cloudinary.config';

import { RestaurantPhoto } from '../entities/restaurant-photo.entity';
import { RestaurantsService } from 'src/restaurants/providers/restaurants.service';

@Injectable()
export class RestaurantPhotosService {
    constructor(
        @InjectRepository(RestaurantPhoto)
        private readonly restaurantPhotosRepository: Repository<RestaurantPhoto>,

        private readonly restaurantsService: RestaurantsService,
    ) {}

    /**
     * Upload slike restorana
     * Provjera ownership - samo vlasnik restorana može uploadati slike
     */
    public async upload(
        restaurantId: number,
        file: Express.Multer.File,
        userId: number,
    ): Promise<RestaurantPhoto> {
        if (!file) {
            throw new BadRequestException('File is required.');
        }

        // Dohvati restoran i provjeri vlasništvo
        const restaurant = await this.restaurantsService.getRestaurant(restaurantId);

        if (!restaurant) {
            throw new NotFoundException('Restaurant not found.');
        }

        // Provjeri je li korisnik vlasnik restorana
        if (restaurant.user.id !== userId) {
            throw new ForbiddenException('You do not own this restaurant.');
        }

        // Cloudinary sprema file i vraća URL u file.path
        const photoUrl = (file as any).path; // Cloudinary URL

        // Kreiraj zapis u bazi
        const photo = this.restaurantPhotosRepository.create({
            photoUrl,
            restaurant: { id: restaurantId },
            isPrimary: false,
        });

        return await this.restaurantPhotosRepository.save(photo);
    }

    /**
     * Dohvat svih slika restorana
     * PUBLIC endpoint
     */
    public async findByRestaurant(restaurantId: number): Promise<RestaurantPhoto[]> {
        return await this.restaurantPhotosRepository.find({
            where: { restaurant: { id: restaurantId } },
            order: { isPrimary: 'DESC', uploadedAt: 'DESC' },
        });
    }

    /**
     * Dohvat slike po ID-u
     */
    public async findById(id: number): Promise<RestaurantPhoto> {
        const photo = await this.restaurantPhotosRepository.findOne({
            where: { id },
            relations: ['restaurant', 'restaurant.user'],
        });

        if (!photo) {
            throw new NotFoundException('Photo not found.');
        }

        return photo;
    }

    /**
     * Postavljanje glavne slike restorana
     * Samo vlasnik može postaviti glavnu sliku
     */
    public async setPrimary(photoId: number, userId: number): Promise<RestaurantPhoto> {
        const photo = await this.findById(photoId);

        // Provjeri vlasništvo
        if (photo.restaurant.user.id !== userId) {
            throw new ForbiddenException('You do not own this restaurant.');
        }

        // Makni isPrimary sa svih ostalih slika tog restorana
        await this.restaurantPhotosRepository.update(
            { restaurant: { id: photo.restaurant.id } },
            { isPrimary: false },
        );

        // Postavi ovu sliku kao primarnu
        photo.isPrimary = true;

        return await this.restaurantPhotosRepository.save(photo);
    }

    /**
     * Brisanje slike
     * Samo vlasnik ili admin može obrisati sliku
     */
    public async delete(photoId: number, userId: number, isAdmin: boolean = false): Promise<void> {
        const photo = await this.findById(photoId);

        // Admin može obrisati sve, vlasnik samo svoje slike
        if (!isAdmin && photo.restaurant.user.id !== userId) {
            throw new ForbiddenException('You can only delete photos from your own restaurant.');
        }

        // Izvuci public_id iz Cloudinary URL-a
        const publicId = this.extractPublicId(photo.photoUrl);

        try {
            // Obriši sliku s Cloudinaryja
            if (publicId) {
                await cloudinary.uploader.destroy(publicId);
            }
        } catch (error) {
            console.error('Error deleting file from Cloudinary:', error);
            // Nastavi dalje - obriši zapis iz baze čak i ako Cloudinary brisanje ne uspije
        }

        // Obriši zapis iz baze
        await this.restaurantPhotosRepository.remove(photo);
    }

    /**
     * Helper metoda za izvlačenje public_id iz Cloudinary URL-a
     * URL format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{folder}/{public_id}.{format}
     */
    private extractPublicId(url: string): string | null {
        try {
            const parts = url.split('/');
            const uploadIndex = parts.indexOf('upload');
            if (uploadIndex === -1) return null;

            // Uzmi sve nakon 'upload/v{version}/'
            const pathParts = parts.slice(uploadIndex + 2); // Preskači 'upload' i verziju
            const fullPath = pathParts.join('/');
            
            // Ukloni ekstenziju
            return fullPath.replace(/\.[^/.]+$/, '');
        } catch (error) {
            console.error('Error extracting public_id:', error);
            return null;
        }
    }
}