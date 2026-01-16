import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { UsersModule } from 'src/users/users.module';
import { RestaurantsModule } from 'src/restaurants/restaurants.module';
import { VerificationRequestsModule } from 'src/verification/verification.module';
import { CommentsModule } from 'src/comments/comments.module';

@Module({
  imports: [
    UsersModule,
    RestaurantsModule,
    VerificationRequestsModule,
    CommentsModule,
  ],
  controllers: [AdminController]
})
export class AdminModule {}