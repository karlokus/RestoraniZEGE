import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Req,
    ForbiddenException,
} from '@nestjs/common';

import { UsersService } from './providers/users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { ChangeRoleDto } from './dtos/change-role.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';

import { AuthType } from 'src/auth/enums/auth-type.enum';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { REQUEST_USER_KEY } from 'src/auth/constants/auth.constants';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserRole } from './enums/userRole.enum';

@ApiTags('Users')
@Controller('users')
export class UsersController {

    constructor(
        private readonly UsersService: UsersService
    ) {}

    @Get()
    @Roles(UserRole.admin)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Dohvat svih korisnika (samo admin)' })
    @ApiResponse({ status: 200, description: 'Lista korisnika' })
    @ApiResponse({ status: 403, description: 'Zabranjen pristup - niste admin' })
    public getAllUsers() {
        return this.UsersService.getAllUsers();
    }

    @Patch('change-password')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Promjena lozinke trenutno prijavljenog korisnika' })
    @ApiResponse({ status: 200, description: 'Lozinka uspješno promijenjena' })
    @ApiResponse({ status: 400, description: 'Korisnik nema postavljenu lozinku (Google login)' })
    @ApiResponse({ status: 401, description: 'Trenutna lozinka nije ispravna' })
    @ApiResponse({ status: 404, description: 'Korisnik nije pronađen' })
    public changePassword(
        @Body() changePasswordDto: ChangePasswordDto,
        @Req() request,
    ) {
        const currentUserId = request[REQUEST_USER_KEY].sub;
        return this.UsersService.changePassword(currentUserId, changePasswordDto);
    }

    @Get(':id')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Dohvat korisnika po ID-u' })
    @ApiParam({ name: 'id', example: 1 })
    @ApiResponse({ status: 200, description: 'Korisnik pronađen' })
    @ApiResponse({ status: 404, description: 'Korisnik nije pronađen' })
    public getUser(
        @Param('id') id: string
    ) {
        return this.UsersService.getUser(+id);
    }

    @Post()
    @Auth(AuthType.None)
    @ApiOperation({ summary: 'Registracija novog korisnika' })
    @ApiResponse({ status: 201, description: 'Korisnik uspješno kreiran' })
    @ApiResponse({ status: 400, description: 'Neispravni podaci' })
    public createUser(
        @Body() createUserDto: CreateUserDto,
    ) {
        return this.UsersService.createUser(createUserDto);
    }

    @Patch(':id')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Ažuriranje korisnika' })
    @ApiParam({ name: 'id', example: 1 })
    @ApiResponse({ status: 200, description: 'Korisnik ažuriran' })
    @ApiResponse({ status: 403, description: 'Zabranjen pristup - možete ažurirati samo svoj profil' })
    @ApiResponse({ status: 404, description: 'Korisnik nije pronađen' })
    public updateUser(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
        @Req() request,
    ) {
        const currentUserId = request[REQUEST_USER_KEY].sub;
        const currentUserRole = request[REQUEST_USER_KEY].role;

        if (currentUserRole !== UserRole.admin && +id !== currentUserId) {
            throw new ForbiddenException('Možete ažururati samo svoj profil');
        }

        return this.UsersService.updateUser(updateUserDto, +id);
    }

    @Delete(':id')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Brisanje korisnika' })
    @ApiParam({ name: 'id', example: 1 })
    @ApiResponse({ status: 200, description: 'Korisnik obrisan' })
    @ApiResponse({ status: 403, description: 'Zabranjen pristup - - možete obrisati samo svoj profil' })
    @ApiResponse({ status: 404, description: 'Korisnik nije pronađen' })
    public removeUser(
        @Param('id') id: string,
        @Req() request,
    ) {
        const currentUserId = request[REQUEST_USER_KEY].sub;
        const currentUserRole = request[REQUEST_USER_KEY].role;

        if (currentUserRole !== UserRole.admin && +id !== currentUserId) {
            throw new ForbiddenException('Možete obrisati samo svoj profil');
        }
        return this.UsersService.removeUser(+id);
    }

    // ==================== ADMIN ENDPOINTI ====================

    @Patch(':id/block')
    @Roles(UserRole.admin)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Blokiranje korisnika (samo admin)' })
    @ApiParam({ name: 'id', example: 1 })
    @ApiResponse({ status: 200, description: 'Korisnik uspješno blokiran' })
    @ApiResponse({ status: 400, description: 'Korisnik je već blokiran' })
    @ApiResponse({ status: 403, description: 'Zabranjen pristup - niste admin' })
    @ApiResponse({ status: 404, description: 'Korisnik nije pronađen' })
    public blockUser(
        @Param('id') id: string,
    ) {
        return this.UsersService.blockUser(+id);
    }

    @Patch(':id/unblock')
    @Roles(UserRole.admin)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Odblokiranje korisnika (samo admin)' })
    @ApiParam({ name: 'id', example: 1 })
    @ApiResponse({ status: 200, description: 'Korisnik uspješno odblokiran' })
    @ApiResponse({ status: 400, description: 'Korisnik nije blokiran' })
    @ApiResponse({ status: 403, description: 'Zabranjen pristup - niste admin' })
    @ApiResponse({ status: 404, description: 'Korisnik nije pronađen' })
    public unblockUser(
        @Param('id') id: string,
    ) {
        return this.UsersService.unblockUser(+id);
    }

    @Patch(':id/role')
    @Roles(UserRole.admin)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Promjena uloge korisnika (samo admin)' })
    @ApiParam({ name: 'id', example: 1 })
    @ApiResponse({ status: 200, description: 'Uloga uspješno promijenjena' })
    @ApiResponse({ status: 400, description: 'Korisnik već ima tu ulogu' })
    @ApiResponse({ status: 403, description: 'Zabranjen pristup - niste admin' })
    @ApiResponse({ status: 404, description: 'Korisnik nije pronađen' })
    public changeRole(
        @Param('id') id: string,
        @Body() changeRoleDto: ChangeRoleDto,
    ) {
        return this.UsersService.changeRole(+id, changeRoleDto.role);
    }
}