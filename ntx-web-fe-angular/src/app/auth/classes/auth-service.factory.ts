import { Router } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';
import { OAuth2Service } from './oauth2.service';
import { FakeAuthServiceConfig, FakeAuthService } from './fake-auth.service';
import { OAuth2ServiceConfig } from './oauth2.service';
import { JwtService } from '../jwt.service';

export class AuthServiceFactory {
  public static makeOAuth2(config: OAuth2ServiceConfig, router: Router, oauthService: OAuthService): OAuth2Service {
    return new OAuth2Service(config, router, oauthService);
  }

  public static makeFake(config: FakeAuthServiceConfig, router: Router, jwt: JwtService): FakeAuthService {
    return new FakeAuthService(config, router, jwt);
  }
}
