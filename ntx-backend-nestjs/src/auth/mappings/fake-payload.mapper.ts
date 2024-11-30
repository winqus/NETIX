import { hasPermission, Permission, PermissionStrings, User } from '../user.entity';

export class FakePayloadMapper {
  /**
   * @param payload Any payload with `id`, `username`, `email`, and `roles` properties
   * @returns User object
   * @throws Error if claims are invalid (e.g. `'Invalid claim: id'`)
   */
  public static payload2User(payload: Record<string, any>): User {
    const id = payload['id'];
    const username = payload['username'];
    const email = payload['email'];
    const roles = payload['roles'];

    if (!id || typeof id !== 'string') {
      throw new Error('Invalid claim: id');
    }
    if (!username || typeof username !== 'string') {
      throw new Error('Invalid claim: username');
    }
    if (!email || typeof email !== 'string') {
      throw new Error('Invalid claim: email');
    }
    if (!roles || !Array.isArray(roles)) {
      throw new Error('Invalid claim: roles');
    }

    const user: User = {
      id: id,
      username: username,
      email: email,
      roles: roles,
      hasPermission: (permission: Permission | PermissionStrings) => hasPermission(user, permission),
    };

    return user;
  }
}
