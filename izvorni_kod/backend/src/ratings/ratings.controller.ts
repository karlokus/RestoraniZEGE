import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Req,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
} from '@nestjs/swagger';

import { RatingsService } from './providers/ratings.service';
import { CreateRatingDto } from './dtos/create-rating.dto';
import { UpdateRatingDto } from './dtos/update-rating.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { AuthType } from 'src/auth/enums/auth-type.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { REQUEST_USER_KEY } from 'src/auth/constants/auth.constants';
import { UserRole } from 'src/users/enums/userRole.enum';

/**
 * RatingsController - Upravljanje ocjenama restorana
 *
 * RBAC:
 * - Public: Pregled ocjena restorana
 * - Authenticated: Kreiranje ocjene, pregled vlastitih ocjena
 * - Owner: Ažuriranje/brisanje vlastite ocjene
 * - Admin: Brisanje svih ocjena
 */
@ApiTags('Ratings')
@Controller('ratings')
export class RatingsController {
    constructor(private readonly ratingsService: RatingsService) {}

    /**
     * POST /ratings - Kreiranje nove ocjene
     * AUTHENTICATED - samo prijavljeni korisnici mogu ocjenjivati
     */
    @Post()
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Kreiranje nove ocjene restorana -> user daje ocjenu restoranu' })
    @ApiResponse({ status: 201, description: 'Ocjena uspješno kreirana' })
    @ApiResponse({ status: 400, description: 'Restoran već ocijenjen' })
    @ApiResponse({ status: 401, description: 'Korisnik nije autentificiran' })
    @ApiResponse({ status: 404, description: 'Restoran nije pronađen' })
    public async createRating(
        @Body() createRatingDto: CreateRatingDto,
        @Req() request,
    ) {
        const userId = request[REQUEST_USER_KEY].sub;
        return this.ratingsService.create(createRatingDto, userId);
    }

    /**
     * GET /ratings/restaurant/:restaurantId - Dohvat ocjena restorana
     * PUBLIC endpoint
     */
    @Get('restaurant/:restaurantId')
    @Auth(AuthType.None)
    @ApiOperation({ summary: 'Dohvat svih ocjena restorana (javno)' })
    @ApiParam({ name: 'restaurantId', description: 'ID restorana', type: 'number', example: 1 })
    @ApiResponse({ status: 200, description: 'Lista ocjena restorana' })
    public async getRatingsByRestaurant(@Param('restaurantId') restaurantId: string) {
        return this.ratingsService.findByRestaurant(+restaurantId);
    }

    /**
     * GET /ratings/my-ratings - Dohvat ocjena prijavljenog korisnika
     * AUTHENTICATED - samo za prijavljene korisnike
     */
    @Get('my-ratings')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Dohvat ocjena prijavljenog korisnika' })
    @ApiResponse({ status: 200, description: 'Lista korisničkih ocjena' })
    @ApiResponse({ status: 401, description: 'Korisnik nije autentificiran' })
    public async getMyRatings(@Req() request) {
        const userId = request[REQUEST_USER_KEY].sub;
        return this.ratingsService.findByUser(userId);
    }

    /**
     * GET /ratings/:id - Dohvat ocjene po ID-u
     * PUBLIC endpoint
     */
    @Get(':id')
    @Auth(AuthType.None)
    @ApiOperation({ summary: 'Dohvat ocjene po ID-u' })
    @ApiParam({ name: 'id', description: 'ID ocjene', type: 'number', example: 1 })
    @ApiResponse({ status: 200, description: 'Ocjena pronađena' })
    @ApiResponse({ status: 404, description: 'Ocjena nije pronađena' })
    public async getRating(@Param('id') id: string) {
        return this.ratingsService.findById(+id);
    }

    /**
     * PATCH /ratings/:id - Ažuriranje ocjene
     * Samo vlasnik može ažurirati svoju ocjenu
     * Ownership provjera u servisu
     */
    @Patch(':id')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Ažuriranje ocjene (samo vlasnik)' })
    @ApiParam({ name: 'id', description: 'ID ocjene', type: 'number', example: 1 })
    @ApiResponse({ status: 200, description: 'Ocjena ažurirana' })
    @ApiResponse({ status: 403, description: 'Zabranjen pristup - niste vlasnik ocjene' })
    @ApiResponse({ status: 404, description: 'Ocjena nije pronađena' })
    public async updateRating(
        @Param('id') id: string,
        @Body() updateRatingDto: UpdateRatingDto,
        @Req() request,
    ) {
        const userId = request[REQUEST_USER_KEY].sub;
        return this.ratingsService.update(+id, updateRatingDto, userId);
    }

    /**
     * DELETE /ratings/:id - Brisanje ocjene
     * Vlasnik može obrisati svoju ocjenu, admin sve ocjene
     */
    @Delete(':id')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Brisanje ocjene (vlasnik ili admin)' })
    @ApiParam({ name: 'id', description: 'ID ocjene', type: 'number', example: 1 })
    @ApiResponse({ status: 200, description: 'Ocjena obrisana' })
    @ApiResponse({ status: 403, description: 'Zabranjen pristup - niste vlasnik ocjene' })
    @ApiResponse({ status: 404, description: 'Ocjena nije pronađena' })
    public async deleteRating(@Param('id') id: string, @Req() request) {
        const userId = request[REQUEST_USER_KEY].sub;
        const userRole = request[REQUEST_USER_KEY].role;
        const isAdmin = userRole === UserRole.admin;

        await this.ratingsService.delete(+id, userId, isAdmin);

        return { message: 'Rating successfully deleted' };
    }
}