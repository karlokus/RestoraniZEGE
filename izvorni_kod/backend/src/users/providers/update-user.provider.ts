import { BadRequestException, ConflictException, Injectable, RequestTimeoutException } from "@nestjs/common";
import { UpdateUserDto } from "../dtos/update-user.dto";
import { User } from "../entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { FindUserProvider } from "./find-user.provider";
import { Repository } from "typeorm";

@Injectable()
export class UpdateUserProvider {

    constructor(
        private readonly findUserProvider: FindUserProvider,

        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) {}

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

        //user.username = updateUserDto.username ?? user.username;      // todo -> ime prezime
        user.email = updateUserDto.email ?? user.email;
        user.role = updateUserDto.role ?? user.role;                    // todo -> rolu nesmije mjenjat

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
}
