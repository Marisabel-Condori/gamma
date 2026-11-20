import { HttpClient, HttpErrorResponse, httpResource } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, firstValueFrom, timeout } from 'rxjs';
import { API_VORTEX_URL, TIEMPO_ESPERA_API } from '../../../../environments/environment';
import { ApiRespuesta } from '../../../core/models/api-respuesta.model';
import {
  ActualizarHomologacionProductoRequest,
  HomologacionProductoRequest,
  HomologacionProductoResponse,
} from './homologacion-productos.model';

const URL = `${API_VORTEX_URL}/homologacion/productosServicios`;

@Injectable({ providedIn: 'root' })
export class HomologacionProductosService {
  private readonly http = inject(HttpClient);

  listar(idSistema: () => number | undefined) {
    return httpResource<ApiRespuesta<HomologacionProductoResponse[]>>(() => {
      const id = idSistema();
      return id === undefined ? undefined : { url: `${URL}/listar`, params: { idSistema: id }, timeout: TIEMPO_ESPERA_API };
    });
  }

  crear(datos: HomologacionProductoRequest): Promise<string | null> {
    return this.enviar(this.http.post<ApiRespuesta<unknown>>(`${URL}/crear`, datos), 'No se pudo crear la homologación.');
  }

  actualizar(datos: ActualizarHomologacionProductoRequest): Promise<string | null> {
    return this.enviar(
      this.http.put<ApiRespuesta<unknown>>(`${URL}/actualizar`, datos),
      'No se pudo actualizar la homologación.',
    );
  }

  eliminar(idHomologacionProducto: number): Promise<string | null> {
    return this.enviar(
      this.http.put<ApiRespuesta<unknown>>(`${URL}/eliminar/${idHomologacionProducto}`, null),
      'No se pudo eliminar la homologación.',
    );
  }

  private async enviar(peticion: Observable<ApiRespuesta<unknown>>, errorPorDefecto: string): Promise<string | null> {
    try {
      const respuesta = await firstValueFrom(peticion.pipe(timeout(TIEMPO_ESPERA_API)));
      return respuesta.exito ? null : respuesta.mensaje || errorPorDefecto;
    } catch (e) {
      const mensaje = e instanceof HttpErrorResponse ? e.error?.mensaje : null;
      return mensaje || 'No se pudo conectar con el servidor. Intenta de nuevo.';
    }
  }
}
