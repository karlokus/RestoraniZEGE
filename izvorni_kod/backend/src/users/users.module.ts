import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";

import { UsersController } from "./users.controller";
import { UsersService } from "./providers/users.service";
import { User } from "./entities/user.entity";
import { FindUserProvider } from "./providers/find-user.provider";
import { CreateUserProvider } from "./providers/create-user.provider";
import { UpdateUserProvider } from "./providers/update-user.provider";
import profileConfig from "./config/profile.config";

import { AuthModule } from "src/auth/auth.module";
import { SaveGoogleIdProvider } from "./providers/save-googleId.provider";




@Module({
    controllers: [UsersController],
    providers: [
        UsersService, 
        FindUserProvider,
        CreateUserProvider,
        UpdateUserProvider,
        SaveGoogleIdProvider,
    ],
    imports: [
        ConfigModule.forFeature(profileConfig),
        TypeOrmModule.forFeature([User]),
        forwardRef(() => AuthModule),
    ],
    exports: [
        UsersService, 
        FindUserProvider, 
        CreateUserProvider,
        SaveGoogleIdProvider,
    ],
})
export class UsersModule {}