import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Rating } from "./entities/rating.entity";
import { RatingsController } from "./ratings.controller";
import { RatingsService } from "./providers/ratings.service";
import { RestaurantsModule } from "src/restaurants/restaurants.module";

@Module({
  controllers: [RatingsController],
  providers: [RatingsService],
  imports: [
    TypeOrmModule.forFeature([Rating]),
    forwardRef(() => RestaurantsModule),
  ],
  exports: [RatingsService],
})
export class RatingsModule {}