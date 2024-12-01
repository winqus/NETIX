import { Router } from '@angular/router';
import { AuthConfig, OAuthService, OAuthEvent, EventType } from 'angular-oauth2-oidc';
import { BehaviorSubject, Observable, distinctUntilChanged, of, from, switchMap } from 'rxjs';
import { AuthService, LoginOptions } from '../auth.service';
import { User } from '../user.entity';
import { decodeStateFromURIandBase64, encodeStateToBase64 } from '../utils/state.utils';

export interface OAuth2ServiceConfig {
  /**
   * Example: `http://localhost/application/o/myapp/`
   */
  issuerUri: string;
  /**
   * Examples: `http://localhost:4200/`, `http://localhost:4200/auth/callback`
   */
  redirectUri: string;
  /**
   * Example: `xSa5s_SOME_CLIENT_ID_XaWwqZ3s31aSdWWws`
   */
  clientId: string;
  /**
   * Example: `code`
   */
  responseType: string;
  /**
   * Example: `openid profile email offline_access`
   */
  scope: string;
  /**
   * Function that maps claims in the token to a User object
   */
  claimsToUserMapper: (claims: Record<string, any>) => User;
  /**
   * Default: `false`
   */
  useDebugLogging?: boolean;
  /**
   * Default: `/`
   */
  defaultLoginRedirectTo?: string;
  /**
   * Default: `/auth/login`
   */
  loginLoadingRoutePath?: string;
  /**
   * Default: `/auth/callback`
   */
  authCallbackRoutePath?: string;
  /**
   * Default: `5000`
   */
  authTimeout?: number;
}

export class OAuth2Service implements AuthService {
  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  private readonly isReadySubject = new BehaviorSubject<boolean>(false);
  private readonly config: Required<OAuth2ServiceConfig>;
  private readonly defaultConfig = {
    useDebugLogging: false,
    defaultLoginRedirectTo: '/',
    loginLoadingRoutePath: '/auth/login',
    authCallbackRoutePath: '/auth/callback',
    authTimeout: 5000,
  };

  constructor(
    oAuth2Config: OAuth2ServiceConfig,
    private readonly router: Router,
    private readonly oauthService: OAuthService
  ) {
    this.config = {
      ...this.defaultConfig,
      ...oAuth2Config,
    };

    this.configureOAuth(
      {
        issuer: oAuth2Config.issuerUri,
        redirectUri: oAuth2Config.redirectUri,
        clientId: oAuth2Config.clientId,
        responseType: oAuth2Config.responseType,
        scope: oAuth2Config.scope,
        showDebugInformation: oAuth2Config.useDebugLogging,
        strictDiscoveryDocumentValidation: false,
        oidc: true,
        checkOrigin: false,
      },
      this.handleOAuthEvent.bind(this)
    );

    this.log('Instance created');
  }

  private configureOAuth(config: AuthConfig, oauth2EventHandler: (event: OAuthEvent) => void) {
    this.oauthService.events.subscribe(oauth2EventHandler);

    this.oauthService.configure(config);
    this.oauthService.loadDiscoveryDocumentAndTryLogin();
    this.oauthService.setupAutomaticSilentRefresh();
    this.updateCurrentUser();
  }

  private handleOAuthEvent(event: OAuthEvent) {
    this.log('OAuthEvent:', event);

    const eventHandlers: Record<EventType, (() => void) | undefined> = {
      ['discovery_document_load_error']: this.handleDiscoveryDocumentLoadError,
      ['discovery_document_loaded']: this.handleDiscoveryDocumentLoaded,
      ['token_received']: this.handleTokenReceived,
      ['token_refreshed']: this.handleTokenRefreshed,
      ['token_refresh_error']: this.handleTokenRefreshError,
      ['jwks_load_error']: undefined,
      ['invalid_nonce_in_state']: undefined,
      ['discovery_document_validation_error']: undefined,
      ['user_profile_loaded']: undefined,
      ['user_profile_load_error']: undefined,
      ['token_error']: undefined,
      ['code_error']: undefined,
      ['silent_refresh_error']: undefined,
      ['silently_refreshed']: undefined,
      ['silent_refresh_timeout']: undefined,
      ['token_validation_error']: undefined,
      ['token_expires']: undefined,
      ['session_changed']: undefined,
      ['session_error']: undefined,
      ['session_terminated']: undefined,
      ['session_unchanged']: undefined,
      ['logout']: undefined,
      ['popup_closed']: undefined,
      ['popup_blocked']: undefined,
      ['token_revoke_error']: undefined,
    };

    const handler = eventHandlers[event.type];
    if (handler) {
      handler.call(this);
    }
  }

  private handleDiscoveryDocumentLoadError() {
    this.isReadySubject.next(false);
  }

  private handleDiscoveryDocumentLoaded() {
    this.isReadySubject.next(true);
    this.updateCurrentUser();
  }

  private handleTokenReceived() {
    this.updateCurrentUser();
  }

  private handleTokenRefreshed() {
    this.updateCurrentUser();

    if (this.isAtCallbackRoute()) {
      if (this.oauthService.state) {
        const { returnTo } = decodeStateFromURIandBase64<{
          returnTo: string;
        }>(this.oauthService.state);

        this.router.navigate([returnTo]);
      } else {
        this.router.navigate([this.config.defaultLoginRedirectTo]);
      }
    }
  }

  private handleTokenRefreshError() {
    if (this.isAtCallbackRoute()) {
      this.router.navigate([this.config.defaultLoginRedirectTo]);
    }
  }

  private isAtCallbackRoute(): boolean {
    return this.router.url.startsWith(this.config.authCallbackRoutePath);
  }

  private isAtLoginLoadingRoute(): boolean {
    return this.router.url.startsWith(this.config.loginLoadingRoutePath);
  }

  public isReady(timeoutMs?: number): Observable<boolean> {
    return new Observable<boolean>((subscriber) => {
      const subscription = this.isReadySubject.subscribe((ready) => {
        if (ready) {
          subscriber.next(true);
          subscriber.complete();
        }
      });

      let timeoutId: any;
      if (timeoutMs != null && timeoutMs > 0) {
        timeoutId = setTimeout(() => {
          subscriber.next(false);
          subscriber.complete();
        }, timeoutMs);
      }

      return () => {
        subscription.unsubscribe();
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };
    });
  }

  public get user(): Observable<User | null> {
    return this.currentUserSubject.asObservable().pipe(distinctUntilChanged());
  }

  public get type() {
    return OAuth2Service.getType();
  }

  public static getType(): 'OAuth2' {
    return 'OAuth2';
  }

  public login(options?: LoginOptions): Observable<void> {
    this.log('Login requested');

    const observable = this.isReady(this.config.authTimeout).pipe(
      switchMap((isReady) => {
        if (!isReady) {
          this.log('Not ready for login');
          throw new Error('Failed to start the login process with OAuth2');
        }

        const returnTo = options?.returnTo;

        let additionalState: string | undefined;
        if (returnTo) {
          additionalState = encodeStateToBase64({ returnTo });
        }

        this.oauthService.initCodeFlow(additionalState);

        if (this.isAtLoginLoadingRoute()) {
          this.router.navigate([this.config.loginLoadingRoutePath]);
        }

        this.log('Login process started');
        return of();
      })
    );

    observable.subscribe({
      error: (error) => {
        this.logError('Login error:', error.message);
      },
    });

    return observable;
  }

  public logout(): Observable<void> {
    this.log('Logout requested');

    const logoutPromise = this.oauthService.revokeTokenAndLogout(
      {
        client_id: this.oauthService.clientId,
        returnTo: this.oauthService.redirectUri,
      },
      true
    );

    return from(logoutPromise);
  }

  private updateCurrentUser() {
    this.log('Updating current user');

    const claims = this.oauthService.getIdentityClaims();

    if (!claims) {
      this.log('No claims found, setting current user to null');

      this.currentUserSubject.next(null);

      return;
    }

    const user = this.config.claimsToUserMapper(claims);

    this.currentUserSubject.next(user);

    this.log('Current user updated:', user);
  }

  private log(message: any, ...optionalParams: any[]) {
    if (!this.config.useDebugLogging) {
      return;
    }

    console.log('[OAuth2Service]', message, ...optionalParams);
  }

  private logError(message: any, ...optionalParams: any[]) {
    console.error('[OAuth2Service]', message, ...optionalParams);
  }
}
