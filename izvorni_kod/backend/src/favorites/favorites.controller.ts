import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { AuthType } from 'src/auth/enums/auth-type.enum';
import { FavoritesService } from './providers/favorites.service';
import { REQUEST_USER_KEY } from 'src/auth/constants/auth.constants';

@Controller('favorites')
export class FavoritesController {

    constructor(
        private readonly favoritesService: FavoritesService,
    ) {}

    @Get()
    public getAllRestaurants(
        @Req () request,
    ) {
        return this.favoritesService.getFavorites(request[REQUEST_USER_KEY].sub);
    }

    @Post()
    public addFavorite(
        @Req () request,
        @Body('restaurantId') restaurantId: number,
    ) {
        return this.favoritesService.addFavorite(request['user'].sub, restaurantId);
    }

    @Delete(':restaurantId')
    public removeRestaurant(
        @Req () request,
        @Param('restaurantId') restaurantId: string,
    ) {
        return this.favoritesService.removeFavorite(request['user'].sub, +restaurantId);         // todo -> poljepšati ovo s userom
    }
}