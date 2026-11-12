import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { AuthState } from './auth-state';

export const authGuard: CanActivateChildFn = (_route, state) => {
  const auth = inject(AuthState);
  const router = inject(Router);
  return auth.isAuthenticated()
    ? true
    : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
