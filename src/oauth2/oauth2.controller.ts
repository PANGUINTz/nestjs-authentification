import {
  Controller,
  Get,
  UseGuards,
  Request,
  Res,
  BadRequestException,
  UnauthorizedException,
  Query,
} from '@nestjs/common';
import { Response } from 'express';
import { Oauth2Service } from './oauth2.service';
import { CheckTokenExpiryGuard, GoogleOauthGuard } from './guards/oauth.guard';
import { UsersService } from 'src/users/users.service';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class Oauth2Controller {
  constructor(
    private readonly oauth2Service: Oauth2Service,
    private userService: UsersService,
    private authService: AuthService,
    private jwtService: JwtService,
  ) {}

  @Get('google')
  @UseGuards(GoogleOauthGuard)
  googleLogin() {}

  @Get('google/callback')
  @UseGuards(GoogleOauthGuard)
  async googleLoginCallback(@Request() req, @Res() res: Response) {
    const googleToken = req.user.accessToken;
    const googleRefreshToken = req.user.refreshToken;

    const googleProfile = (await this.oauth2Service.getProfile(googleToken))
      .data;

    const accessToken = await this.jwtService.signAsync(googleProfile, {
      secret: process.env.ACCESS_TOKEN_SECRET,
      expiresIn: '10m',
      algorithm: 'HS256',
    });

    const refreshToken = await this.jwtService.signAsync(googleProfile, {
      secret: process.env.REFRESH_TOKEN_SECRET,
      expiresIn: '1d',
      algorithm: 'HS256',
    });

    res.send({
      type: 'Bearer',
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
    const users = await this.userService.findByEmail(googleProfile?.email);

    if (!users) {
      const datas = {
        email: googleProfile.email,
        password: process.env.GENERATE_KEY,
        firstName: googleProfile.given_name,
        lastName: googleProfile.family_name,
        refreshToken: refreshToken,
      };
      await this.authService.signUp(datas);
    }
  }

  @UseGuards(CheckTokenExpiryGuard)
  @Get('profile')
  async getProfile(@Request() req, @Res() res: Response) {
    const accessToken = req.cookies['oauth_access_token'];
    if (accessToken) {
      const googleProfile = (await this.oauth2Service.getProfile(accessToken))
        .data;

      const token = await this.oauth2Service.generateToken(googleProfile.email);

      const user = await this.userService.findByEmail(googleProfile.email);

      if (!user) {
        throw new BadRequestException('user not found');
      }
      await this.userService.update(user.id, {
        refreshToken: token.refresh_token,
      });
      return res.send(token);
    }

    throw new UnauthorizedException('No access token');
  }
}
