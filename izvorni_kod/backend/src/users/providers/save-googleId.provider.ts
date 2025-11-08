import { Injectable } from "@nestjs/common";
import { User } from "../entities/user.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";


@Injectable()
export class SaveGoogleIdProvider {

    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) {}

    public async saveGoogleId(user: User) {
        await this.usersRepository.update(user.id, {
            googleId: user.googleId,
            firstName: user.firstName,
            lastName: user.lastName,
        });

        return this.usersRepository.findOne({ where: { id: user.id } });
    }
}