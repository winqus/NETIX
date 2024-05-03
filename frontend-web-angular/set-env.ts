/* eslint-disable @typescript-eslint/no-var-requires */
const { writeFile } = require('fs');
const { promisify } = require('util');
const dotenv = require('dotenv');

dotenv.config();

const writeFilePromisified = promisify(writeFile);

const targetEnvPath = './src/environments/environment.ts';
const targetDevEnvPath = './src/environments/environment.development.ts';

const envConfigFile = (isProduction = true) => `export const environment = {
  production: ${isProduction},
  development: ${!isProduction},
  auth0: {
    domain: '${process.env['AUTH0_DOMAIN']}',
    clientId: '${process.env['AUTH0_CLIENT_ID']}',
    authorizationParams: {
      audience: '${process.env['AUTH0_AUDIENCE']}',
      redirect_uri: '${process.env['AUTH0_CALLBACK_URL']}',
    },
    // errorPath: '',
  },
  api: {
    serverUrl: '${process.env['API_SERVER_URL']}',
  },
};
`;

(async () => {
  try {
    await writeFilePromisified(targetEnvPath, envConfigFile(true));
    await writeFilePromisified(targetDevEnvPath, envConfigFile(false));
  } catch (err) {
    console.error(err);
    throw err;
  }
})();
