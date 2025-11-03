import { BadRequestException, ConflictException, forwardRef, Inject, Injectable, RequestTimeoutException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { CreateUserDto } from "../dtos/create-user.dto";
import { UpdateUserDto } from "../dtos/update-user.dto";

import { User } from "../entities/user.entity";
import { FindUserProvider } from "./find-user.provider";
import { AuthService } from "src/auth/providers/auth.service";

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,

        private readonly findUserProvider: FindUserProvider,

        @Inject(forwardRef(() => AuthService))
        private readonly authService: AuthService,
    ) {}

    public async getAllUsers() {
        return await this.usersRepository.find();
    }

    public async getUser(id: number) {
        return await this.findUserProvider.findOneById(id);
    }

    public async createUser(createUserDto: CreateUserDto) {
        let user: User | null;
        
        /* nadi mi usera s emailom koji je dosao na endpoint */
        try {
            user = await this.findUserProvider.findOneByEmail(createUserDto.email);
        } catch (error) {
            const errMessage = (error as Error).message;
            throw new RequestTimeoutException(
                'Unable to process your request at the moment, please try later',
                {
                    description: 'Error connecting to the database, error message: ' + errMessage,
                },
            );
        }

        /* ako user postoji nemozemo ga opet kreirati */
        if (user) {
            throw new BadRequestException('User already exists, please check your email.');
        }
        const newUser = this.usersRepository.create(createUserDto);

        /* kreiraj usera */
        try {
            return await this.usersRepository.save(newUser);
        } catch (error: unknown) {
            const errMessage = (error as Error).message;
            if (error instanceof Error && 'detail' in error) {
                const detail = (error as { detail: string }).detail;
                if (detail.includes('email')) {
                    throw new ConflictException('Email must be unique');
                }
            }
            throw new RequestTimeoutException(
                'Unable to process your request at the moment, please try later',
                {
                    description: 'Error connecting to the database, error message: ' + errMessage,
                },
            );
        }
    }

    public async updateUser(updateUserDto: UpdateUserDto, id: number) {
        let user: User | null;

        /* nadi mi usera po id-u koji je dosao na endpoint */
        try {
            user = await this.findUserProvider.findOneById(id);
        } catch (error) {
            const errMessage = (error as Error).message;
            throw new RequestTimeoutException(
                'Unable to process your request at the moment, please try later',
                {
                    description: 'Error connecting to the database, error message: ' + errMessage,
                },
            );
        }

        /* ako user ne postoji nemožemo ga ni mijenjat */
        if (!user) {
            throw new BadRequestException('User does not exist');
        }

        user.username = updateUserDto.username ?? user.username;
        user.email = updateUserDto.email ?? user.email;
        user.role = updateUserDto.role ?? user.role;

        try {
            await this.usersRepository.save(user);
        } catch (error: unknown) {
            if (error instanceof Error && 'detail' in error) {
                const detail = (error as { detail: string }).detail;
                if (detail.includes('email')) {
                    throw new ConflictException('Email must be uniqqque');
                }
            }
            throw new RequestTimeoutException(
                'Unable to process your request at the moment, please try later',
                {
                    description: 'Error connecting to the database',
                },
            );
        }
        return user;
    }

    public async removeUser(id: number) {
        const result = await this.usersRepository.delete(id);
        return { deleted: result.affected! > 0 ? true : false, id}
    }
}