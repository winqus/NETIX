import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';
// import { authHttpInterceptorFn, provideAuth0 } from '@auth0/auth0-angular';
// import { environment as env } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    // provideAuth0({
    //   ...env.auth0,
    //   httpInterceptor: {
    //     allowedList: ['*'],
    //   },
    // }),
    // provideHttpClient(withInterceptors([authHttpInterceptorFn])),
  ],
};
