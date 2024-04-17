import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type JwtPayload = {
  email: string;
  sub: number;
} & { refreshToken: string };

export const GetCurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const refreshToken = request.headers.authorization;

    if (!data) return request.user;
    return refreshToken.replace('Bearer ', '').trim('');
  },
);
