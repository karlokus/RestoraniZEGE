import { Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dtos/create-user.dto";
import { UpdateUserDto } from "./dtos/update-user.dto";

@Injectable()
export class UsersService {

    constructor(
        // ubaci bazu
    ) {}

    public async getAllUsers() {
        return 'Useri';
    }

    public async getUser(id: number) {
        return 'User' + `${id}`;
    }

    public async createUser(createUserDto: CreateUserDto) {
        return 'UserCreated';
    }

    public async updateUser(updateUserDto: UpdateUserDto) {
        return 'UserUpdated';
    }

    public async deleteUser(id: number) {
        return 'UserDeleted';
    }
}