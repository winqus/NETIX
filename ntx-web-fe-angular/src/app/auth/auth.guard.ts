import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { map, Observable, take } from 'rxjs';
import { AuthService } from './auth.service';
import { Permission, Role } from './user.entity';

const USE_DEBUG_LOGGING = true;
const NOT_AUTHENTICATED_REDIRECT = '/auth/login';
const NOT_AUTHORIZED_REDIRECT = '/error/403';

export const canActivateWithAuth: CanActivateFn = (_route, state): Observable<boolean> | boolean => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.user.pipe(
    take(1),
    map((user) => {
      if (user) {
        return true;
      } else {
        if (USE_DEBUG_LOGGING) {
          console.log(`User is not authenticated, calling login with returnTo: ${state.url}`);
        }
        router.navigate([NOT_AUTHENTICATED_REDIRECT]);
        auth.login({ returnTo: state.url });
        return false;
      }
    })
  );
};

export const canActivateWithRole: (allowedRoles: Role[]) => CanActivateFn = (allowedRoles) => (_route: ActivatedRouteSnapshot) => {
  console.log('called canActivateWithRole');

  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.user.pipe(
    take(1),
    map((user) => {
      if (user?.roles.some((role) => allowedRoles.includes(role))) {
        return true;
      } else {
        if (USE_DEBUG_LOGGING) {
          console.log(`User does not have an appropriate role, redirecting to ${NOT_AUTHORIZED_REDIRECT}`);
        }
        router.navigate([NOT_AUTHORIZED_REDIRECT]);
        return false;
      }
    })
  );
};

export const canActivateWithPermission: (requiredPermissions: Permission[]) => CanActivateFn = (requiredPermissions) => (_route: ActivatedRouteSnapshot) => {
  console.log('called canActivateWithPermission');

  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.user.pipe(
    take(1),
    map((user) => {
      if (user && requiredPermissions.every((permission) => user.hasPermission(permission))) {
        return true;
      } else {
        if (USE_DEBUG_LOGGING) {
          console.log(`User does not have permission, redirecting to ${NOT_AUTHORIZED_REDIRECT}`);
        }
        router.navigate([NOT_AUTHORIZED_REDIRECT]);
        return false;
      }
    })
  );
};

export const canActivateChildWithAuth: CanActivateChildFn = canActivateWithAuth;

export const canActivateChildWithRole: (allowedRoles: Role[]) => CanActivateChildFn = (allowedRoles) => {
  return (route, state) => canActivateWithRole(allowedRoles)(route, state);
};

export const canActivateChildWithPermission: (requiredPermissions: Permission[]) => CanActivateChildFn = (requiredPermissions) => {
  return (route, state) => canActivateWithPermission(requiredPermissions)(route, state);
};
