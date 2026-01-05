import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EventsController } from './events.controller';
import { EventsService } from './providers/events.service';
import { Event } from './entities/event.entity';
import { RestaurantsModule } from 'src/restaurants/restaurants.module';
import { FavoritesModule } from 'src/favorites/favorites.module';

@Module({
  controllers: [EventsController],
  providers: [EventsService],
  imports: [
    TypeOrmModule.forFeature([Event]),
    RestaurantsModule,
    FavoritesModule,
  ],
  exports: [EventsService]
})
export class EventsModule {}
