import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { FakePayloadMapper } from '../mappings/fake-payload.mapper';
import { hasPermission, Permission, PermissionStrings, Role, User } from '../user.entity';

export interface FakeAuthenticationGuardOptions {
  /**
   * Default user details. Can be overridden by `userOverrides`.
   */
  user?: User;
  /**
   * Default: `true`
   */
  isAuthorized?: boolean;
  /**
   * Overrides for the default user details.
   */
  userOverrides?: Partial<User>;

  /**
   * Default: `true`
   */
  authorizeIfNoToken?: boolean;
}

@Injectable()
export class FakeAuthenticationGuard implements CanActivate {
  private readonly logger = new Logger(FakeAuthenticationGuard.name);
  private readonly options: Required<FakeAuthenticationGuardOptions>;
  private readonly defaultOptions: Required<FakeAuthenticationGuardOptions> = {
    user: {
      id: 'default-fake-user-id-123',
      username: 'defaultMissFake',
      email: 'defaultmissfake@fakemail.mail',
      roles: [...Object.values(Role)],
      hasPermission: (permission: Permission | PermissionStrings) =>
        hasPermission(this.defaultOptions.user!, permission),
    },
    isAuthorized: true,
    userOverrides: {},
    authorizeIfNoToken: true,
  };

  constructor(options: FakeAuthenticationGuardOptions) {
    this.options = {
      ...this.defaultOptions,
      ...options,
    };

    if (this.options.userOverrides) {
      this.options.user = {
        ...this.options.user,
        ...this.options.userOverrides,
      };
    }

    this.logger.warn('Using FakeAuthenticationGuard strategy');
  }

  public async canActivate(context: ExecutionContext) {
    try {
      if (!this.options.isAuthorized) {
        return false;
      }

      const request = context.switchToHttp().getRequest();
      const authorizationHeader = request.headers['authorization'];
      let user: User | undefined;

      if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
        let tokenPayload;
        try {
          const fakeToken = authorizationHeader.split(' ')[1];
          tokenPayload = this.decodeBase64Token(fakeToken);
        } catch (error) {
          this.logger.error('Malformed token', error.message);

          return false;
        }

        try {
          user = FakePayloadMapper.payload2User(tokenPayload as any);
        } catch (error) {
          this.logger.error(`Error mapping payload to user: ${error.message}`);
        }
      } else if (!this.options.authorizeIfNoToken) {
        return false;
      }

      if (!user) {
        user = this.options.user;
      }

      request['user'] = user;

      return true;
    } catch (error) {
      this.logger.error(`Error during authentication: ${error.message}`);
    }

    return false;
  }

  /**
   * @param token A base64 encoded JSON string
   * @returns Object
   */
  private decodeBase64Token(token: string): unknown {
    return JSON.parse(Buffer.from(token, 'base64').toString());
  }
}
