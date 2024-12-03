import { BehaviorSubject, Observable, of, switchMap, timer } from 'rxjs';
import { AuthService, LoginOptions } from '../auth.service';
import { User, Role, hasPermission, Permission, PermissionStrings } from '../user.entity';
import { Router } from '@angular/router';
import { JwtService } from '../jwt.service';
import { encodeStateToBase64 } from '../utils/state.utils';

export interface FakeAuthServiceConfig {
  /**
   * Uses default user details. Can be overridden by `userOverrides`.
   */
  user?: User;
  /**
   * Default: `true`
   */
  isReady?: boolean;
  /**
   * Default: `false`
   */
  loggedIn?: boolean;
  /**
   * Overrides for the default user details.
   */
  userOverrides?: Partial<User>;
  /**
   * Default: `/auth/login`
   */
  loginPath?: string;
}

export class FakeAuthService implements AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isReadySubject = new BehaviorSubject<boolean>(true);

  constructor(
    private config: FakeAuthServiceConfig,
    private readonly router: Router,
    private readonly jwtService: JwtService
  ) {
    jwtService.clearToken(); /* Clear any existing token to prevent format conflicts */

    if (!config.user) {
      config.user = {
        id: 'mrfake-user-id-123',
        username: 'mrfake',
        email: 'mrfaker@fake.mail',
        roles: [...Object.values(Role)],
        hasPermission: (permission: Permission | PermissionStrings) => hasPermission(config.user!, permission),
      };
    }

    if (config.userOverrides) {
      config.user = { ...config.user, ...config.userOverrides };
    }

    if (config.loggedIn) {
      this.updateUser(config.user);
    }

    if (!config.loginPath) {
      config.loginPath = '/auth/login';
    }

    this.isReadySubject.next(config.isReady ?? true);

    this.log('created');
  }

  public isReady(_timeoutMs?: number): Observable<boolean> {
    return this.isReadySubject.asObservable();
  }

  public get user(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  public get type() {
    return FakeAuthService.getType();
  }

  public static getType(): 'fake' {
    return 'fake';
  }

  public login(options?: LoginOptions): Observable<void> {
    this.log('Login requested');
    this.router.navigate([this.config.loginPath]);
    const observable = timer(500).pipe(
      switchMap(() => {
        if (this.config.user) {
          this.updateUser(this.config.user);
        }
        this.router.navigate([options?.returnTo ?? '/']);
        return of();
      })
    );

    observable.subscribe();

    return observable;
  }

  public logout(): Observable<void> {
    this.updateUser(null);
    this.jwtService.clearToken();

    return of();
  }

  private updateUser(user: User | null) {
    this.log('Current user updated:', user);
    this.currentUserSubject.next(user);
    this.jwtService.saveToken(encodeStateToBase64(user));
  }

  private log(message: any, ...optionalParams: any[]) {
    console.log('[FakeAuthService]', message, ...optionalParams);
  }
}
