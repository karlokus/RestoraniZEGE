import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { UsersController } from "./users.controller";
import { UsersService } from "./providers/users.service";

import { User } from "./entities/user.entity";
import { FindUserProvider } from "./providers/find-user.provider";
import { AuthModule } from "src/auth/auth.module";

@Module({
    controllers: [UsersController],
    providers: [
        UsersService, 
        FindUserProvider,
    ],
    imports: [
        TypeOrmModule.forFeature([User]),
        forwardRef(() => AuthModule),
    ],
    exports: [UsersService],
})
export class UsersModule {}