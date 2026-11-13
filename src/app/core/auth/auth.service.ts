import { Injectable } from '@angular/core';

const CLAVE = 'gamma.demo.authenticated';
const USUARIO_DEMO = 'admin';
const CLAVE_DEMO = '123456';

/** Sesión de demostración: se reemplazará por el login real del backend. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  estaAutenticado(): boolean {
    return sessionStorage.getItem(CLAVE) === 'true';
  }

  login(usuario: string, clave: string): boolean {
    if (usuario.trim() !== USUARIO_DEMO || clave !== CLAVE_DEMO) return false;
    sessionStorage.setItem(CLAVE, 'true');
    return true;
  }

  logout(): void {
    sessionStorage.removeItem(CLAVE);
  }
}
