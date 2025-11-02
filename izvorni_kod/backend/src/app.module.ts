import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',        // ili IP ako koristiš Docker
      port: 5432,
      username: 'postgres',     // tvoje korisničko ime
      password: 'bazepodataka',      // tvoja lozinka
      database: 'RestoraniZEGE', // ime baze
      autoLoadEntities: true,   // automatski učitava sve entitete registrirane u modulu
      synchronize: true,        // samo za razvoj! automatski kreira tablice prema entitetima
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
