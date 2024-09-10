export const environment = {
  production: false,
  development: true,
  auth0: {
    domain: 'dev-wno8epqaenp8sdwi.eu.auth0.com',
    clientId: 'ZBmEG0e0JOiSAnNyAeD2BHvGrpuDI7QW',
    authorizationParams: {
      audience: 'https://mynappapi.example.com',
      redirect_uri: 'http://localhost:4200',
    },
    // errorPath: '',
  },
  api: {
    serverUrl: 'http://localhost:3055',
  },
};
