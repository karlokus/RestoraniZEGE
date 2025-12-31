import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FavoritesController } from "./favorites.controller";
import { Favorite } from "./entities/favorite.entity";
import { FavoritesService } from "./providers/favorites.service";

@Module({
    controllers: [FavoritesController],
    providers: [FavoritesService],
    imports: [TypeOrmModule.forFeature([Favorite])],
    exports: [],
})
export class FavoritesModule {}