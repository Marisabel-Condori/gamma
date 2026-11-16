import { httpResource } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_URL } from '../../../core/constants';
import { ApiRespuesta } from '../../../core/models/api-respuesta.model';

export interface UnidadMedidaSin {
  idUnidadDeMedida: number;
  codigoClasificador: number;
  descripcion: string;
  fechaAlta: string;
}

@Injectable({ providedIn: 'root' })
export class CatalogoUnidadesMedidaService {
  readonly unidades = httpResource<ApiRespuesta<UnidadMedidaSin[]>>(() => `${API_URL}/catalogos/unidadDeMedida`);
}
