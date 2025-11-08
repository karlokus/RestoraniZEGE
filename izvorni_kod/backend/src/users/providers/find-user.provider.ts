import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class FindUserProvider {
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) {}

    public async findOneById(id: number) {
        return await this.usersRepository.findOneBy({
            id: id,
        });
    }

    public async findOneByEmail(email: string): Promise<User | null> {
        let user: User | undefined | null = undefined;

        try {
            user = await this.usersRepository.findOneBy({
                email: email,
            });
        } catch (error) {
            const errMessage = (error as Error).message;
            throw new RequestTimeoutException(
                'Unable to process your request at the moment, please try later',
                {
                    description: 'Error connecting to the database, error message: ' + errMessage,
                },
            );
        }
        
        return user;
    }

    public async findOneByGoogleId(googleId: string): Promise<User | null> {
        let user: User | undefined | null = undefined;

        try {
            user = await this.usersRepository.findOneBy({
                googleId: googleId,
            });
        } catch (error) {
            const errMessage = (error as Error).message;
            throw new RequestTimeoutException(
                'Unable to process your request at the moment, please try later',
                {
                    description: 'Error connecting to the database, error message: ' + errMessage,
                },
            );
        }
        
        return user;
    }
}