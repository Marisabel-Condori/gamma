import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/** Sin sesión → al login, recordando a dónde quería ir. */
export const authGuard: CanActivateChildFn = (_ruta, estado) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.estaAutenticado()
    ? true
    : router.createUrlTree(['/login'], { queryParams: { returnUrl: estado.url } });
};
