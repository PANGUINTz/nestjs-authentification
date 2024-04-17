import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Oauth2Service } from '../oauth2.service';

@Injectable()
export class GoogleOauthGuard extends AuthGuard('google') {}

@Injectable()
export class CheckTokenExpiryGuard implements CanActivate {
  constructor(private readonly oauthService: Oauth2Service) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const accessToken = request.cookies['oauth_access_token'];

    if (await this.oauthService.isTokenExpired(accessToken)) {
      const refreshToken = request.cookies['oauth_refresh_token'];

      if (!refreshToken) {
        throw new UnauthorizedException('Refresh token not found');
      }

      try {
        const newAccessToken =
          await this.oauthService.getNewAccessToken(refreshToken);
        request.res.cookie('oauth_access_token', newAccessToken, {
          httpOnly: true,
        });
        request.cookies['oauth_access_token'] = newAccessToken;
      } catch (error) {
        throw new UnauthorizedException('Failed to refresh token');
      }
    }

    return true;
  }
}
