import { BadRequestException, ConflictException, forwardRef, Inject, Injectable, RequestTimeoutException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { CreateUserDto } from "../dtos/create-user.dto";
import { UpdateUserDto } from "../dtos/update-user.dto";

import { User } from "../entities/user.entity";
import { FindUserProvider } from "./find-user.provider";
import { AuthService } from "src/auth/providers/auth.service";
import { CreateUserProvider } from "./create-user.provider";
import { UpdateUserProvider } from "./update-user.provider";

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,

        private readonly findUserProvider: FindUserProvider,

        private readonly createUserProvider: CreateUserProvider,

        private readonly updateUserProvider: UpdateUserProvider,
    ) {}

    public async getAllUsers() {
        return await this.usersRepository.find();
    }

    public async getUser(id: number) {
        return await this.findUserProvider.findOneById(id);
    }

    public async createUser(createUserDto: CreateUserDto) {
        return this.createUserProvider.createUser(createUserDto);
    }

    public async updateUser(updateUserDto: UpdateUserDto, id: number) {
        return this.updateUserProvider.updateUser(updateUserDto, id);
    }

    public async removeUser(id: number) {
        const result = await this.usersRepository.delete(id);
        return { deleted: result.affected! > 0 ? true : false, id}
    }
}