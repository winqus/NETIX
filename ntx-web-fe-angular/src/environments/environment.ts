import { OAuth2ServiceConfig } from '@ntx/app/auth/classes/oauth2.service';

export const environment = {
  production: true,
  development: false,
  useFakeAuth: false,
  fakeAuthConfig: {},
  oAuth2Config: {
    clientId: 'x',
    issuerUri: 'x',
    redirectUri: window.location.origin + '/auth/callback',
    responseType: 'code',
    scope: 'openid profile email offline_access',
    useDebugLogging: false,
  } satisfies Partial<OAuth2ServiceConfig>,
  api: {
    serverUrl: 'http://localhost:3055',
  },
};
