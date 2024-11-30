import { SetMetadata } from '@nestjs/common';
import { Permission, PermissionStrings } from './user.entity';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

export const HasPermission = (permission: Permission | PermissionStrings) => SetMetadata('permission', permission);
