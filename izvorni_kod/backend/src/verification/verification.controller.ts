import {
    Controller,
    Get,
    Post,
    Patch,
    Body,
    Param,
    Req,
    UseGuards,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
} from '@nestjs/swagger';

import { VerificationService } from './providers/verification.service';
import { RequestVerificationDto } from './dtos/request-verification.dto';
import { ReviewVerificationDto } from './dtos/review-verification.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { REQUEST_USER_KEY } from 'src/auth/constants/auth.constants';
import { UserRole } from 'src/users/enums/userRole.enum';
import { VerificationStatus } from './enums/verification-status.enum';
import { OwnershipGuard } from 'src/auth/guards/ownership/ownership.guard';

/**
 * VerificationController - Upravljanje verifikacijom restorana
 *
 * RBAC:
 * - Restaurant owner: Slanje zahtjeva za verifikaciju, pregled povijesti vlastitog restorana
 * - Admin: Pregled svih pending zahtjeva, odobravanje/odbijanje zahtjeva
 */
@ApiTags('Verification')
@Controller('verification')
export class VerificationController {
    constructor(private readonly verificationService: VerificationService) {}

    /**
     * POST /verification/request - Slanje zahtjeva za verifikaciju
     * Samo vlasnik restorana može poslati zahtjev
     */
    @Post('request')
    @Roles(UserRole.restaurant, UserRole.admin)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Slanje zahtjeva za verifikaciju restorana (samo vlasnik)' })
    @ApiResponse({ status: 201, description: 'Zahtjev uspješno poslan' })
    @ApiResponse({ status: 400, description: 'Restoran već verificiran ili postoji pending zahtjev' })
    @ApiResponse({ status: 403, description: 'Zabranjen pristup - niste vlasnik restorana' })
    @ApiResponse({ status: 404, description: 'Restoran nije pronađen' })
    public async requestVerification(
        @Body() requestVerificationDto: RequestVerificationDto,
        @Req() request,
    ) {
        const userId = request[REQUEST_USER_KEY].sub;
        return this.verificationService.requestVerification(requestVerificationDto, userId);
    }

    /**
     * GET /verification/pending - Dohvat svih pending zahtjeva
     * Samo admin može vidjeti sve pending zahtjeve
     */
    @Get('pending')
    @Roles(UserRole.admin)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Dohvat svih pending zahtjeva za verifikaciju (samo admin)' })
    @ApiResponse({ status: 200, description: 'Lista pending zahtjeva' })
    @ApiResponse({ status: 403, description: 'Zabranjen pristup - samo admin' })
    public async getPendingRequests() {
        return this.verificationService.findAllPending();
    }

    /**
     * GET /verification/all - Dohvat svih zahtjeva
     * Samo admin može vidjeti sve zahtjeve (svi statusi)
     */
    @Get('all')
    @Roles(UserRole.admin)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Dohvat svih zahtjeva za verifikaciju (samo admin)' })
    @ApiResponse({ status: 200, description: 'Lista svih zahtjeva' })
    @ApiResponse({ status: 403, description: 'Zabranjen pristup - samo admin' })
    public async getAllRequests() {
        return this.verificationService.findAll();
    }

    /**
     * GET /verification/restaurant/:restaurantId - Povijest zahtjeva restorana
     * Vlasnik ili admin može vidjeti povijest
     */
    @Get('restaurant/:restaurantId')
    @Roles(UserRole.admin, UserRole.restaurant)
    @UseGuards(OwnershipGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Dohvat povijesti zahtjeva za verifikaciju restorana (vlasnik ili admin)' })
    @ApiParam({ name: 'restaurantId', description: 'ID restorana', type: 'number', example: 1 })
    @ApiResponse({ status: 200, description: 'Povijest zahtjeva restorana' })
    @ApiResponse({ status: 401, description: 'Korisnik nije autentificiran' })
    public async getRestaurantRequests(@Param('restaurantId') restaurantId: string) {
        return this.verificationService.findByRestaurant(+restaurantId);
    }

    /**
     * GET /verification/:id - Detalji zahtjeva
     * Authenticated endpoint
     */
    @Get(':id')
    @Roles(UserRole.admin, UserRole.restaurant)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Dohvat detalja zahtjeva za verifikaciju (vlasnik ili admin)' })
    @ApiParam({ name: 'id', description: 'ID zahtjeva', type: 'number', example: 1 })
    @ApiResponse({ status: 200, description: 'Detalji zahtjeva' })
    @ApiResponse({ status: 404, description: 'Zahtjev nije pronađen' })
    public async getRequest(@Param('id') id: string) {
        return this.verificationService.findById(+id);
    }

    /**
     * PATCH /verification/:id/approve - Odobravanje zahtjeva
     * Samo admin može odobriti zahtjev
     */
    @Patch(':id/approve')
    @Roles(UserRole.admin)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Odobravanje zahtjeva za verifikaciju (samo admin)' })
    @ApiParam({ name: 'id', description: 'ID zahtjeva', type: 'number', example: 1 })
    @ApiResponse({ status: 200, description: 'Zahtjev odobren, restoran verificiran' })
    @ApiResponse({ status: 400, description: 'Zahtjev nije pending' })
    @ApiResponse({ status: 403, description: 'Zabranjen pristup - samo admin' })
    @ApiResponse({ status: 404, description: 'Zahtjev nije pronađen' })
    public async approveRequest(
        @Param('id') id: string, 
        @Req() request
    ) {
        const adminId = request[REQUEST_USER_KEY].sub;
        return this.verificationService.approve(+id, adminId);
    }

    /**
     * PATCH /verification/:id/reject - Odbijanje zahtjeva
     * Samo admin može odbiti zahtjev
     */
    @Patch(':id/reject')
    @Roles(UserRole.admin)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Odbijanje zahtjeva za verifikaciju (samo admin)' })
    @ApiParam({ name: 'id', description: 'ID zahtjeva', type: 'number', example: 1 })
    @ApiResponse({ status: 200, description: 'Zahtjev odbijen' })
    @ApiResponse({ status: 400, description: 'Zahtjev nije pending ili nedostaje razlog odbijanja' })
    @ApiResponse({ status: 403, description: 'Zabranjen pristup - samo admin' })
    @ApiResponse({ status: 404, description: 'Zahtjev nije pronađen' })
    public async rejectRequest(
        @Param('id') id: string,
        @Body() reviewDto: ReviewVerificationDto,
        @Req() request,
    ) {
        const adminId = request[REQUEST_USER_KEY].sub;

        reviewDto.status = VerificationStatus.REJECTED;

        return this.verificationService.reject(+id, adminId, reviewDto);
    }
}