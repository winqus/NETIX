import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission, PermissionStrings, User } from '../user.entity';

@Injectable()
export class PermissionGuard implements CanActivate {
  private readonly logger = new Logger(PermissionGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    try {
      const permission = this.reflector.get<Permission | PermissionStrings>('permission', context.getHandler());
      if (!permission) {
        return true;
      }

      const user = context.switchToHttp().getRequest().user as User;

      const hasPermission = user.hasPermission(permission);
      if (!hasPermission) {
        this.logger.warn(`Blocked access for user '${user.id}' without permission '${permission}'`);
      }

      return hasPermission;
    } catch (error) {
      this.logger.error(`Error during authorization: ${error.message}`);
    }

    return false;
  }
}
