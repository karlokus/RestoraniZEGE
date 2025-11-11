import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';

import { UsersService } from './providers/users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { AuthType } from 'src/auth/enums/auth-type.enum';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('users')
export class UsersController {

    constructor(
        private readonly UsersService: UsersService
    ) {}

    @Get()
    public getAllUsers() {
        return this.UsersService.getAllUsers();
    }

    @Get(':id')
    public getUser(
        @Param('id') id: string
    ) {
        return this.UsersService.getUser(+id);
    }

    @Post()                                             // todo -> ovo mora bit public izvan guarda, također napraviti da vrati i jwt
    @Auth(AuthType.None)                                // todo -> provjeriti sve endpointove
    public createUser(
        @Body() createUserDto: CreateUserDto,
    ) {
        return this.UsersService.createUser(createUserDto);
    }

    @Patch(':id')
    public updateUser(                                  // todo -> kako napraviti da user moze određenim endpointovima pristupat a onda restoran nekim drugim
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto
    ) {
        return this.UsersService.updateUser(updateUserDto, +id);
    }

    @Delete(':id')
    public removeUser(
        @Param('id') id: string
    ) {
        return this.UsersService.removeUser(+id);
    }
}