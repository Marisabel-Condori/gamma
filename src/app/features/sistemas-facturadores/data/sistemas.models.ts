export interface SistemaResponse {
  id: string;
  codigo: string;
  descripcion: string;
}

export interface SistemaRequest {
  codigo: string;
  descripcion: string;
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
