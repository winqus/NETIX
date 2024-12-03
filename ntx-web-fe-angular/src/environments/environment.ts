import { FakeAuthServiceConfig } from '@ntx-auth/classes/fake-auth.service';
import { OAuth2ServiceConfig } from '@ntx-auth/classes/oauth2.service';

export const environment = {
  production: true,
  development: false,
  useFakeAuth: true,
  fakeAuthConfig: {
    loggedIn: true,
    userOverrides: {
      /* Usage example: */
      // username: 'some_name'
      // roles: [Role.Viewer],
    },
  } satisfies FakeAuthServiceConfig,
  oAuth2Config: {
    clientId: 'NIC1m9rgpXsmX4jXaC13qFAsIaMFv2TmQxSrgLsF' /* OK to expose */,
    issuerUri: 'http://localhost/application/o/netix/',
    redirectUri: 'http://localhost:4200/auth/callback',
    responseType: 'code',
    scope: 'openid profile email offline_access',
    useDebugLogging: true,
  } satisfies Partial<OAuth2ServiceConfig>,
  api: {
    serverUrl: 'http://localhost:3055',
  },
};
