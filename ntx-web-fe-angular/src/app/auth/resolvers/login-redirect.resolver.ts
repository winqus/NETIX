import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { AuthService } from '../auth.service';

export const loginRedirectResolver: ResolveFn<void> = (_route, _state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const type = authService.type.toLowerCase();
  const redirectUrl = `/auth/login-${type}`;
  router.navigateByUrl(redirectUrl);
};
