import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // TODO: Inject the AuthService and get the token from there
  // const authService = inject(AuthService);
  // const authToken = authService.getToken();

  const authToken = 'some.fake-jwt.token'; // For testing purposes

  if (authToken) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return next(authReq);
  }

  return next(req);
};
