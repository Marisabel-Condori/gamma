import { HttpResourceRef, httpResource } from '@angular/common/http';
import { Injectable, Injector, inject, runInInjectionContext } from '@angular/core';
import { API_VORTEX_URL, TIEMPO_ESPERA_API } from '../../../../environments/environment';
import { ApiRespuesta } from '../../../core/models/api-respuesta.model';

export interface ClasificadorSin {
  codigoClasificador: number;
  descripcion: string;
  fechaAlta: string;
  [campoId: string]: string | number;
}

@Injectable({ providedIn: 'root' })
export class CatalogoSinService {
  private readonly injector = inject(Injector);
  private readonly cache = new Map<string, HttpResourceRef<ApiRespuesta<ClasificadorSin[]> | undefined>>();

  clasificador(endpoint: string): HttpResourceRef<ApiRespuesta<ClasificadorSin[]> | undefined> {
    let recurso = this.cache.get(endpoint);
    if (!recurso) {
      recurso = runInInjectionContext(this.injector, () =>
        httpResource<ApiRespuesta<ClasificadorSin[]>>(() => ({
          url: `${API_VORTEX_URL}/catalogos/${endpoint}`,
          timeout: TIEMPO_ESPERA_API,
        })),
      );
      this.cache.set(endpoint, recurso);
    }
    return recurso;
  }
}
