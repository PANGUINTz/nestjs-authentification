import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { Oauth2Module } from './oauth2/oauth2.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IsUniqueConstraint } from 'utils/validation';
import { TypeOrmConfig } from 'configs/db.config';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    Oauth2Module,
    TypeOrmModule.forRootAsync({ useClass: TypeOrmConfig }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
  controllers: [AppController],
  providers: [AppService, IsUniqueConstraint],
})
export class AppModule {}
