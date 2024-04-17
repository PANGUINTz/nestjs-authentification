import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AccessTokenStrategy } from 'src/auth/strategies/accessToken.strategy';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  exports: [TypeOrmModule, UsersService],
  providers: [UsersService, AccessTokenStrategy],
})
export class UsersModule {}
