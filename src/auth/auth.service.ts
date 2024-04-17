import {
  BadRequestException,
  Body,
  ForbiddenException,
  Injectable,
  Param,
  Patch,
  UnauthorizedException,
} from '@nestjs/common';
import { SignInDto } from './dto/create-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { User } from 'src/users/entities/user.entity';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userReposiory: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async signUp(user: Partial<User>): Promise<User> {
    try {
      const hashedPassword = await argon2.hash(user?.password);

      const data = {
        ...user,
        fullName: `${user.firstName} ${user.lastName}` || user.fullName,
        password: hashedPassword,
      };
      const newUser = this.userReposiory.create(data);
      console.log('service:', data);

      return this.userReposiory.save(newUser);
    } catch (error) {
      throw new BadRequestException('Bad request');
    }
  }

  async signIn(user: SignInDto) {
    const result = await this.userReposiory.findOneBy({
      email: user.email,
    });
    if (!result) {
      throw new UnauthorizedException('Invalid email');
    }

    const matchPassword = await argon2.verify(result?.password, user?.password);
    if (!matchPassword) {
      throw new UnauthorizedException('Invalid password');
    }

    const jwtPayload = {
      sub: result.id,
      email: result.email,
    };

    const accessToken = await this.jwtService.signAsync(jwtPayload, {
      secret: process.env.ACCESS_TOKEN_SECRET,
      expiresIn: '10m',
      algorithm: 'HS256',
    });

    const refreshToken = await this.jwtService.signAsync(jwtPayload, {
      secret: process.env.REFRESH_TOKEN_SECRET,
      expiresIn: '1d',
      algorithm: 'HS256',
    });

    await this.userReposiory.update(result.id, { refreshToken: refreshToken });

    return {
      type: 'Bearer',
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refreshTokens(userId: number, rt: string) {
    console.log(userId, rt);

    const user = await this.userReposiory.findOneBy({ id: userId });
    if (!user || !user.refreshToken)
      throw new ForbiddenException('Access Denied');

    const rtMatches = await this.jwtService.verify(rt, {
      secret: process.env.REFRESH_TOKEN_SECRET,
      algorithms: ['HS256'],
    });
    if (!rtMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refresh_token);

    return {
      type: 'Bearer',
      ...tokens,
    };
  }

  async updateRtHash(userId: number, rt: string): Promise<void> {
    const user = await this.userReposiory.findOneBy({ id: userId });
    const hash = await this.jwtService.signAsync(
      { sub: userId, email: user.email },
      {
        secret: process.env.REFRESH_TOKEN_SECRET,
        expiresIn: '1d',
        algorithm: 'HS256',
      },
    );
    await this.userReposiory.update({ id: userId }, { refreshToken: hash });
  }

  async getTokens(userId: number, email: string) {
    const jwtPayload = {
      sub: userId,
      email: email,
    };

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: process.env.ACCESS_TOKEN_SECRET,
        algorithm: 'HS256',
        expiresIn: '10m',
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: process.env.REFRESH_TOKEN_SECRET,
        algorithm: 'HS256',
        expiresIn: '1d',
      }),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }
}
