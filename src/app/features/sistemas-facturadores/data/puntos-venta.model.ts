/** Campos que acepta el servicio REST para crear o modificar una sucursal. */
export interface SucursalApiRequest {
  codigoSucursalSin?: number;
  descripcion?: string;
  direccion: string;
  municipio: string;
  departamento: string;
  localidad?: string;
  oficina?: string;
  orgId?: string | number;
  observacion?: string;
}

export interface SucursalApiResponse {
  codSucursalSin: number;
  codigoCuis?: string;
  departamento: string;
  direccion: string;
  fechaAlta: string;
  municipio: string;
  observacion: string;
  descripcion?: string;
  localidad?: string;
  oficina?: string;
  orgId?: number | string;
}

export interface PuntoVentaSucursalApiResponse {
  codigoPuntoVenta: number;
  nombrePuntoVenta: string;
  tipoPuntoVenta: string;
  codigoSucursal: string;
  codigoCuis?: string;
  codigoCufd?: string;
  cufd?: string;
  fechaConsulta?: string;
  fechaVigenciaCuis?: string;
  fechaVigenciaCufd?: string;
  fechaCufd?: string;
  sincroniza?: boolean;
}

export interface PuntoVentaSucursalRequest {
  nombrePuntoVenta: string;
  tipoPuntoVenta: string;
  sincroniza: boolean;
}

export interface RegistrarPuntoVentaRequest {
  codigoAmbiente: number;
  codigoModalidad: number;
  codigoSistema: string;
  codigoSucursal: number;
  codigoTipoPuntoVenta: number;
  cuis: string;
  descripcion: string;
  nit: number;
  nombrePuntoVenta: string;
}

export interface CierrePuntoVentaRequest {
  codigoAmbiente: number;
  codigoPuntoVenta: number;
  codigoSistema: string;
  codigoSucursal: number;
  cuis: string;
  nit: number;
}

export interface PuntoVentaApiResponse {
  codigoCuis: string;
  codigoPuntoVenta: number;
  codigoSucursal: string;
  fechaConsulta?: string;
  fechaVigenciaCuis: string;
  nombrePuntoVenta: string;
  tipoPuntoVenta: string;
}

export interface CuisCufdVigenteApiResponse {
  codigoCufd: string;
  codigoCuis: string;
  codigoPuntoVenta: number;
  codigoSucursal: number | string;
  fechaVigenciaCufd: string;
  fechaVigenciaCuis: string;
}

/** Parámetros compartidos por las operaciones SIAT de la colección Postman. */
export interface ParametrosSiat {
  codigoAmbiente: number;
  codigoSistema: string;
  nit: number;
}

export interface SolicitudConsultaPuntoVenta extends ParametrosSiat {
  codigoSucursal: number;
  cuis: string;
}

export interface SolicitudSincronizarSucursal extends ParametrosSiat {
  codigoModalidad: number;
}

export interface SolicitudCuis extends ParametrosSiat {
  codigoModalidad: number;
  codigoPuntoVenta: number;
  codigoSucursal: number;
}

export interface SolicitudCufd extends SolicitudCuis {
  cuis: string;
}
