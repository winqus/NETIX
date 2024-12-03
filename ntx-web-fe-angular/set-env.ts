/* eslint-disable @typescript-eslint/no-var-requires */
const { writeFile } = require('fs');
const { promisify } = require('util');
const dotenv = require('dotenv');

dotenv.config();

const writeFilePromisified = promisify(writeFile);

const targetEnvPath = './src/environments/environment.ts';
const targetDevEnvPath = './src/environments/environment.development.ts';

const envConfigFile = (isProduction = true) =>
  `import { FakeAuthServiceConfig } from '@ntx-auth/classes/fake-auth.service';
import { OAuth2ServiceConfig } from '@ntx-auth/classes/oauth2.service';

export const environment = {
  production: ${isProduction},
  development: ${!isProduction},
  useFakeAuth: ${process.env['USE_FAKE_AUTH']},
  fakeAuthConfig: {
    loggedIn: true,
    userOverrides: {
      /* Usage example: */
      // username: 'some_name'
      // roles: [Role.Viewer],
    },
  } satisfies FakeAuthServiceConfig,
  oAuth2Config: {
    clientId: '${process.env['OAUTH2_CLIENT_ID']}' /* OK to expose */,
    issuerUri: '${process.env['OAUTH2_ISSUER_URI']}',
    redirectUri: '${process.env['OAUTH2_REDIRECT_URI']}',
    responseType: 'code',
    scope: 'openid profile email offline_access',
    useDebugLogging: true,
  } satisfies Partial<OAuth2ServiceConfig>,
  api: {
    serverUrl: '${process.env['API_SERVER_URL']}',
  },
};
`;

const targetProxyPath = './src/proxy.conf.json';
const targetDevProxyPath = './src/proxy.conf.development.json';

const proxyConfigFile = (isProduction = true) =>
  `{
  "/api": {
    "target": "${process.env['API_SERVER_URL']}",
    "secure": true,
    "changeOrigin": true,
    "logLevel": "${isProduction ? '' : 'debug'}"
  },
  "/application": {
    "target": "${process.env['OAUTH2_SERVER_URL']}",
    "secure": false,
    "changeOrigin": true
  }
}`;

(async () => {
  try {
    await writeFilePromisified(targetEnvPath, envConfigFile(true));
    await writeFilePromisified(targetDevEnvPath, envConfigFile(false));

    await writeFilePromisified(targetProxyPath, proxyConfigFile(true));
    await writeFilePromisified(targetDevProxyPath, proxyConfigFile(false));
  } catch (err) {
    console.error(err);
    throw err;
  }
})();
