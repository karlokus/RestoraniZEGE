import {
    Controller,
    Get,
    Patch,
    Delete,
    Param,
    Req,
    ParseIntPipe,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
} from '@nestjs/swagger';
import { NotificationsService } from './providers/notifications.service';
import { REQUEST_USER_KEY } from 'src/auth/constants/auth.constants';

@ApiTags('Notifications')
@Controller('notifications')
@ApiBearerAuth('access-token')
export class NotificationsController {
    constructor(
        private readonly notificationsService: NotificationsService,
    ) {}

    @Get()
    @ApiOperation({ summary: 'Dohvat svih notifikacija trenutnog korisnika' })
    @ApiResponse({ status: 200, description: 'Lista notifikacija' })
    async getNotifications(@Req() request) {
        const userId = request[REQUEST_USER_KEY].sub;
        return this.notificationsService.findByUser(userId);
    }

    @Get('unread')
    @ApiOperation({ summary: 'Dohvat nepročitanih notifikacija' })
    @ApiResponse({ status: 200, description: 'Lista nepročitanih notifikacija' })
    async getUnreadNotifications(@Req() request) {
        const userId = request[REQUEST_USER_KEY].sub;
        return this.notificationsService.findUnreadByUser(userId);
    }

    @Get('unread/count')
    @ApiOperation({ summary: 'Broj nepročitanih notifikacija' })
    @ApiResponse({ status: 200, description: 'Broj nepročitanih notifikacija' })
    async getUnreadCount(@Req() request) {
        const userId = request[REQUEST_USER_KEY].sub;
        const count = await this.notificationsService.countUnread(userId);
        return { count };
    }

    @Patch(':id/read')
    @ApiOperation({ summary: 'Označavanje notifikacije kao pročitane' })
    @ApiParam({ name: 'id', type: 'number' })
    @ApiResponse({ status: 200, description: 'Notifikacija označena kao pročitana' })
    @ApiResponse({ status: 404, description: 'Notifikacija nije pronađena' })
    async markAsRead(
        @Param('id', ParseIntPipe) id: number,
        @Req() request,
    ) {
        const userId = request[REQUEST_USER_KEY].sub;
        return this.notificationsService.markAsRead(id, userId);
    }

    @Patch('read-all')
    @ApiOperation({ summary: 'Označavanje svih notifikacija kao pročitane' })
    @ApiResponse({ status: 200, description: 'Sve notifikacije označene kao pročitane' })
    async markAllAsRead(@Req() request) {
        const userId = request[REQUEST_USER_KEY].sub;
        await this.notificationsService.markAllAsRead(userId);
        return { message: 'All notifications marked as read' };
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Brisanje notifikacije' })
    @ApiParam({ name: 'id', type: 'number' })
    @ApiResponse({ status: 200, description: 'Notifikacija obrisana' })
    @ApiResponse({ status: 404, description: 'Notifikacija nije pronađena' })
    async deleteNotification(
        @Param('id', ParseIntPipe) id: number,
        @Req() request,
    ) {
        const userId = request[REQUEST_USER_KEY].sub;
        await this.notificationsService.delete(id, userId);
        return { message: 'Notification deleted' };
    }
}
