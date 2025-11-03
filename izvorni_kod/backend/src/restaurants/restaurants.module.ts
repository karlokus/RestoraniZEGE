import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { RestaurantsController } from "./restaurants.controller";
import { RestaurantsService } from "./providers/restaurants.service";

import { Restaurant } from "./entities/restaurant.entity";
import { FindRestaurantProvider } from "./providers/find-restaurant.provider";

@Module({
    controllers: [RestaurantsController],
    providers: [
        RestaurantsService, 
        FindRestaurantProvider,
    ],
    imports: [
        TypeOrmModule.forFeature([Restaurant])
    ],
    exports: [],
})
export class RestaurantsModule {}