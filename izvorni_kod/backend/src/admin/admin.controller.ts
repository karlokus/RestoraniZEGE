import { Controller, Get } from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
} from '@nestjs/swagger';

import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/enums/userRole.enum';
import { UsersService } from 'src/users/providers/users.service';
import { RestaurantsService } from 'src/restaurants/providers/restaurants.service';
import { VerificationService } from 'src/verification/providers/verification.service';
import { CommentsService } from 'src/comments/providers/comments.service';

@ApiTags('Admin')
@Controller('admin')
@Roles(UserRole.admin)
@ApiBearerAuth('access-token')
export class AdminController {
    constructor(
        private readonly usersService: UsersService,
        private readonly restaurantsService: RestaurantsService,
        private readonly verificationService: VerificationService,
        private readonly commentsService: CommentsService,
    ) {}

    @Get('dashboard')
    @ApiOperation({ summary: 'Admin dashboard statistika (samo admin)' })
    @ApiResponse({
        status: 200,
        description: 'Dashboard statistika uspješno dohvaćena',
        schema: {
            type: 'object',
            properties: {
                totalUsers: { type: 'number', example: 150 },
                totalRestaurants: { type: 'number', example: 45 },
                pendingVerifications: { type: 'number', example: 8 },
                recentComments: {
                    type: 'array',
                    items: { type: 'object' },
                },
            },
        },
    })
    @ApiResponse({ status: 403, description: 'Zabranjen pristup - niste admin' })
    public async getDashboard() {
        const [totalUsers, totalRestaurants, pendingVerifications, recentComments] = await Promise.all([
            this.usersService.count(),
            this.restaurantsService.count(),
            this.verificationService.countPending(),
            this.commentsService.findRecent(10),
        ]);

        return {
            totalUsers,
            totalRestaurants,
            pendingVerifications,
            recentComments,
        };
    }
}