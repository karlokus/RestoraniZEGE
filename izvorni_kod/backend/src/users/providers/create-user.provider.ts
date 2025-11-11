import { BadRequestException, ConflictException, forwardRef, Inject, Injectable, RequestTimeoutException } from "@nestjs/common";
import { CreateUserDto } from "../dtos/create-user.dto";
import { User } from "../entities/user.entity";
import { FindUserProvider } from "./find-user.provider";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { HashingProvider } from "src/auth/providers/hashing.provider";

@Injectable()
export class CreateUserProvider {

    constructor(
        private readonly findUserProvider: FindUserProvider,

        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,

        @Inject(forwardRef(() => HashingProvider))
        private readonly hashingProvider: HashingProvider,
    ) {}

    public async createUser(createUserDto: CreateUserDto) {
        let user: User | null;
        
        /* nadi mi usera s emailom koji je dosao na endpoint */
        user = await this.findUserProvider.findOneByEmail(createUserDto.email);

        /* ako user postoji (ako nije = null) nemozemo ga opet kreirati */
        if (user) {
            throw new BadRequestException('User already exists, please check your email.');
        }

        /* kreiraj usera */
        const newUser = this.usersRepository.create({
            ...createUserDto,
            password: await this.hashingProvider.hashPassword(createUserDto.password)
        });

        /* spremi usera */
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


    public async createGoogleUser(googleUser: { email:string, firstName:string, lastName:string, googleId:string }) {       // todo -> tip stavit u interface
        try {
            const user = this.usersRepository.create(googleUser);           // todo --> što ako imamo oba nacina prijave
            return await this.usersRepository.save(user);
        } catch(error) {
            new ConflictException(error, {
                description: 'Could not create a new user',
            });
        }
    }
}