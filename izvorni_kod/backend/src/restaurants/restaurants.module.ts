import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { RestaurantsController } from "./restaurants.controller";
import { RestaurantsService } from "./providers/restaurants.service";

import { Restaurant } from "./entities/restaurant.entity";
import { FindRestaurantProvider } from "./providers/find-restaurant.provider";
import { OwnershipGuard } from "src/auth/guards/ownership/ownership.guard";
import { RatingsModule } from "src/ratings/ratings.module";
import { GeocodeProvider } from "./providers/geocode.provider";

@Module({
    controllers: [RestaurantsController],
    providers: [
        RestaurantsService,
        FindRestaurantProvider,
        GeocodeProvider,
        OwnershipGuard,
    ],
    imports: [
        TypeOrmModule.forFeature([Restaurant]),
        forwardRef(() => RatingsModule)
    ],
    exports: [RestaurantsService],
})
export class RestaurantsModule {}