export interface Empresa {
  id: string;
  codigo: string;
  razonSocial: string;
}

export interface Sistema {
  id: string;
  empresaId: string;
  codigo: string;
  descripcion: string;
}

export interface SistemaInput {
  empresaId: string;
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

