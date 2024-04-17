import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetCurrentUserId = createParamDecorator(
  (_: undefined, context: ExecutionContext): number => {
    const request = context.switchToHttp().getRequest();

    const user = request.user as { sub: number; email: string };
    console.log(request.user);
    return user.sub;
  },
);
