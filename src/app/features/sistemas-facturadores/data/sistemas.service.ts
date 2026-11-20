import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Observable, firstValueFrom, timeout } from 'rxjs';
import { API_GAMMA_URL, TIEMPO_ESPERA_API } from '../../../../environments/environment';
import { GammaRespuesta } from '../../../core/models/gamma-respuesta.model';
import {
  SistemaFacturadorResponse,
  SistemaRequest,
  SistemaResponse,
} from './sistemas.model';

@Injectable({ providedIn: 'root' })
export class SistemasService {
  private readonly http = inject(HttpClient);

  private readonly lista = signal<SistemaResponse[]>([]);
  private readonly estadoCargando = signal(false);
  private readonly estadoError = signal<string | null>(null);
  private peticion: Promise<void> | null = null;

  readonly sistemas = this.lista.asReadonly();
  readonly cargando = this.estadoCargando.asReadonly();
  readonly error = this.estadoError.asReadonly();

  cargar(): Promise<void> {
    this.peticion ??= this.pedir();
    return this.peticion;
  }

  recargar(): Promise<void> {
    this.peticion = this.pedir();
    return this.peticion;
  }

  private async pedir(): Promise<void> {
    this.estadoCargando.set(true);
    this.estadoError.set(null);
    try {
      const datos = await firstValueFrom(
        this.http
          .get<SistemaFacturadorResponse[]>(`${API_GAMMA_URL}/sistemas/facturadores`)
          .pipe(timeout(TIEMPO_ESPERA_API)),
      );
      this.lista.set(datos.map(aSistema));
    } catch {
      this.lista.set([]);
      this.estadoError.set('No se pudieron cargar los sistemas facturadores.');
      this.peticion = null;
    } finally {
      this.estadoCargando.set(false);
    }
  }

  crear(datos: SistemaRequest): Promise<string | null> {
    return this.enviar(
      this.http.post<GammaRespuesta>(`${API_GAMMA_URL}/sistemas/adicionar`, datos),
      'No se pudo crear el sistema.',
    );
  }

  actualizar(idSistema: number, datos: SistemaRequest): Promise<string | null> {
    return this.enviar(
      this.http.put<GammaRespuesta>(`${API_GAMMA_URL}/sistemas/actualizar`, datos, { params: { id: idSistema } }),
      'No se pudo actualizar el sistema.',
    );
  }

  eliminar(idSistema: number, usuario: string): Promise<string | null> {
    return this.enviar(
      this.http.delete<GammaRespuesta>(`${API_GAMMA_URL}/sistemas/eliminar`, { params: { id: idSistema, usuario } }),
      'No se pudo eliminar el sistema.',
    );
  }

  private async enviar(peticion: Observable<GammaRespuesta>, errorPorDefecto: string): Promise<string | null> {
    try {
      const respuesta = await firstValueFrom(peticion.pipe(timeout(TIEMPO_ESPERA_API)));
      if (respuesta.codigo !== 'OK') return respuesta.mensaje || errorPorDefecto;
      void this.recargar();
      return null;
    } catch (e) {
      const mensaje = e instanceof HttpErrorResponse ? e.error?.mensaje : null;
      return mensaje || 'No se pudo conectar con el servidor. Intenta de nuevo.';
    }
  }
}
export const cargarSistemas: ResolveFn<boolean> = () =>
  inject(SistemasService)
    .cargar()
    .then(() => true);

function aSistema(sistema: SistemaFacturadorResponse): SistemaResponse {
  return {
    id: String(sistema.idSistema),
    idSistema: sistema.idSistema,
    codigo: sistema.sistema,
    descripcion: sistema.descripcion,
  };
}
