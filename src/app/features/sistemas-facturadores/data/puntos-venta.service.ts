import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_VORTEX_SERVICE_URL } from '../../../../environments/environment';
import {
  CierrePuntoVentaRequest,
  CuisCufdVigenteApiResponse,
  PuntoVentaApiResponse,
  PuntoVentaSucursalApiResponse,
  PuntoVentaSucursalRequest,
  RegistrarPuntoVentaRequest,
  SolicitudCufd,
  SolicitudCuis,
  SolicitudConsultaPuntoVenta,
  SolicitudSincronizarSucursal,
} from './puntos-venta.model';

@Injectable({ providedIn: 'root' })
export class PuntosVentaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = API_VORTEX_SERVICE_URL;

  listarPorSucursal<T = unknown>(codigoSucursal: number) {
    return this.http.get<T>(`${this.baseUrl}/sucursales/${codigoSucursal}/puntos-venta`);
  }
  crear<T = PuntoVentaSucursalApiResponse>(codigoSucursal: number, datos: PuntoVentaSucursalRequest) {
    return this.http.post<T>(`${this.baseUrl}/sucursales/${codigoSucursal}/puntos-venta`, datos);
  }
  registrar<T = PuntoVentaSucursalApiResponse>(datos: RegistrarPuntoVentaRequest) {
    return this.http.post<T>(`${this.baseUrl}/facturacion-operaciones/registro-punto-venta`, datos);
  }
  consultar<T = unknown>(datos: SolicitudConsultaPuntoVenta) {
    return this.http.post<T>(`${this.baseUrl}/facturacion-operaciones/consulta-punto-venta`, datos);
  }
  cerrar<T = unknown>(datos: CierrePuntoVentaRequest) {
    return this.http.post<T>(`${this.baseUrl}/facturacion-operaciones/cierre-punto-venta`, datos);
  }
  sincronizar<T = unknown>(codigoSucursal: number, datos: SolicitudSincronizarSucursal) {
    return this.http.post<T>(`${this.baseUrl}/sucursales/${codigoSucursal}/sincronizar-puntos-venta`, datos);
  }
  listarTodos<T = PuntoVentaApiResponse[]>() { return this.http.get<T>(`${this.baseUrl}/sucursales/puntos-venta`); }
  verificarComunicacion<T = unknown>() {
    return this.http.post<T>(`${this.baseUrl}/facturacion-codigos/verificar-comunicacion`, null);
  }
  obtenerCuis<T = unknown>(datos: SolicitudCuis) { return this.http.post<T>(`${this.baseUrl}/facturacion-codigos/cuis`, datos); }
  obtenerCufd<T = unknown>(datos: SolicitudCufd) { return this.http.post<T>(`${this.baseUrl}/facturacion-codigos/cufd`, datos); }
  listarVigentes<T = CuisCufdVigenteApiResponse[]>() {
    return this.http.get<T>(`${this.baseUrl}/facturacion-codigos/cuis-cufd`);
  }
}
