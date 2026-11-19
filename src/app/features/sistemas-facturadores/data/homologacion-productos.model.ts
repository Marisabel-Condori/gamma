export interface HomologacionProductoResponse {
  idHomologacionProducto: number;
  idSistema: number;
  codigo: string;
  descripcion: string;
  codigoActividadSin: string;
  descripcionActividadSin: string;
  codigoProductoServicioSin: string;
  descripcionProductoSin: string;
  fechaAlta: string;
  fechaModificacion?: string;
}

export interface HomologacionProductoRequest {
  idSistema: number;
  codigo: string;
  descripcion: string;
  idActividadSin: number;
  idProductoServicioSin: number;
}

export interface ActualizarHomologacionProductoRequest extends HomologacionProductoRequest {
  idHomologacionProducto: number;
}
