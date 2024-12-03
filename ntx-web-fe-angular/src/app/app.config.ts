import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { authInterceptorFn } from './auth/auth.interceptor';
import { authProviders } from './auth/auth.providers';
import { authRoute } from './auth/auth.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    ...authProviders,
    provideRouter([authRoute, ...routes]),
    provideHttpClient(withInterceptors([authInterceptorFn])),
    provideAnimations(),
    provideToastr({
      positionClass: 'toast-top-right',
      closeButton: true,
      progressBar: true,
      maxOpened: 5,
      autoDismiss: true,
      preventDuplicates: true,
    }),
  ],
};
