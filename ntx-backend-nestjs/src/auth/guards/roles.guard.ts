import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from '../user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    try {
      const roles = this.reflector.get<string[]>('roles', context.getHandler());
      if (!roles) {
        return true;
      }

      const user = context.switchToHttp().getRequest().user as User;
      const hasRole = user.roles.some((role) => roles.includes(role));
      if (!hasRole) {
        this.logger.warn(`Blocked user ${user.id} due to lack of required role(s)`);
      }

      return hasRole;
    } catch (error) {
      this.logger.error(`Error during authorization: ${error.message}`);
    }

    return false;
  }
}
