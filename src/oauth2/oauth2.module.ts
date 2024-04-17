import { Module } from '@nestjs/common';
import { Oauth2Service } from './oauth2.service';
import { Oauth2Controller } from './oauth2.controller';
import { OAuthStrategy } from './strategies/oauth.strategy';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Module({
  imports: [UsersModule, AuthModule, JwtModule.register({})],
  controllers: [Oauth2Controller],
  providers: [Oauth2Service, OAuthStrategy],
})
export class Oauth2Module {}
