import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from '@ntx-core/providers/auth.interceptor';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';

// import { authHttpInterceptorFn, provideAuth0 } from '@auth0/auth0-angular';
// import { environment as env } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),
    provideToastr({
      positionClass: 'toast-top-right', // Position to bottom-left
      closeButton: true,
      progressBar: true,
      maxOpened: 5, // Maximum number of toasts displayed at once
      autoDismiss: true, // Automatically dismiss old toasts when max is reached
      preventDuplicates: true, // Prevent duplicate toasts
    }),
    // provideAuth0({
    //   ...env.auth0,
    //   httpInterceptor: {
    //     allowedList: ['*'],
    //   },
    // }),
    // provideHttpClient(withInterceptors([authHttpInterceptorFn])),
  ],
};
