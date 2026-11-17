import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, switchMap, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'gamma.auth.token';
const PROFILE_KEY = 'gamma.auth.profile';
const API = environment.apiBaseUrl;

interface LoginResponse {
  codigo?: string;
  mensaje?: string;
  accessToken?: string;
  token?: string;
  usuario?: string;
  nombreApellido?: string;
  areaTrabajo?: string;
  empleado?: AuthProfile;
  empleadoRes?: AuthProfile;
  tokenCookie?: string;
  responseBody?: LoginResponse;
}

export interface AuthProfile {
  nombreApellido: string;
  areaTrabajo: string;
  usuario?: string;
}

/** Autenticación contra el backend Gamma, compatible con sesión por token o cookie HttpOnly. */
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
          usuario: profile.usuario?.trim() || '',
        };
      }
    } catch {
      // Si el perfil guardado no se puede leer, se usa el nombre genérico.
    }
    return { nombreApellido: 'Usuario', areaTrabajo: '', usuario: '' };
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
      switchMap((response) => {
        const body = response?.responseBody ?? response;
        const token = response?.accessToken ?? response?.token ?? response?.tokenCookie
          ?? body?.accessToken ?? body?.token;

        if (token) {
          sessionStorage.setItem(TOKEN_KEY, token);
          this.guardarPerfil(body, usuario);
          return of(undefined);
        }

        if (body?.codigo?.toUpperCase() !== 'OK') {
          return throwError(() => new Error(body?.mensaje || 'El backend rechazó el inicio de sesión.'));
        }

        // El backend actual usa una cookie HttpOnly y devuelve el perfil en /auth/me.
        sessionStorage.setItem(TOKEN_KEY, 'cookie-session');
        return this.http.get<AuthProfile>(`${API}/auth/me`).pipe(
          tap((profile) => this.guardarPerfil(profile, usuario)),
          map(() => undefined),
        );
      }),
    );
  }

  private guardarPerfil(response: LoginResponse | AuthProfile, usuario: string): void {
    const body = 'responseBody' in response ? response.responseBody ?? response : response;
    const profile = body as LoginResponse;
    const employee = profile.empleadoRes ?? profile.empleado;
    const nombreApellido = profile.nombreApellido?.trim()
      || employee?.nombreApellido?.trim()
      || usuario.trim();
    const areaTrabajo = profile.areaTrabajo?.trim() || employee?.areaTrabajo?.trim() || '';
    const usuarioSesion = employee?.usuario?.trim() || profile.usuario?.trim() || usuario.trim();
    sessionStorage.setItem(PROFILE_KEY, JSON.stringify({ nombreApellido, areaTrabajo, usuario: usuarioSesion }));
  }

  logout(): Observable<void> {
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (!token) {
      sessionStorage.removeItem(PROFILE_KEY);
      return of(undefined);
    }

    const options = token === 'cookie-session'
      ? {}
      : { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) };
    return this.http.post(`${API}/auth/logout`, {}, options).pipe(
      map(() => undefined),
      catchError(() => of(undefined)),
      tap(() => {
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(PROFILE_KEY);
      }),
    );
  }
}
