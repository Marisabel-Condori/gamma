import { httpResource } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_URL, TIEMPO_ESPERA_API } from '../../../core/constants';
import { ApiRespuesta } from '../../../core/models/api-respuesta.model';


export interface ActividadSin {
  idActividades: number;
  codigoCaeb: string;
  descripcion: string;
  tipoActividad: string;
  fechaAlta: string;
}

export interface ProductoServicioSin {
  idProductosServicios: number;
  codigoActividad: string;
  codigoProducto: number;
  descripcionProducto: string;
  fechaAlta: string;
}

@Injectable({ providedIn: 'root' })
export class CatalogoProductosService {
  readonly actividades = httpResource<ApiRespuesta<ActividadSin[]>>(() => ({
    url: `${API_URL}/catalogos/actividades`,
    timeout: TIEMPO_ESPERA_API,
  }));

  productosSegunActividad(codigoActividad: () => string) {
    return httpResource<ApiRespuesta<ProductoServicioSin[]>>(() => {
      const codigo = codigoActividad();
      return codigo
        ? {
            url: `${API_URL}/catalogos/productosServiciosPorCodigoActividad`,
            params: { codigoActividad: codigo },
            timeout: TIEMPO_ESPERA_API,
          }
        : undefined;
    });
  }
}
