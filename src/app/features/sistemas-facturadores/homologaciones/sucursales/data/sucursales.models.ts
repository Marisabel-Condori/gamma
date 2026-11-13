export interface HomologacionSucursal {
  id: string;
  sistemaId: string;
  codigo: string;
  descripcion: string;
}

export type HomologacionSucursalRequest = Omit<HomologacionSucursal, 'id'>;

/** Relación de ejemplo entre un multicentro ENTEL y su sucursal/punto de venta SIN. */
export interface HomologacionMulticentro {
  id: string;
  sistemaId: string;
  fecha: string;
  codigoEntel: string;
  multicentroEntel: string;
  codigoSucursalSin: string;
  descripcionSin: string;
  codigoPuntoVentaSin: string;
  puntoVentaSin: string;
}

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
