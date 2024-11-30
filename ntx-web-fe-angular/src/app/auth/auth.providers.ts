import { EnvironmentProviders, Provider } from '@angular/core';
import { OAuthService, provideOAuthClient } from 'angular-oauth2-oidc';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { AuthServiceFactory } from './classes/auth-service.factory';
import { ClaimsToUserMapper } from './mappings/claims-to-user.mapper';
import { JwtService } from './jwt.service';
import { JWT_SERVICE_CONFIG } from './auth.constants';
import { environment } from '@ntx/environments/environment';

export const authProviders: (Provider | EnvironmentProviders)[] = [
  provideOAuthClient(),
  {
    provide: JWT_SERVICE_CONFIG,
    useFactory: () => {
      if (!environment.production && environment.useFakeAuth) {
        return {
          storage: window.sessionStorage,
          tokenKey: 'fake_access_token',
        };
      }

      return {
        storage: window.sessionStorage,
        tokenKey: 'access_token',
      };
    },
  },
  {
    provide: AuthService,
    useFactory: (router: Router, oauthService: OAuthService, jwt: JwtService) => {
      if (!environment.production && environment.useFakeAuth) {
        return AuthServiceFactory.makeFake(environment.fakeAuthConfig, router, jwt);
      }
      return AuthServiceFactory.makeOAuth2(
        {
          authCallbackRoutePath: '/auth/callback',
          defaultLoginRedirectTo: '/',
          loginLoadingRoutePath: '/auth/login',
          claimsToUserMapper: (claims) => ClaimsToUserMapper.mapAuthentikClaimsToUser(claims),
          ...environment.oAuth2Config,
        },
        router,
        oauthService
      );
    },
    deps: [Router, OAuthService, JwtService],
  },
];
