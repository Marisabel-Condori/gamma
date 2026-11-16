import { Injectable } from '@angular/core';

const AUTH_STORAGE_KEY = 'gamma.authenticated';
const USUARIO = 'admin';
const PASSWORD = '123456';

@Injectable({ providedIn: 'root' })
export class AuthService {
  estaAutenticado(): boolean {
    return sessionStorage.getItem(AUTH_STORAGE_KEY) === 'true';
  }

  login(usuario: string, clave: string): boolean {
    if (usuario.trim() !== USUARIO || clave !== PASSWORD) return false;
    sessionStorage.setItem(AUTH_STORAGE_KEY, 'true');
    return true;
  }

  logout(): void {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  }
}
