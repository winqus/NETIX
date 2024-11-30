import { Route } from '@angular/router';
import { FakeAuthService } from './classes/fake-auth.service';
import { OAuth2Service } from './classes/oauth2.service';
import { AuthCallbackComponent } from './components/callback/auth-callback.component';
import { FakeLoginComponent } from './components/login/fake-login.component';
import { OAuth2LoginComponent } from './components/login/oauth2-login.component';
import { loginRedirectResolver } from './resolvers/login-redirect.resolver';

export const authRoute: Route = {
  path: 'auth',
  children: [
    { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
    {
      path: 'login',
      resolve: { redirect: loginRedirectResolver },
      loadComponent: () => undefined as any,
    },
    {
      path: 'login-' + OAuth2Service.getType().toLowerCase(),
      pathMatch: 'full',
      component: OAuth2LoginComponent,
    },
    {
      path: 'login-' + FakeAuthService.getType().toLowerCase(),
      pathMatch: 'full',
      component: FakeLoginComponent,
    },
    {
      path: 'callback',
      component: AuthCallbackComponent,
    },
  ],
};
