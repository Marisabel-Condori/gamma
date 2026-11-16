import { HttpResourceRef, httpResource } from '@angular/common/http';
import { Injectable, Injector, inject, runInInjectionContext } from '@angular/core';
import { API_URL } from '../../../core/constants';
import { ApiRespuesta } from '../../../core/models/api-respuesta.model';

export interface ClasificadorSin {
  codigoClasificador: number;
  descripcion: string;
  fechaAlta: string;
}

@Injectable({ providedIn: 'root' })
export class CatalogoSinService {
  private readonly injector = inject(Injector);
  private readonly cache = new Map<string, HttpResourceRef<ApiRespuesta<ClasificadorSin[]> | undefined>>();

  clasificador(endpoint: string): HttpResourceRef<ApiRespuesta<ClasificadorSin[]> | undefined> {
    let recurso = this.cache.get(endpoint);
    if (!recurso) {
      recurso = runInInjectionContext(this.injector, () =>
        httpResource<ApiRespuesta<ClasificadorSin[]>>(() => `${API_URL}/catalogos/${endpoint}`),
      );
      this.cache.set(endpoint, recurso);
    }
    return recurso;
  }
}
