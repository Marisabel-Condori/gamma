import { Injectable } from '@angular/core';

const AUTH_KEY = 'gamma.demo.authenticated';
const DEMO_USERNAME = 'admin';
const DEMO_PASSWORD = '123456';

@Injectable({ providedIn: 'root' })
export class AuthState {
  isAuthenticated(): boolean {
    return sessionStorage.getItem(AUTH_KEY) === 'true';
  }

  login(username: string, password: string): boolean {
    if (username.trim() !== DEMO_USERNAME || password !== DEMO_PASSWORD) return false;
    sessionStorage.setItem(AUTH_KEY, 'true');
    return true;
  }

  logout(): void {
    sessionStorage.removeItem(AUTH_KEY);
  }
}
