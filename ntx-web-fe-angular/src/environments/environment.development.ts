import { FakeAuthServiceConfig } from '@ntx/app/auth/classes/fake-auth.service';
import { OAuth2ServiceConfig } from '@ntx/app/auth/classes/oauth2.service';

export const environment = {
  production: false,
  development: true,
  useFakeAuth: true,
  fakeAuthConfig: {
    loggedIn: true,
    userOverrides: {
      /* Usage example: */
      // username: 'somename'
      // roles: [Role.Viewer],
    },
  } satisfies FakeAuthServiceConfig,
  oAuth2Config: {
    clientId: 'NIC1m9rgpXsmX4jXaC13qFAsIaMFv2TmQxSrgLsF' /* OK to expose */,
    issuerUri: 'http://localhost/application/o/netix/',
    redirectUri: window.location.origin + '/auth/callback',
    responseType: 'code',
    scope: 'openid profile email offline_access',
    useDebugLogging: true,
  } satisfies Partial<OAuth2ServiceConfig>,
  api: {
    serverUrl: 'http://localhost:3055',
  },
};
