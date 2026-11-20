export interface HomologacionCatalogoResponse {
  idHomologacion: number;
  idSistema: number;
  codigo: string;
  descripcion: string;
  idSin: number;
  codigoSin: number;
  descripcionSin: string;
  fechaAlta: string;
  fechaModificacion?: string;
}

export interface HomologacionCatalogoRequest {
  idSistema: number;
  codigo: string;
  descripcion: string;
  idSin: number;
}

export interface ActualizarHomologacionCatalogoRequest extends HomologacionCatalogoRequest {
  idHomologacion: number;
}

export interface ConfigHomologacion {
  titulo: string;
  tituloMovil: string;
  concepto: string;
  conceptoPlural: string;
  vacio: string;
  placeholderEntel: string;
  placeholderSin: string;
  endpoint: string;
  campoId: string;
}
