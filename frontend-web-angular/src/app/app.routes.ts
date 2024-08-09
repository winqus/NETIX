import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { EmptyLayoutComponent } from './layouts/empty-layout/empty-layout.component';
import { ErrorPageComponent } from './components/error-page/error-page.component';
import appMessages from '../assets/i18n/en/appMessages.json';
import { MovieListComponent } from './components/movie-list/movie-list.component';
import { UploadMediaComponent } from './components/upload-media/upload-media.component';
import { VideoMediaViewerComponent } from './components/video-media-viewer/video-media-viewer.component';
import { UploadContentComponent } from './components/upload-content/upload-content.component';
// import { AuthGuard } from '@auth0/auth0-angular';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    // canActivateChild: [AuthGuard],
    children: [{ path: '', component: MovieListComponent }],
  },
  {
    path: 'upload',
    component: MainLayoutComponent,
    // canActivateChild: [AuthGuard],
    children: [{ path: '', component: UploadMediaComponent }],
  },
  {
    path: 'upload2',
    component: MainLayoutComponent,
    // canActivateChild: [AuthGuard],
    children: [{ path: '', component: UploadContentComponent }],
  },
  {
    path: 'watch',
    component: MainLayoutComponent,
    // canActivateChild: [AuthGuard],
    children: [
      { path: '', redirectTo: '/error/404', pathMatch: 'full' },
      { path: ':uuid', component: VideoMediaViewerComponent },
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
