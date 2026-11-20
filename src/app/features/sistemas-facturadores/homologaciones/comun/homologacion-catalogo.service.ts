import { HttpClient, HttpErrorResponse, httpResource } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, firstValueFrom, timeout } from 'rxjs';
import { API_VORTEX_URL, TIEMPO_ESPERA_API } from '../../../../../environments/environment';
import { ApiRespuesta } from '../../../../core/models/api-respuesta.model';
import {
  ActualizarHomologacionCatalogoRequest,
  ConfigHomologacion,
  HomologacionCatalogoRequest,
  HomologacionCatalogoResponse,
} from './homologacion-catalogo.model';

@Injectable({ providedIn: 'root' })
export class HomologacionCatalogoService {
  private readonly http = inject(HttpClient);

  listar(config: ConfigHomologacion, idSistema: () => number | undefined) {
    return httpResource<ApiRespuesta<HomologacionCatalogoResponse[]>>(() => {
      const id = idSistema();
      return id === undefined
        ? undefined
        : { url: `${url(config)}/listar`, params: { idSistema: id }, timeout: TIEMPO_ESPERA_API };
    });
  }

  crear(config: ConfigHomologacion, datos: HomologacionCatalogoRequest): Promise<string | null> {
    return this.enviar(
      this.http.post<ApiRespuesta<unknown>>(`${url(config)}/crear`, datos),
      'No se pudo crear la homologación.',
    );
  }

  actualizar(config: ConfigHomologacion, datos: ActualizarHomologacionCatalogoRequest): Promise<string | null> {
    return this.enviar(
      this.http.put<ApiRespuesta<unknown>>(`${url(config)}/actualizar`, datos),
      'No se pudo actualizar la homologación.',
    );
  }

  eliminar(config: ConfigHomologacion, idHomologacion: number): Promise<string | null> {
    return this.enviar(
      this.http.put<ApiRespuesta<unknown>>(`${url(config)}/eliminar/${idHomologacion}`, null),
      'No se pudo eliminar la homologación.',
    );
  }

  /** Devuelve null si salió bien o el mensaje de error. */
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

function url(config: ConfigHomologacion): string {
  return `${API_VORTEX_URL}/homologacion/${config.endpoint}`;
}
