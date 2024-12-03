import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User as UserType } from '../user.entity';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UserType | UserType[keyof UserType] => {
    const request = ctx.switchToHttp().getRequest();

    return request.user;
  },
);
