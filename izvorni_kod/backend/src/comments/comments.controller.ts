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

import { CommentsService } from './providers/comments.service';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { UpdateCommentDto } from './dtos/update-comment.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { AuthType } from 'src/auth/enums/auth-type.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { REQUEST_USER_KEY } from 'src/auth/constants/auth.constants';
import { UserRole } from 'src/users/enums/userRole.enum';

/**
 * CommentsController - Upravljanje komentarima restorana
 *
 * RBAC:
 * - Public: Pregled vidljivih komentara restorana
 * - Authenticated: Kreiranje komentara, pregled vlastitih komentara
 * - Owner: Ažuriranje/brisanje vlastitog komentara
 * - Admin: Brisanje/sakrivanje svih komentara
 */
@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) {}

    /**
     * POST /comments - Kreiranje novog komentara
     * AUTHENTICATED - samo prijavljeni korisnici mogu komentirati
     */
    @Post()
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Kreiranje novog komentara restorana' })
    @ApiResponse({ status: 201, description: 'Komentar uspješno kreiran' })
    @ApiResponse({ status: 401, description: 'Korisnik nije autentificiran' })
    @ApiResponse({ status: 404, description: 'Restoran nije pronađen' })
    public async createComment(
        @Body() createCommentDto: CreateCommentDto,
        @Req() request,
    ) {
        const userId = request[REQUEST_USER_KEY].sub;
        return this.commentsService.create(createCommentDto, userId);
    }

    /**
     * GET /comments/restaurant/:restaurantId - Dohvat komentara restorana
     * PUBLIC endpoint - samo vidljivi komentari
     */
    @Get('restaurant/:restaurantId')
    @Auth(AuthType.None)
    @ApiOperation({ summary: 'Dohvat svih vidljivih komentara restorana (javno)' })
    @ApiParam({ name: 'restaurantId', description: 'ID restorana', type: 'number', example: 1 })
    @ApiResponse({ status: 200, description: 'Lista komentara restorana' })
    public async getCommentsByRestaurant(
        @Param('restaurantId') restaurantId: string
    ) {
        return this.commentsService.findByRestaurant(+restaurantId);
    }

    /**
     * GET /comments/my-comments - Dohvat komentara prijavljenog korisnika
     * AUTHENTICATED - samo za prijavljene korisnike
     */
    @Get('my-comments')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Dohvat komentara prijavljenog korisnika' })
    @ApiResponse({ status: 200, description: 'Lista korisničkih komentara' })
    @ApiResponse({ status: 401, description: 'Korisnik nije autentificiran' })
    public async getMyComments(@Req() request) {
        const userId = request[REQUEST_USER_KEY].sub;
        return this.commentsService.findByUser(userId);
    }

    /**
     * GET /comments/:id - Dohvat komentara po ID-u
     * PUBLIC endpoint
     */
    @Get(':id')
    @Auth(AuthType.None)
    @ApiOperation({ summary: 'Dohvat komentara po ID-u' })
    @ApiParam({ name: 'id', description: 'ID komentara', type: 'number', example: 1 })
    @ApiResponse({ status: 200, description: 'Komentar pronađen' })
    @ApiResponse({ status: 404, description: 'Komentar nije pronađen' })
    public async getComment(@Param('id') id: string) {
        return this.commentsService.findById(+id);
    }

    /**
     * GET /comments - Dohvat svih komentara (samo admin)
     * ADMIN endpoint
     */
    @Get()
    @Roles(UserRole.admin)
    @ApiOperation({ summary: 'Dohvat svih komentara (samo admin)' })
    @ApiResponse({ status: 200, description: 'Komentari pronađeni' })
    public async getComments() {
        return this.commentsService.findAll();
    }


    /**
     * PATCH /comments/:id - Ažuriranje komentara
     * Samo vlasnik može ažurirati svoj komentar
     * Ownership provjera u servisu
     */
    @Patch(':id')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Ažuriranje komentara (samo vlasnik)' })
    @ApiParam({ name: 'id', description: 'ID komentara', type: 'number', example: 1 })
    @ApiResponse({ status: 200, description: 'Komentar ažuriran' })
    @ApiResponse({ status: 403, description: 'Zabranjen pristup - niste vlasnik komentara' })
    @ApiResponse({ status: 404, description: 'Komentar nije pronađen' })
    public async updateComment(
        @Param('id') id: string,
        @Body() updateCommentDto: UpdateCommentDto,
        @Req() request,
    ) {
        const userId = request[REQUEST_USER_KEY].sub;
        return this.commentsService.update(+id, updateCommentDto, userId);
    }

    /**
     * DELETE /comments/:id - Brisanje komentara
     * Vlasnik može obrisati svoj komentar, admin sve komentare
     */
    @Delete(':id')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Brisanje komentara (vlasnik ili admin)' })
    @ApiParam({ name: 'id', description: 'ID komentara', type: 'number', example: 1 })
    @ApiResponse({ status: 200, description: 'Komentar obrisan' })
    @ApiResponse({ status: 403, description: 'Zabranjen pristup - niste vlasnik komentara' })
    @ApiResponse({ status: 404, description: 'Komentar nije pronađen' })
    public async deleteComment(@Param('id') id: string, @Req() request) {
        const userId = request[REQUEST_USER_KEY].sub;
        const userRole = request[REQUEST_USER_KEY].role;
        const isAdmin = userRole === UserRole.admin;

        await this.commentsService.delete(+id, userId, isAdmin);

        return { message: 'Comment successfully deleted' };
    }

    /**
     * PATCH /comments/:id/hide - Sakrivanje komentara
     * Samo admin može sakriti neprimjerene komentare
     */
    @Patch(':id/hide')
    @Roles(UserRole.admin)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Sakrivanje komentara (samo admin)' })
    @ApiParam({ name: 'id', description: 'ID komentara', type: 'number', example: 1 })
    @ApiResponse({ status: 200, description: 'Komentar sakriven' })
    @ApiResponse({ status: 403, description: 'Zabranjen pristup - samo admin' })
    @ApiResponse({ status: 404, description: 'Komentar nije pronađen' })
    public async hideComment(@Param('id') id: string) {
        return this.commentsService.hideComment(+id);
    }

    /**
     * PATCH /comments/:id/show - Prikazivanje komentara
     * Samo admin može prikazati sakrivene komentare
     */
    @Patch(':id/show')
    @Roles(UserRole.admin)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Prikazivanje komentara (samo admin)' })
    @ApiParam({ name: 'id', description: 'ID komentara', type: 'number', example: 1 })
    @ApiResponse({ status: 200, description: 'Komentar prikazan' })
    @ApiResponse({ status: 403, description: 'Zabranjen pristup - samo admin' })
    @ApiResponse({ status: 404, description: 'Komentar nije pronađen' })
    public async showComment(@Param('id') id: string) {
        return this.commentsService.showComment(+id);
    }
}