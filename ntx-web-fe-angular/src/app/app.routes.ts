import { Routes } from '@angular/router';
import appMessages from '@ntx/assets/i18n/en/appMessages.json';
import { MainLayoutComponent } from '@ntx-core/layouts/main-layout/main-layout.component';
import { EmptyLayoutComponent } from '@ntx-core/layouts/empty-layout/empty-layout.component';
import { ErrorPageComponent } from '@ntx-pages/error-page/error-page.component';
import { MovieListComponent } from '@ntx-pages/movie-list/movie-list.component';
import { VideoViewerComponent } from './pages/video-viewer/video-viewer.component';
import { CreateTitleComponent } from '@ntx-pages/create-title/create-title.component';
import { InspectMovieComponent } from './pages/inspect-movie/inspect-movie.component';
import { ViewMovieComponent } from './pages/view-movie/view-movie.component';
import { canActivateWithRole } from './auth/auth.guard';
import { Role } from './auth/user.entity';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [{ path: '', component: MovieListComponent }],
    data: { movieCardRedirect: 'view/movie' },
  },
  {
    path: 'manage',
    component: MainLayoutComponent,
    canActivate: [canActivateWithRole([Role.Manager])],
    children: [
      { path: '', redirectTo: '/manage/titles', pathMatch: 'full' },
      {
        path: 'titles',
        component: MovieListComponent,
        data: { movieCardRedirect: 'inspect/movie' },
      },
    ],
  },
  {
    path: 'create/title',
    component: MainLayoutComponent,
    canActivate: [canActivateWithRole([Role.Manager])],
    children: [{ path: '', component: CreateTitleComponent }],
  },
  {
    path: 'inspect/movie',
    component: MainLayoutComponent,
    canActivate: [canActivateWithRole([Role.Manager])],
    children: [
      { path: '', redirectTo: '/error/404', pathMatch: 'full' },
      { path: ':id', component: InspectMovieComponent },
    ],
  },
  {
    path: 'view/movie',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: '/error/404', pathMatch: 'full' },
      { path: ':id', component: ViewMovieComponent },
    ],
  },
  {
    path: 'watch/movie',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: '/error/404', pathMatch: 'full' },
      { path: ':id', component: VideoViewerComponent },
    ],
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
