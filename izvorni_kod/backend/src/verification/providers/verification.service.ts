import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { VerificationRequest } from '../entities/verification-request.entity';
import { RequestVerificationDto } from '../dtos/request-verification.dto';
import { ReviewVerificationDto } from '../dtos/review-verification.dto';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { VerificationStatus } from '../enums/verification-status.enum';
import { RestaurantsService } from 'src/restaurants/providers/restaurants.service';
import { UpdateRestaurantDto } from 'src/restaurants/dtos/update-restaurant.dto';

@Injectable()
export class VerificationService {
    constructor(
        @InjectRepository(VerificationRequest)
        private readonly verificationRequestRepository: Repository<VerificationRequest>,

        private readonly restaurantsService: RestaurantsService,
    ) {}

    /**
     * Kreiranje zahtjeva za verifikaciju
     * Samo vlasnik restorana može poslati zahtjev
     */
    public async requestVerification(
        requestVerificationDto: RequestVerificationDto,
        userId: number,
    ): Promise<VerificationRequest> {
        // Dohvati restoran i provjeri vlasništvo
        const restaurant = await this.restaurantsService.getRestaurant(requestVerificationDto.restaurantId);

        if (!restaurant) {
            throw new NotFoundException('Restaurant not found.');
        }

        // Provjeri je li korisnik vlasnik restorana
        if (restaurant.user.id !== userId) {
            throw new ForbiddenException('You do not own this restaurant.');
        }

        // Provjeri je li restoran već verificiran
        if (restaurant.verified) {
            throw new BadRequestException('Restaurant is already verified.');
        }

        // Provjeri postoji li već pending zahtjev
        const existingRequest = await this.verificationRequestRepository.findOne({
            where: {
                restaurant: { id: requestVerificationDto.restaurantId },
                status: VerificationStatus.PENDING,
            },
        });

        if (existingRequest) {
            throw new BadRequestException('A pending verification request already exists for this restaurant.');
        }

        // Kreiraj novi zahtjev
        const verificationRequest = this.verificationRequestRepository.create({
            restaurant: { id: requestVerificationDto.restaurantId },
            status: VerificationStatus.PENDING,
        });

        return await this.verificationRequestRepository.save(verificationRequest);
    }

    /**
     * Dohvat svih pending zahtjeva
     * Samo admin može vidjeti sve pending zahtjeve
     */
    public async findAllPending(): Promise<VerificationRequest[]> {
        return await this.verificationRequestRepository.find({
            where: { status: VerificationStatus.PENDING },
            relations: ['restaurant', 'restaurant.user'],
            order: { createdAt: 'ASC' },
        });
    }

    /**
     * Dohvat svih zahtjeva (svi statusi)
     * Samo admin može vidjeti sve zahtjeve
     */
    public async findAll(): Promise<VerificationRequest[]> {
        return await this.verificationRequestRepository.find({
            relations: ['restaurant', 'admin'],
            order: { createdAt: 'DESC' },
        });
    }

    /**
     * Dohvat zahtjeva po ID-u
     */
    public async findById(id: number): Promise<VerificationRequest> {
        const request = await this.verificationRequestRepository.findOne({
            where: { id },
            relations: ['restaurant', 'restaurant.user', 'admin'],
        });

        if (!request) {
            throw new NotFoundException('Verification request not found.');
        }

        return request;
    }

    /**
     * Dohvat zahtjeva po restoranu
     * Vlasnik ili admin može vidjeti povijest zahtjeva
     */
    public async findByRestaurant(restaurantId: number): Promise<VerificationRequest[]> {
        return await this.verificationRequestRepository.find({
            where: { restaurant: { id: restaurantId } },
            relations: ['admin'],
            order: { createdAt: 'DESC' },
        });
    }

    /**
     * Odobravanje zahtjeva za verifikaciju
     * Samo admin može odobriti zahtjev
     */
    public async approve(requestId: number, adminId: number): Promise<VerificationRequest> {
        const request = await this.verificationRequestRepository.findOne({
            where: { id: requestId },
            relations: ['restaurant'],
        });

        if (!request) {
            throw new NotFoundException('Verification request not found.');
        }

        if (request.status !== VerificationStatus.PENDING) {
            throw new BadRequestException('Only pending requests can be approved.');
        }

        // Ažuriraj zahtjev
        request.status = VerificationStatus.APPROVED;
        request.admin = { id: adminId } as any;
        request.reviewedAt = new Date();

        const updatedRequest = await this.verificationRequestRepository.save(request);

        // Ažuriraj restoran - postavi verified=true
        const updateRestaurantDto: UpdateRestaurantDto = {
            verified: true,
        };
        await this.restaurantsService.updateRestaurant(updateRestaurantDto, request.restaurant.id);

        return updatedRequest;
    }

    /**
     * Odbijanje zahtjeva za verifikaciju
     * Samo admin može odbiti zahtjev
     */
    public async reject(
        requestId: number,
        adminId: number,
        reviewDto: ReviewVerificationDto,
    ): Promise<VerificationRequest> {
        const request = await this.verificationRequestRepository.findOne({
            where: { id: requestId },
            relations: ['restaurant'],
        });

        if (!request) {
            throw new NotFoundException('Verification request not found.');
        }

        if (request.status !== VerificationStatus.PENDING) {
            throw new BadRequestException('Only pending requests can be rejected.');
        }

        // Validacija - obavezan rejection reason
        if (!reviewDto.rejectionReason || reviewDto.rejectionReason.trim() === '') {
            throw new BadRequestException('Rejection reason is required when rejecting a request.');
        }

        // Ažuriraj zahtjev
        request.status = VerificationStatus.REJECTED;
        request.admin = { id: adminId } as any;
        request.reviewedAt = new Date();
        request.rejectionReason = reviewDto.rejectionReason;

        return await this.verificationRequestRepository.save(request);
    }

    /**
     * HELPER: Broj pending zahtjeva (za admin dashboard)
     */
    public async countPending(): Promise<number> {
        return await this.verificationRequestRepository.count({
            where: { status: VerificationStatus.PENDING },
        });
    }
}