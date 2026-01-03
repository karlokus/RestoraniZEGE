import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Req,
    Query,
    UseGuards,
} from '@nestjs/common';

import { RestaurantsService } from './providers/restaurants.service';
import { CreateRestaurantDto } from './dtos/create-restaurant.dto';
import { UpdateRestaurantDto } from './dtos/update-restaurant.dto';
import { SearchRestaurantsDto } from './dtos/search-restaurants.dto';

import { Auth } from 'src/auth/decorators/auth.decorator';
import { AuthType } from 'src/auth/enums/auth-type.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/enums/userRole.enum';
import { OwnershipGuard } from 'src/auth/guards/ownership/ownership.guard';
import { REQUEST_USER_KEY } from 'src/auth/constants/auth.constants';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Restaurants')
@Controller('restaurants')
export class RestaurantsController {

    constructor(
        private readonly RestaurantsService: RestaurantsService
    ) {}

    @Get()
    @Auth(AuthType.None)
    @ApiOperation({ summary: 'Dohvat svih restorana (javno)' })
    @ApiResponse({ status: 200, description: 'Lista svih restorana' })
    public getAllRestaurants() {
        return this.RestaurantsService.getAllRestaurants();
    }

    @Get('verified')
    @Auth(AuthType.None)
    @ApiOperation({ summary: 'Dohvat verificiranih restorana (javno)' })
    @ApiResponse({ status: 200, description: 'Lista verificiranih restorana' })
    public getAllVerifiedRestaurants() {
        return this.RestaurantsService.getAllVerifiedRestaurants();
    }

    @Get('search')
    @Auth(AuthType.None)
    @ApiOperation({ summary: 'Pretraga i filtriranje restorana (javno)' })
    @ApiResponse({
        status: 200,
        description: 'Lista restorana s pagination i meta podacima',
        schema: {
            type: 'object',
            properties: {
                data: {
                    type: 'array',
                    items: { type: 'object' },
                },
                meta: {
                    type: 'object',
                    properties: {
                        total: { type: 'number' },
                        page: { type: 'number' },
                        limit: { type: 'number' },
                        totalPages: { type: 'number' },
                    },
                },
            },
        },
    })
    public searchRestaurants(@Query() searchDto: SearchRestaurantsDto) {
        return this.RestaurantsService.search(searchDto);
    }

    @Get(':id')
    @Auth(AuthType.None)
    @ApiOperation({ summary: 'Dohvat restorana po ID-u' })
    @ApiParam({ name: 'id', example: 1 })
    @ApiResponse({ status: 200, description: 'Restoran pronađen' })
    @ApiResponse({ status: 404, description: 'Restoran nije pronađen' })
    public getRestaurant(
        @Param('id') id: string
    ) {
        return this.RestaurantsService.getRestaurant(+id);
    }

    @Post()
    @Roles(UserRole.restaurant)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Kreiranje novog restorana (samo restaurant uloga)' })
    @ApiResponse({ status: 201, description: 'Restoran uspješno kreiran' })
    @ApiResponse({ status: 403, description: 'Zabranjen pristup - samo restaurant uloga može kreirati restoran' })
    @ApiResponse({ status: 400, description: 'Neispravni podaci' })
    public createRestaurant(
        @Body() createRestaurantDto: CreateRestaurantDto,
        @Req() request,
    ) {
        const userId = request[REQUEST_USER_KEY].sub;
        return this.RestaurantsService.createRestaurant(createRestaurantDto, userId);
    }

    @Patch(':id')
    @Roles(UserRole.restaurant, UserRole.admin)
    @UseGuards(OwnershipGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Ažuriranje restorana (samo vlasnik ili admin)' })
    @ApiParam({ name: 'id', example: 1 })
    @ApiResponse({ status: 200, description: 'Restoran ažuriran' })
    @ApiResponse({ status: 403, description: 'Zabranjen pristup - niste vlasnik restorana' })
    @ApiResponse({ status: 404, description: 'Restoran nije pronađen' })
    public updateRestaurant(
        @Param('id') id: string,
        @Body() updateRestaurantDto: UpdateRestaurantDto
    ) {
        return this.RestaurantsService.updateRestaurant(updateRestaurantDto, +id);
    }

    @Delete(':id')
    @Roles(UserRole.restaurant, UserRole.admin)
    @UseGuards(OwnershipGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Brisanje restorana (samo vlasnik ili admin)' })
    @ApiParam({ name: 'id', example: 1 })
    @ApiResponse({ status: 200, description: 'Restoran obrisan' })
    @ApiResponse({ status: 403, description: 'Zabranjen pristup - niste vlasnik restorana' })
    @ApiResponse({ status: 404, description: 'Restoran nije pronađen' })
    public removeRestaurant(
        @Param('id') id: string
    ) {
        return this.RestaurantsService.removeRestaurant(+id);
    }
}