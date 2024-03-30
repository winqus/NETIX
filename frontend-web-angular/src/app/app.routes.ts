import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { EmptyLayoutComponent } from './layouts/empty-layout/empty-layout.component';
import { ErrorPageComponent } from './components/error-page/error-page.component';
import appMessages from '../assets/i18n/en/appMessages.json';
import { ExampleComponent } from './components/example/example.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [{ path: '', component: ExampleComponent }],
    // path: '',
    // component: MainLayoutComponent,
    // children: [{ path: '', component: MainPageComponent }],
  },
  {
    path: 'error',
    component: EmptyLayoutComponent,
    children: [
      { path: '', redirectTo: '/error/404', pathMatch: 'full' },
      {
        path: '403',
        component: ErrorPageComponent,
        data: {
          title: '403 Forbidden',
          errorCode: appMessages.http.error403Forbidden.status,
          errorMessage: appMessages.http.error403Forbidden.shortMessage,
          infoMessage: appMessages.redirection.toHome,
          redirectAfter: 1000,
          redirectTo: '/',
        },
      },
      {
        path: '404',
        component: ErrorPageComponent,
        data: {
          title: '404 Not Found',
          errorCode: appMessages.http.error404NotFound.status,
          errorMessage: appMessages.http.error404NotFound.shortMessage,
          infoMessage: appMessages.redirection.toHome,
          redirectAfter: 2000,
          redirectTo: '/',
        },
      },
    ],
  },
  // ... other routes before this
  { path: '**', redirectTo: '/error/404' }, // always last for handling invalid routes
];
