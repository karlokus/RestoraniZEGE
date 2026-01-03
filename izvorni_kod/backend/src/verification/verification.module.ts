import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { VerificationRequest } from "./entities/verification-request.entity";
import { Restaurant } from "src/restaurants/entities/restaurant.entity";
import { VerificationController } from "./verification.controller";
import { VerificationService } from "./providers/verification.service";
import { RestaurantsModule } from "src/restaurants/restaurants.module";

@Module({
  controllers: [VerificationController],
  providers: [VerificationService],
  imports: [
    TypeOrmModule.forFeature([VerificationRequest, Restaurant]),
    RestaurantsModule,
  ],
  exports: [VerificationService],
})
export class VerificationRequestsModule {}