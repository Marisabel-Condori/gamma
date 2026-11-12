export interface HomologacionSucursal {
  id: string;
  sistemaId: string;
  codigo: string;
  descripcion: string;
  puntosVenta: string[];
}

export interface HomologacionSucursalInput {
  sistemaId: string;
  codigo: string;
  descripcion: string;
  puntosVenta: string[];
}
