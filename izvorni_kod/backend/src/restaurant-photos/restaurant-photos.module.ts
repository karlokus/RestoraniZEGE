import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RestaurantPhoto } from "./entities/restaurant-photo.entity";
import { Restaurant } from "src/restaurants/entities/restaurant.entity";
import { RestaurantPhotosController } from "./restaurant-photos.controller";
import { RestaurantPhotosService } from "./providers/restaurant-photos.service";
import { RestaurantsModule } from "src/restaurants/restaurants.module";

@Module({
  controllers: [RestaurantPhotosController],
  providers: [RestaurantPhotosService],
  imports: [
    TypeOrmModule.forFeature([RestaurantPhoto]),
    RestaurantsModule,
  ],
  exports: [RestaurantPhotosService],
})
export class RestaurantPhotosModule {}