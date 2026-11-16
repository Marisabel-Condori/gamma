import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../../../../environments/environment';

/** Campos que acepta el servicio REST para crear o modificar una sucursal. */
export interface SucursalApiRequest {
  direccion: string;
  municipio: string;
  departamento: string;
  observacion?: string;
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
  private readonly baseUrl = environment.apiBaseUrl;

  listarSucursales<T = unknown>() {
    return this.http.get<T>(`${this.baseUrl}/sucursales`);
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

  listarCuisCufdVigentes<T = unknown>() {
    return this.http.get<T>(`${this.baseUrl}/facturacion-codigos/cuis-cufd`);
  }
}
