export interface HomologacionSucursalRequest {
  idSistema: number;
  codigoMulticentro: string;
  descripcion: string;
  codigoPuntoVenta: number;
  codigoSucursal: string;
  usuarioAlta: string;
  usuarioModificacion: string;
}

export interface HomologacionSucursalUpdateRequest {
  idSistema: number;
  codigoMulticentro: string;
  descripcion: string;
  codigoPuntoVenta: number;
  codigoSucursal: string;
}

export interface HomologacionSucursalApiResponse {
  idHomSucursal: number;
  idSistema: number;
  codigoMulticentro: string;
  descripcion: string;
  codigoPuntoVenta: number;
  codigoSucursal: string;
  fechaAlta: string;
  direccionSucursal?: string;
  nombrePuntoVenta?: string;
}

/** Datos de homologación entre un multicentro ENTEL y una sucursal/punto de venta SIN. */
export interface HomologacionMulticentro {
  id: string;
  idHomSucursal?: number;
  sistemaId: string;
  fecha: string;
  codigoEntel: string;
  multicentroEntel: string;
  codigoSucursalSin: string;
  descripcionSin: string;
  codigoPuntoVentaSin: string;
  puntoVentaSin: string;
}
