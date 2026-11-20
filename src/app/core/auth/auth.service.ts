import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, switchMap, tap, throwError, timeout } from 'rxjs';
import { API_GAMMA_URL, TIEMPO_ESPERA_API } from '../../../environments/environment';

const CLAVE_TOKEN = 'gamma.auth.token';
const CLAVE_PERFIL = 'gamma.auth.perfil';
const SESION_POR_COOKIE = 'cookie-session';

export interface PerfilUsuario {
  nombreApellido: string;
  areaTrabajo: string;
  usuario: string;
}

interface RespuestaLogin {
  codigo?: string;
  mensaje?: string;
  accessToken?: string;
  token?: string;
  tokenCookie?: string;
  usuario?: string;
  nombreApellido?: string;
  areaTrabajo?: string;
  empleado?: Partial<PerfilUsuario>;
  empleadoRes?: Partial<PerfilUsuario>;
  responseBody?: RespuestaLogin;
}

const PERFIL_VACIO: PerfilUsuario = { nombreApellido: 'Usuario', areaTrabajo: '', usuario: '' };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly perfilActual = signal<PerfilUsuario>(leerPerfil());

  readonly perfil = this.perfilActual.asReadonly();
  readonly iniciales = computed(() => calcularIniciales(this.perfilActual().nombreApellido));

  estaAutenticado(): boolean {
    return Boolean(sessionStorage.getItem(CLAVE_TOKEN));
  }

  /** El backend puede responder con un token o con una cookie HttpOnly; en ese caso el perfil sale de /auth/me. */
  login(usuario: string, clave: string): Observable<void> {
    return this.http.post<RespuestaLogin>(`${API_GAMMA_URL}/auth/login`, { usuario: usuario.trim(), password: clave }).pipe(
      timeout(TIEMPO_ESPERA_API),
      switchMap((respuesta) => {
        const cuerpo = respuesta?.responseBody ?? respuesta;
        const token = respuesta?.accessToken ?? respuesta?.token ?? respuesta?.tokenCookie ?? cuerpo?.accessToken ?? cuerpo?.token;

        if (token) {
          sessionStorage.setItem(CLAVE_TOKEN, token);
          this.guardarPerfil(cuerpo, usuario);
          return of(undefined);
        }

        if (cuerpo?.codigo?.toUpperCase() !== 'OK') {
          return throwError(() => new Error(cuerpo?.mensaje || 'El backend rechazó el inicio de sesión.'));
        }

        sessionStorage.setItem(CLAVE_TOKEN, SESION_POR_COOKIE);
        return this.http.get<RespuestaLogin>(`${API_GAMMA_URL}/auth/me`).pipe(
          timeout(TIEMPO_ESPERA_API),
          tap((datos) => this.guardarPerfil(datos, usuario)),
          map(() => undefined),
        );
      }),
    );
  }

  logout(): Observable<void> {
    const token = sessionStorage.getItem(CLAVE_TOKEN);
    if (!token) {
      this.limpiarSesion();
      return of(undefined);
    }

    const opciones =
      token === SESION_POR_COOKIE ? {} : { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) };
    return this.http.post(`${API_GAMMA_URL}/auth/logout`, {}, opciones).pipe(
      map(() => undefined),
      catchError(() => of(undefined)),
      tap(() => this.limpiarSesion()),
    );
  }

  private guardarPerfil(datos: RespuestaLogin, usuario: string): void {
    const cuerpo = datos.responseBody ?? datos;
    const empleado = cuerpo.empleadoRes ?? cuerpo.empleado;
    const perfil: PerfilUsuario = {
      nombreApellido: texto(cuerpo.nombreApellido) || texto(empleado?.nombreApellido) || usuario.trim(),
      areaTrabajo: texto(cuerpo.areaTrabajo) || texto(empleado?.areaTrabajo),
      usuario: texto(empleado?.usuario) || texto(cuerpo.usuario) || usuario.trim(),
    };
    sessionStorage.setItem(CLAVE_PERFIL, JSON.stringify(perfil));
    this.perfilActual.set(perfil);
  }

  private limpiarSesion(): void {
    sessionStorage.removeItem(CLAVE_TOKEN);
    sessionStorage.removeItem(CLAVE_PERFIL);
    this.perfilActual.set(PERFIL_VACIO);
  }
}

function leerPerfil(): PerfilUsuario {
  try {
    const guardado = JSON.parse(sessionStorage.getItem(CLAVE_PERFIL) ?? 'null') as Partial<PerfilUsuario> | null;
    if (guardado) {
      return {
        nombreApellido: texto(guardado.nombreApellido) || PERFIL_VACIO.nombreApellido,
        areaTrabajo: texto(guardado.areaTrabajo),
        usuario: texto(guardado.usuario),
      };
    }
  } catch {
    // Perfil dañado: se usa el genérico.
  }
  return PERFIL_VACIO;
}

function calcularIniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  if (partes.length > 1) return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase();
  return (partes[0]?.slice(0, 2) || 'U').toUpperCase();
}

function texto(valor: string | undefined): string {
  return valor?.trim() ?? '';
}
