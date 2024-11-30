export enum Role {
  Viewer = 'viewer',
  Manager = 'manager',
}

export interface User {
  id: string;
  username: string;
  email: string;
  roles: Role[];
  hasPermission: (permission: Permission | PermissionStrings) => boolean;
}

export enum Permission {
  ReadTitleDetails = 'read:title-details',
  UpdateTitle = 'update:title',
  CreateTitle = 'create:title',
  DeleteTitle = 'delete:title',
  ReadTitles = 'read:titles',
}

export type PermissionStrings = keyof typeof Permission;

const ROLES: Record<Role, Array<Permission>> = {
  [Role.Manager]: [Permission.ReadTitleDetails, Permission.UpdateTitle, Permission.CreateTitle, Permission.DeleteTitle],
  [Role.Viewer]: [Permission.ReadTitles],
} as const;

export function hasPermission(user: User, permission: Permission | PermissionStrings) {
  return user.roles.some((role) => (ROLES[role] as readonly Permission[]).includes(permission as Permission));
}
