import { Body, Controller, Delete, Get, Param, Patch, Post, Req, SetMetadata } from '@nestjs/common';
import { RestaurantsService } from './providers/restaurants.service';
import { CreateRestaurantDto } from './dtos/create-restaurant.dto';
import { UpdateRestaurantDto } from './dtos/update-restaurant.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { AuthType } from 'src/auth/enums/auth-type.enum';

@Controller('restaurants')
export class RestaurantsController {

    constructor(
        private readonly RestaurantsService: RestaurantsService
    ) {}

    @Get()
    @Auth(AuthType.None)
    public getAllRestaurants() {
        return this.RestaurantsService.getAllRestaurants();
    }

    @Get(':id')
    public getRestaurant(
        @Param('id') id: string
    ) {
        return this.RestaurantsService.getRestaurant(+id);
    }

    @Post()
    public createRestaurant(
        @Body() createRestaurantDto: CreateRestaurantDto,
        //@Req() request,
        //@UserPayload() user
        //@UserPayload('email') email                               // todo -> ovo ce trebat za ostale tablice favoriti npr
    ) {
        return this.RestaurantsService.createRestaurant(createRestaurantDto);
    }

    @Patch(':id')
    public updateRestaurant(
        @Param('id') id: string,
        @Body() updateRestaurantDto: UpdateRestaurantDto
    ) {
        return this.RestaurantsService.updateRestaurant(updateRestaurantDto, +id);
    }

    @Delete(':id')
    public removeRestaurant(
        @Param('id') id: string
    ) {
        return this.RestaurantsService.removeRestaurant(+id);
    }
}