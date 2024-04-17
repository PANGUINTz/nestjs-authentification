import { Controller, Post, Body, HttpCode, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from './dto/create-auth.dto';
import { User } from 'src/users/entities/user.entity';
import { GetCurrentUserId } from './decorators/current-user-id.decorator';
import { GetCurrentUser } from './decorators/currect-user.decorator';
import { RefreshTokenGuard } from './guards/refreshToken.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('sign-up')
  @HttpCode(201)
  async signUp(@Body() user: SignUpDto): Promise<User> {
    return await this.authService.signUp(user);
  }

  @Post('sign-in')
  async signIn(@Body() user: SignInDto): Promise<any> {
    return await this.authService.signIn(user);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh/:id')
  @HttpCode(200)
  refreshTokens(
    @GetCurrentUserId() userId: number,
    @GetCurrentUser('refreshToken') refreshToken: string,
  ) {
    return this.authService.refreshTokens(userId, refreshToken);
  }
}
