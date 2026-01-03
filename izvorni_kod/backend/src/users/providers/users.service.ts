import { BadRequestException, ConflictException, forwardRef, Inject, Injectable, NotFoundException, RequestTimeoutException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { CreateUserDto } from "../dtos/create-user.dto";
import { UpdateUserDto } from "../dtos/update-user.dto";

import { User } from "../entities/user.entity";
import { FindUserProvider } from "./find-user.provider";
import { AuthService } from "src/auth/providers/auth.service";
import { CreateUserProvider } from "./create-user.provider";
import { UpdateUserProvider } from "./update-user.provider";
import { UserRole } from "../enums/userRole.enum";

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

    /**
     * ADMIN: Blokiranje korisnika
     */
    public async blockUser(id: number): Promise<{ message: string }> {
        const user = await this.findUserProvider.findOneById(id);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (user.isBlocked) {
            throw new BadRequestException('User is already blocked');
        }

        await this.usersRepository.update(id, { isBlocked: true });
        return { message: 'User blocked successfully' };
    }

    /**
     * ADMIN: Odblokiranje korisnika
     */
    public async unblockUser(id: number): Promise<{ message: string }> {
        const user = await this.findUserProvider.findOneById(id);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (!user.isBlocked) {
            throw new BadRequestException('User is not blocked');
        }

        await this.usersRepository.update(id, { isBlocked: false });
        return { message: 'User unblocked successfully' };
    }

    /**
     * ADMIN: Promjena uloge korisnika
     */
    public async changeRole(id: number, role: UserRole): Promise<{ message: string }> {
        const user = await this.findUserProvider.findOneById(id);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (user.role === role) {
            throw new BadRequestException(`User already has role: ${role}`);
        }

        await this.usersRepository.update(id, { role });
        return { message: 'Role updated successfully' };
    }

    /**
     * HELPER: Broj svih korisnika (za admin dashboard)
     */
    public async count(): Promise<number> {
        return await this.usersRepository.count();
    }
}