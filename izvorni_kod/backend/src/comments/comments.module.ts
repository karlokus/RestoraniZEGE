import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Comment } from "./entities/comment.entity";
import { CommentsController } from "./comments.controller";
import { CommentsService } from "./providers/comments.service";
import { RestaurantsModule } from "src/restaurants/restaurants.module";

@Module({
  controllers: [CommentsController],
  providers: [CommentsService],
  imports: [
    TypeOrmModule.forFeature([Comment]),
    RestaurantsModule,
  ],
  exports: [CommentsService],
})
export class CommentsModule {}