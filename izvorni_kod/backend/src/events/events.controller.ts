import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
    ApiQuery,
} from '@nestjs/swagger';

import { EventsService } from './providers/events.service';
import { CreateEventDto } from './dtos/create-event.dto';
import { UpdateEventDto } from './dtos/update-event.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { AuthType } from 'src/auth/enums/auth-type.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { REQUEST_USER_KEY } from 'src/auth/constants/auth.constants';
import { UserRole } from 'src/users/enums/userRole.enum';
import { OwnershipGuard } from 'src/auth/guards/ownership/ownership.guard';


@ApiTags('Events')
@Controller('events')
export class EventsController {
    constructor(private readonly eventsService: EventsService) {}

    @Get()
    @Auth(AuthType.None)
    @ApiOperation({ summary: 'Dohvat svih aktivnih evenata (javno)' })
    @ApiQuery({
        name: 'restaurantId',
        required: false,
        description: 'Filter evenata po ID-u restorana',
        type: 'string',
    })
    @ApiResponse({ status: 200, description: 'Lista aktivnih evenata' })
    public async getAllEvents(
        @Query('restaurantId') restaurantId?: string,
    ) {
        return this.eventsService.findAll(restaurantId);
    }

    @Get('my-favorites')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Dohvat evenata omiljenih restorana' })
    @ApiResponse({
        status: 200,
        description: 'Lista evenata restorana koje korisnik ima u favoritima',
    })
    @ApiResponse({ status: 401, description: 'Korisnik nije autentificiran' })
    public async getMyFavoritesEvents(@Req() request) {
        const userId = request[REQUEST_USER_KEY].sub;
        return this.eventsService.findEventsByFavoriteRestaurants(userId);
    }

    @Get(':id')
    @Auth(AuthType.None)
    @ApiOperation({ summary: 'Dohvat eventa po ID-u' })
    @ApiParam({ name: 'id', description: 'UUID eventa', type: 'string' })
    @ApiResponse({ status: 200, description: 'Event pronađen' })
    @ApiResponse({ status: 404, description: 'Event nije pronađen' })
    public async getEvent(@Param('id') id: string) {
        return this.eventsService.findById(id);
    }

    @Post()
    @Roles(UserRole.restaurant, UserRole.admin)
    @UseGuards(OwnershipGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Kreiranje novog eventa (samo vlasnik restorana)' })
    @ApiResponse({ status: 201, description: 'Event uspješno kreiran' })
    @ApiResponse({
        status: 403,
        description: 'Zabranjen pristup - niste vlasnik restorana ili nemate restaurant ulogu',
    })
    @ApiResponse({ status: 404, description: 'Restoran nije pronađen' })
    public async createEvent(
        @Body() createEventDto: CreateEventDto,
        @Req() request,
    ) {
        const userId = request[REQUEST_USER_KEY].sub;
        return this.eventsService.createEvent(createEventDto, userId);
    }

    @Patch(':id')
    @Roles(UserRole.restaurant, UserRole.admin)
    @UseGuards(OwnershipGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Ažuriranje eventa (samo vlasnik restorana)' })
    @ApiParam({ name: 'id', description: 'UUID eventa', type: 'string' })
    @ApiResponse({ status: 200, description: 'Event ažuriran' })
    @ApiResponse({ status: 403, description: 'Zabranjen pristup - niste vlasnik eventa' })
    @ApiResponse({ status: 404, description: 'Event nije pronađen' })
    public async updateEvent(
        @Param('id') id: string,
        @Body() updateEventDto: UpdateEventDto,
        @Req() request,
    ) {
        const userId = request[REQUEST_USER_KEY].sub;
        return this.eventsService.updateEvent(id, updateEventDto, userId);
    }

    @Delete(':id')
    @Roles(UserRole.restaurant, UserRole.admin)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Brisanje eventa (vlasnik ili admin)' })
    @ApiParam({ name: 'id', description: 'UUID eventa', type: 'string' })
    @ApiResponse({ status: 200, description: 'Event obrisan' })
    @ApiResponse({ status: 403, description: 'Zabranjen pristup - niste vlasnik eventa' })
    @ApiResponse({ status: 404, description: 'Event nije pronađen' })
    public async deleteEvent(@Param('id') id: string, @Req() request) {
        const userId = request[REQUEST_USER_KEY].sub;
        const userRole = request[REQUEST_USER_KEY].role;
        const isAdmin = userRole === UserRole.admin;

        await this.eventsService.delete(id, userId, isAdmin);

        return { message: 'Event successfully deleted' };
    }
}
