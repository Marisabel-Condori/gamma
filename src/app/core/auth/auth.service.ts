import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'gamma.auth.token';
const PROFILE_KEY = 'gamma.auth.profile';
const API = environment.apiBaseUrl;

interface LoginResponse {
  accessToken?: string;
  token?: string;
  nombreApellido?: string;
  areaTrabajo?: string;
  empleado?: AuthProfile;
  empleadoRes?: AuthProfile;
}

export interface AuthProfile {
  nombreApellido: string;
  areaTrabajo: string;
}

/** Autenticación contra el backend Gamma. El token vive solo durante la pestaña. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  estaAutenticado(): boolean {
    return Boolean(sessionStorage.getItem(TOKEN_KEY));
  }

  get perfil(): AuthProfile {
    try {
      const raw = sessionStorage.getItem(PROFILE_KEY);
      if (raw) {
        const profile = JSON.parse(raw) as Partial<AuthProfile>;
        return {
          nombreApellido: profile.nombreApellido?.trim() || 'Usuario',
          areaTrabajo: profile.areaTrabajo?.trim() || '',
        };
      }
    } catch {
      // Si el perfil guardado no se puede leer, se usa el nombre genérico.
    }
    return { nombreApellido: 'Usuario', areaTrabajo: '' };
  }

  get iniciales(): string {
    const partes = this.perfil.nombreApellido.trim().split(/\s+/).filter(Boolean);
    return partes.length > 1
      ? `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase()
      : (partes[0]?.slice(0, 2) || 'U').toUpperCase();
  }

  login(usuario: string, password: string): Observable<void> {
    return this.http.post<LoginResponse>(`${API}/auth/login`, {
      usuario: usuario.trim(),
      password,
    }).pipe(
      tap((response) => {
        const token = response?.accessToken ?? response?.token;
        if (!token) throw new Error('El backend no devolvió un token.');
        sessionStorage.setItem(TOKEN_KEY, token);
        const employee = response.empleadoRes ?? response.empleado;
        const nombreApellido = response.nombreApellido?.trim()
          || employee?.nombreApellido?.trim()
          || usuario.trim();
        const areaTrabajo = response.areaTrabajo?.trim() || employee?.areaTrabajo?.trim() || '';
        sessionStorage.setItem(PROFILE_KEY, JSON.stringify({ nombreApellido, areaTrabajo }));
      }),
      map(() => undefined),
    );
  }

  logout(): Observable<void> {
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (!token) {
      sessionStorage.removeItem(PROFILE_KEY);
      return of(undefined);
    }

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.post(`${API}/auth/logout`, {}, { headers }).pipe(
      map(() => undefined),
      catchError(() => of(undefined)),
      tap(() => {
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(PROFILE_KEY);
      }),
    );
  }
}
