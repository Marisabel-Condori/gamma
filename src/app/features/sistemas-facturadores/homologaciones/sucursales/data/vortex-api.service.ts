import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../../../../environments/environment';

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

/** Parámetros compartidos por las operaciones SIAT de la colección Postman. */
export interface ParametrosSiat {
  codigoAmbiente: number;
  codigoSistema: string;
  nit: number;
}

export interface SolicitudCuis extends ParametrosSiat {
  codigoModalidad: number;
  codigoPuntoVenta: number;
  codigoSucursal: number;
}

export interface SolicitudCufd extends SolicitudCuis {
  cuis: string;
}

/** Acceso HTTP al contrato de Postman. Las respuestas quedan como unknown hasta confirmar el DTO real del backend. */
@Injectable({ providedIn: 'root' })
export class VortexApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.vortexApiUrl;

  listarSucursales<T = unknown>() {
    return this.http.get<T>(`${this.baseUrl}/sucursales`);
  }

  listarPuntosVentaSucursal<T = unknown>(codigoSucursal: number) {
    return this.http.get<T>(`${this.baseUrl}/sucursales/${codigoSucursal}/puntos-venta`);
  }

  listarPuntosVenta<T = PuntoVentaApiResponse[]>() {
    return this.http.get<T>(`${this.baseUrl}/sucursales/puntos-venta`);
  }

  crearHomologacionSucursal<T = unknown>(datos: HomologacionSucursalRequest) {
    return this.http.post<T>(`${this.baseUrl}/hom-sucursales`, datos);
  }

  listarHomologacionesSucursal() {
    return this.http.get<HomologacionSucursalApiResponse[]>(`${this.baseUrl}/hom-sucursales`);
  }

  actualizarHomologacionSucursal<T = unknown>(idHomSucursal: number, datos: HomologacionSucursalUpdateRequest) {
    return this.http.put<T>(`${this.baseUrl}/hom-sucursales/${idHomSucursal}`, datos);
  }

  listarTodasLasSucursales<T = unknown>() {
    return this.http.get<T>(`${this.baseUrl}/sucursales/todas`);
  }

  obtenerSucursal<T = unknown>(codigo: number) {
    return this.http.get<T>(`${this.baseUrl}/sucursales/${codigo}`);
  }

  crearSucursal<T = unknown>(codigo: number, datos: SucursalApiRequest) {
    return this.http.post<T>(`${this.baseUrl}/sucursales/${codigo}`, datos);
  }

  actualizarSucursal<T = unknown>(codigo: number, datos: SucursalApiRequest) {
    return this.http.put<T>(`${this.baseUrl}/sucursales/${codigo}`, datos);
  }

  eliminarSucursal<T = unknown>(codigo: number) {
    return this.http.delete<T>(`${this.baseUrl}/sucursales/${codigo}`);
  }

  sincronizarPuntosVenta<T = unknown>(datos: ParametrosSiat) {
    return this.http.post<T>(`${this.baseUrl}/sucursales/sincronizar-puntos-venta`, datos);
  }

  verificarComunicacionCodigos<T = unknown>() {
    return this.http.post<T>(`${this.baseUrl}/facturacion-codigos/verificar-comunicacion`, null);
  }

  obtenerCuis<T = unknown>(datos: SolicitudCuis) {
    return this.http.post<T>(`${this.baseUrl}/facturacion-codigos/cuis`, datos);
  }

  obtenerCufd<T = unknown>(datos: SolicitudCufd) {
    return this.http.post<T>(`${this.baseUrl}/facturacion-codigos/cufd`, datos);
  }

  listarCuisCufdVigentes<T = CuisCufdVigenteApiResponse[]>() {
    return this.http.get<T>(`${this.baseUrl}/facturacion-codigos/cuis-cufd`);
  }
}
