import { Injectable } from '@nestjs/common';
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

    public async findOneByEmail(email: string) {
        return await this.usersRepository.findOneBy({
            email: email,
        });
    }

    public async findOneByUsername(username: string) {
        return await this.usersRepository.findOneBy({
            username: username,
        });
    }
}