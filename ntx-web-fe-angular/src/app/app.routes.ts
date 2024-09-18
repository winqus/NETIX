import { Routes } from '@angular/router';
import appMessages from '@ntx/assets/i18n/en/appMessages.json';
import { MainLayoutComponent } from '@ntx-core/layouts/main-layout/main-layout.component';
import { EmptyLayoutComponent } from '@ntx-core/layouts/empty-layout/empty-layout.component';
import { ErrorPageComponent } from '@ntx-pages/error-page/error-page.component';
import { MovieListComponent } from '@ntx-pages/movie-list/movie-list.component';
// import { UploadMediaComponent } from '@ntx-pages/upload-media-(legacy)/upload-media.component';
import { VideoMediaViewerComponent } from '@ntx-pages/video-media-viewer/video-media-viewer.component';
// import { UploadContentComponent } from '@ntx-pages/upload-content/upload-content.component';
import { CreateTitleComponent } from '@ntx-pages/create-title/create-title.component';
// import { AuthGuard } from '@auth0/auth0-angular';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    // canActivateChild: [AuthGuard],
    children: [{ path: '', component: MovieListComponent }],
  },
  {
    path: 'createTitle',
    component: MainLayoutComponent,
    // canActivateChild: [AuthGuard],
    children: [{ path: '', component: CreateTitleComponent }],
  },
  // {
  //   path: 'upload2',
  //   component: MainLayoutComponent,
  //   // canActivateChild: [AuthGuard],
  //   children: [{ path: '', component: UploadContentComponent }],
  // },
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
