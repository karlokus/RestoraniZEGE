import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Comment } from '../entities/comment.entity';
import { CreateCommentDto } from '../dtos/create-comment.dto';
import { UpdateCommentDto } from '../dtos/update-comment.dto';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { RestaurantsService } from 'src/restaurants/providers/restaurants.service';

@Injectable()
export class CommentsService {
    constructor(
        @InjectRepository(Comment)
        private readonly commentsRepository: Repository<Comment>,

        private readonly restaurantsService: RestaurantsService,
    ) {}

    /**
     * Kreiranje novog komentara
     */
    public async create(createCommentDto: CreateCommentDto, userId: number): Promise<Comment> {
        // Provjeri da restoran postoji
        const restaurant = await this.restaurantsService.getRestaurant(createCommentDto.restaurantId);

        if (!restaurant) {
            throw new NotFoundException('Restaurant not found.');
        }

        // Kreiraj komentar
        const comment = this.commentsRepository.create({
            content: createCommentDto.content,
            user: { id: userId },
            restaurant: { id: createCommentDto.restaurantId },
        });

        return await this.commentsRepository.save(comment);
    }

    /**
     * Dohvat svih komentara
     */
    public async findAll(): Promise<Comment[]> {
        return await this.commentsRepository.find();
    }

    /**
     * Dohvat komentara po ID-u
     */
    public async findById(id: number): Promise<Comment> {
        const comment = await this.commentsRepository.findOne({
            where: { id },
            relations: ['user', 'restaurant'],
        });

        if (!comment) {
            throw new NotFoundException('Comment not found.');
        }

        return comment;
    }

    /**
     * Dohvat svih vidljivih komentara restorana
     * PUBLIC endpoint - vraća samo vidljive komentare
     */
    public async findByRestaurant(restaurantId: number): Promise<Comment[]> {
        return await this.commentsRepository.find({
            where: {
                restaurant: { id: restaurantId },
                isVisible: true, // Samo vidljivi komentari
            },
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });
    }

    /**
     * Dohvat svih komentara korisnika
     */
    public async findByUser(userId: number): Promise<Comment[]> {
        return await this.commentsRepository.find({
            where: { user: { id: userId } },
            relations: ['restaurant'],
            order: { createdAt: 'DESC' },
        });
    }

    /**
     * Ažuriranje komentara
     * Samo vlasnik može ažurirati svoj komentar
     */
    public async update(
        id: number,
        updateCommentDto: UpdateCommentDto,
        userId: number,
    ): Promise<Comment> {
        const comment = await this.commentsRepository.findOne({
            where: { id },
            relations: ['user'],
        });

        if (!comment) {
            throw new NotFoundException('Comment not found.');
        }

        // Provjeri vlasništvo
        if (comment.user.id !== userId) {
            throw new ForbiddenException('You can only update your own comments.');
        }

        // Ažuriraj sadržaj
        comment.content = updateCommentDto.content;

        return await this.commentsRepository.save(comment);
    }

    /**
     * Brisanje komentara
     * Samo vlasnik ili admin može obrisati komentar
     */
    public async delete(id: number, userId: number, isAdmin: boolean = false): Promise<void> {
        const comment = await this.commentsRepository.findOne({
            where: { id },
            relations: ['user'],
        });

        if (!comment) {
            throw new NotFoundException('Comment not found.');
        }

        // Admin može obrisati sve, vlasnik samo svoj komentar
        if (!isAdmin && comment.user.id !== userId) {
            throw new ForbiddenException('You can only delete your own comments.');
        }

        await this.commentsRepository.remove(comment);
    }

    /**
     * Sakrivanje komentara (samo admin)
     * Admin postavlja isVisible=false umjesto potpunog brisanja
     */
    public async hideComment(id: number): Promise<Comment> {
        const comment = await this.commentsRepository.findOne({
            where: { id },
        });

        if (!comment) {
            throw new NotFoundException('Comment not found.');
        }

        comment.isVisible = false;

        return await this.commentsRepository.save(comment);
    }

    /**
     * Prikazivanje komentara (samo admin)
     * Admin postavlja isVisible=true
     */
    public async showComment(id: number): Promise<Comment> {
        const comment = await this.commentsRepository.findOne({
            where: { id },
        });

        if (!comment) {
            throw new NotFoundException('Comment not found.');
        }

        comment.isVisible = true;

        return await this.commentsRepository.save(comment);
    }

    /**
     * HELPER: Dohvat najnovijih komentara (za admin dashboard)
     */
    public async findRecent(limit: number): Promise<Comment[]> {
        return await this.commentsRepository.find({
            relations: ['user', 'restaurant'],
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
}