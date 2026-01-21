import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import mailerConfig from './config/mailer.config';
import environmentValidation from './config/environment.validation';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from './auth/config/jwt.config';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenGuard } from './auth/guards/access-token/access-token.guard';
import { AuthenticationGuard } from './auth/guards/authentication/authentication.guard';
import { AuthModule } from './auth/auth.module';
import { RolesGuard } from './auth/guards/roles/roles.guard';
import { FavoritesModule } from './favorites/favorites.module';
import { EventsModule } from './events/events.module';
import { CommentsModule } from './comments/comments.module';
import { NotificationsModule } from './notification/notifications.model';
import { RatingsModule } from './ratings/ratings.module';
import { RestaurantPhotosModule } from './restaurant-photos/restaurant-photos.module';
import { VerificationRequestsModule } from './verification/verification.module';
import { AdminModule } from './admin/admin.module';
import { MailerModule } from './mailer/mailer.module';

const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    UsersModule,
    RestaurantsModule,
    FavoritesModule,
    EventsModule,
    CommentsModule,
    NotificationsModule,
    RatingsModule,
    RestaurantPhotosModule,
    VerificationRequestsModule,
    AuthModule,
    MailerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: !ENV ? '.env' : `.env.${ENV}`,
      load: [appConfig, databaseConfig, mailerConfig],
      validationSchema: environmentValidation,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({   //todo -> migrations
        type: 'postgres',
        host: configService.get('database.host'),
        port: +configService.get('database.port'),
        username: configService.get('database.user'),
        password: configService.get('database.password'),
        database: configService.get('database.name'),
        autoLoadEntities: configService.get('database.autoLoadEntities'),
        synchronize: configService.get('database.synchronize'),
        ssl: configService.get('database.sslEnabled') ? {
          rejectUnauthorized: false,
        } : false,
      }),
    }),
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard
    },
    AccessTokenGuard
  ],
})
export class AppModule {
  constructor() {
    console.log(ENV)
  }
}
