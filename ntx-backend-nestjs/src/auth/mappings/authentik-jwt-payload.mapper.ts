import { hasPermission, Permission, PermissionStrings, Role, User } from '../user.entity';

export class AuthentikJwtPayloadMapper {
  /**
   * @param payload Authentik JWT payload
   * @returns User object
   * @throws Error if claims are invalid (e.g. `'Invalid claim: sub'`)
   */
  public static payload2User(payload: Record<string, any>): User {
    const sub = payload['sub'];
    const username = payload['preferred_username'];
    const email = payload['email'];
    const groups = payload['groups'];
    const roles = payload['roles'];

    if (!sub || typeof sub !== 'string') {
      throw new Error('Invalid claim: sub');
    }
    if (!username || typeof username !== 'string') {
      throw new Error('Invalid claim: preferred_username');
    }
    if (!email || typeof email !== 'string') {
      throw new Error('Invalid claim: email');
    }
    if (!groups || !Array.isArray(groups)) {
      throw new Error('Invalid claim: groups');
    }

    const user: User = {
      id: sub,
      username: username,
      email: email,
      roles: roles ?? this.mapAuthentikGroupsToRoles(groups),
      hasPermission: (permission: Permission | PermissionStrings) => hasPermission(user, permission),
    };

    return user;
  }

  private static mapAuthentikGroupsToRoles(groups: string[]): Role[] {
    const groupToRoleTable: Record<string, Role> = {
      NetixUsers: Role.Viewer,
      NetixManagers: Role.Manager,
    };

    const roles = groups
      .filter((group) => groupToRoleTable.hasOwnProperty(group))
      .map((group) => groupToRoleTable[group]);

    return Array.from(new Set(roles));
  }
}
