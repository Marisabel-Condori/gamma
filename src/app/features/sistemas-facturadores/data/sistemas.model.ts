export interface SistemaFacturadorResponse {
  idSistema: number;
  sistema: string;
  descripcion: string;
  fechaAlta: string;
  usuarioAlta: string;
  fechaModificacion?: string;
  usuarioModificacion?: string;
}

export interface SistemaResponse {
  id: string;
  idSistema: number;
  codigo: string;
  descripcion: string;
}

export interface SistemaRequest {
  sistema: string;
  descripcion: string;
  usuarioAlta: string;
}

export interface HomologacionProductoResponse {
  id: string;
  sistemaId: string;
  fecha: string;
  hora: string;
  codigoEntel: string;
  productoEntel: string;
  actividadCodigo: string;
  actividadNombre: string;
  codigoSin: string;
  productoSin: string;
}

export interface HomologacionProductoRequest {
  sistemaId: string;
  fecha: string;
  hora: string;
  codigoEntel: string;
  productoEntel: string;
  actividadCodigo: string;
  actividadNombre: string;
  codigoSin: string;
  productoSin: string;
}
