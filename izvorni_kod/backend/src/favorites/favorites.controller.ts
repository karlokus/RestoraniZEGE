import { Body, Controller, Delete, Get, Param, Post, Req } from '@nestjs/common';
import { FavoritesService } from './providers/favorites.service';
import { REQUEST_USER_KEY } from 'src/auth/constants/auth.constants';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';


@ApiTags('Favorites')
@ApiBearerAuth('access-token')
@Controller('favorites')
export class FavoritesController {

    constructor(
        private readonly favoritesService: FavoritesService,
    ) {}

    @Get()
    @ApiOperation({ summary: 'Dohvat favorita prijavljenog korisnika' })
    @ApiResponse({
        status: 200,
        description: 'Lista restorana koje je korisnik označio kao favorite',
    })
    @ApiResponse({
        status: 401,
        description: 'Korisnik nije autentificiran',
    })
    public getFavorites(
        @Req() request,
    ) {
        const userId = request[REQUEST_USER_KEY].sub;
        return this.favoritesService.getFavorites(userId);
    }

    @Post()
    @ApiOperation({ summary: 'Dodavanje restorana u favorite' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                restaurantId: {
                    type: 'number',
                    example: 5,
                    description: 'ID restorana koji se dodaje u favorite',
                },
            },
            required: ['restaurantId'],
        },
    })
    @ApiResponse({
        status: 201,
        description: 'Restoran uspješno dodan u favorite',
    })
    @ApiResponse({
        status: 400,
        description: 'Restoran je već u favoritima',
    })
    @ApiResponse({
        status: 404,
        description: 'Restoran ne postoji',
    })
    public addFavorite(
        @Req() request,
        @Body('restaurantId') restaurantId: number,
    ) {
        const userId = request[REQUEST_USER_KEY].sub;
        return this.favoritesService.addFavorite(userId, restaurantId);
    }

    @Delete(':restaurantId')
    @ApiOperation({ summary: 'Uklanjanje restorana iz favorita' })
    @ApiParam({
        name: 'restaurantId',
        type: 'number',
        example: 5,
        description: 'ID restorana koji se uklanja iz favorita',
    })
    @ApiResponse({
        status: 200,
        description: 'Restoran uklonjen iz favorita',
    })
    @ApiResponse({
        status: 404,
        description: 'Restoran nije pronađen u favoritima',
    })
    public removeFavorite(
        @Req() request,
        @Param('restaurantId') restaurantId: string,
    ) {
        const userId = request[REQUEST_USER_KEY].sub;
        return this.favoritesService.removeFavorite(userId, +restaurantId);
    }
}