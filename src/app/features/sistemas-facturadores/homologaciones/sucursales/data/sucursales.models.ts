export interface HomologacionSucursal {
  id: string;
  sistemaId: string;
  codigo: string;
  descripcion: string;
}

export type HomologacionSucursalRequest = Omit<HomologacionSucursal, 'id'>;

export interface PuntoVenta {
  id: string;
  sucursalId: string;
  codigo: string;
  descripcion: string;
  cuis: string;
  fechaCuis: string;
  cufd: string;
  fechaCufd: string;
  tipo: string;
  sincroniza: boolean;
}

/** Sistema del SIN contra el que se reprocesa un CUIS o CUFD. */
export interface SistemaSin {
  id: string;
  nombre: string;
  codigo: string;
}
