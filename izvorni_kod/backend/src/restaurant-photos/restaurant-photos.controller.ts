import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Req,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
    ApiConsumes,
    ApiBody,
} from '@nestjs/swagger';

import { RestaurantPhotosService } from './providers/restaurant-photos.service';
import { UploadPhotoDto } from './dtos/upload-photo.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { AuthType } from 'src/auth/enums/auth-type.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { REQUEST_USER_KEY } from 'src/auth/constants/auth.constants';
import { UserRole } from 'src/users/enums/userRole.enum';
import { multerCloudinaryConfig } from 'src/config/multer-cloudinary.config';

/**
 * RestaurantPhotosController - Upravljanje slikama restorana
 *
 * RBAC:
 * - Public: Pregled slika restorana
 * - Restaurant owner: Upload slika, postavljanje glavne slike, brisanje slika
 * - Admin: Brisanje svih slika
 */
@ApiTags('Restaurant Photos')
@Controller('restaurant-photos')
export class RestaurantPhotosController {
    constructor(private readonly restaurantPhotosService: RestaurantPhotosService) {}

    /**
     * POST /restaurant-photos/upload - Upload slike
     * Samo vlasnik restorana može uploadati slike
     */
    @Post('upload')
    @Roles(UserRole.restaurant, UserRole.admin)
    @ApiBearerAuth('access-token')
    @UseInterceptors(FileInterceptor('file', multerCloudinaryConfig))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Upload slike restorana (samo vlasnik)' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Slika restorana (JPG, JPEG, PNG, GIF, max 5MB)',
                },
                restaurantId: {
                    type: 'number',
                    example: 1,
                    description: 'ID restorana',
                },
            },
            required: ['file', 'restaurantId'],
        },
    })
    @ApiResponse({ status: 201, description: 'Slika uspješno uploadana' })
    @ApiResponse({ status: 400, description: 'Neispravan file ili nedostaje file' })
    @ApiResponse({ status: 403, description: 'Zabranjen pristup - niste vlasnik restorana' })
    @ApiResponse({ status: 404, description: 'Restoran nije pronađen' })
    public async uploadPhoto(
        @UploadedFile() file: Express.Multer.File,
        @Body() uploadPhotoDto: UploadPhotoDto,
        @Req() request,
    ) {
        if (!file) {
            throw new BadRequestException('File is required.');
        }

        const userId = request[REQUEST_USER_KEY].sub;
        return this.restaurantPhotosService.upload(uploadPhotoDto.restaurantId, file, userId);
    }

    /**
     * GET /restaurant-photos/restaurant/:restaurantId - Dohvat slika restorana
     * PUBLIC endpoint
     */
    @Get('restaurant/:restaurantId')
    @Auth(AuthType.None)
    @ApiOperation({ summary: 'Dohvat svih slika restorana (javno)' })
    @ApiParam({ name: 'restaurantId', description: 'ID restorana', type: 'number', example: 1 })
    @ApiResponse({ status: 200, description: 'Lista slika restorana' })
    public async getPhotosByRestaurant(@Param('restaurantId') restaurantId: string) {
        return this.restaurantPhotosService.findByRestaurant(+restaurantId);
    }

    /**
     * GET /restaurant-photos/:id - Dohvat slike po ID-u
     * PUBLIC endpoint
     */
    @Get(':id')
    @Auth(AuthType.None)
    @ApiOperation({ summary: 'Dohvat slike po ID-u' })
    @ApiParam({ name: 'id', description: 'ID slike', type: 'number', example: 1 })
    @ApiResponse({ status: 200, description: 'Slika pronađena' })
    @ApiResponse({ status: 404, description: 'Slika nije pronađena' })
    public async getPhoto(@Param('id') id: string) {
        return this.restaurantPhotosService.findById(+id);
    }

    /**
     * PATCH /restaurant-photos/:id/set-primary - Postavljanje glavne slike
     * Samo vlasnik može postaviti glavnu sliku
     */
    @Patch(':id/set-primary')
    @Roles(UserRole.restaurant, UserRole.admin)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Postavljanje glavne slike restorana (samo vlasnik)' })
    @ApiParam({ name: 'id', description: 'ID slike', type: 'number', example: 1 })
    @ApiResponse({ status: 200, description: 'Glavna slika postavljena' })
    @ApiResponse({ status: 403, description: 'Zabranjen pristup - niste vlasnik restorana' })
    @ApiResponse({ status: 404, description: 'Slika nije pronađena' })
    public async setPrimaryPhoto(@Param('id') id: string, @Req() request) {
        const userId = request[REQUEST_USER_KEY].sub;
        return this.restaurantPhotosService.setPrimary(+id, userId);
    }

    /**
     * DELETE /restaurant-photos/:id - Brisanje slike
     * Vlasnik može obrisati svoje slike, admin sve slike
     */
    @Delete(':id')
    @Roles(UserRole.restaurant, UserRole.admin)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Brisanje slike (vlasnik ili admin)' })
    @ApiParam({ name: 'id', description: 'ID slike', type: 'number', example: 1 })
    @ApiResponse({ status: 200, description: 'Slika obrisana' })
    @ApiResponse({ status: 403, description: 'Zabranjen pristup - niste vlasnik restorana' })
    @ApiResponse({ status: 404, description: 'Slika nije pronađena' })
    public async deletePhoto(@Param('id') id: string, @Req() request) {
        const userId = request[REQUEST_USER_KEY].sub;
        const userRole = request[REQUEST_USER_KEY].role;
        const isAdmin = userRole === UserRole.admin;

        await this.restaurantPhotosService.delete(+id, userId, isAdmin);

        return { message: 'Photo successfully deleted' };
    }
}