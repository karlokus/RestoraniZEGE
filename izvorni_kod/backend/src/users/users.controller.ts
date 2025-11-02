import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';

@Controller('users')
export class UsersController {

    constructor(
        private readonly UsersService: UsersService
    ) {}

    @Get()
    public getAllUsers() {
        return this.UsersService.getAllUsers();
    }

    @Get('{:id}')
    public getUser(
        @Param('id') id: string
    ) {
        return this.UsersService.getUser(+id);
    }

    @Post()
    public createUser(
        @Body() createUserDto: CreateUserDto,
    ) {
        //return this.UsersService.createUser(createUserDto);
    }

    @Patch()
    public updateUser(
        @Body() updateUserDto: UpdateUserDto
    ) {
        //return this.UsersService.updateUser(updateUserDto);
    }

    @Delete(':id')
    public removeUser(
        @Param('id') id: string
    ) {
        //return this.UsersService.removeUser(+id);
    }
}