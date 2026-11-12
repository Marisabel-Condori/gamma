export interface Sistema {
  id: string;
  codigo: string;
  descripcion: string;
}

export interface SistemaInput {
  codigo: string;
  descripcion: string;
}

export interface HomologacionProducto {
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

export interface HomologacionProductoInput {
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
