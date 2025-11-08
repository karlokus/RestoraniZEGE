import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { RestaurantsController } from "./restaurants.controller";
import { RestaurantsService } from "./providers/restaurants.service";

import { Restaurant } from "./entities/restaurant.entity";
import { FindRestaurantProvider } from "./providers/find-restaurant.provider";
import { ConfigModule } from "@nestjs/config";
import jwtConfig from "src/auth/config/jwt.config";
import { JwtModule } from "@nestjs/jwt";

@Module({
    controllers: [RestaurantsController],
    providers: [
        RestaurantsService, 
        FindRestaurantProvider,
    ],
    imports: [
        TypeOrmModule.forFeature([Restaurant]),
        /*ConfigModule.forFeature(jwtConfig),
        JwtModule.registerAsync(jwtConfig.asProvider()),*/
    ],
    exports: [],
})
export class RestaurantsModule {}