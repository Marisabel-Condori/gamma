import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_VORTEX_SERVICE_URL } from '../../../../environments/environment';
import { SucursalApiRequest } from './puntos-venta.model';

@Injectable({ providedIn: 'root' })
export class SucursalesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = API_VORTEX_SERVICE_URL;

  listar<T = unknown>() { return this.http.get<T>(`${this.baseUrl}/sucursales`); }
  listarTodas<T = unknown>() { return this.http.get<T>(`${this.baseUrl}/sucursales/todas`); }
  obtener<T = unknown>(codigo: number) { return this.http.get<T>(`${this.baseUrl}/sucursales/${codigo}`); }
  crear<T = unknown>(codigo: number, datos: SucursalApiRequest) {
    return this.http.post<T>(`${this.baseUrl}/sucursales/${codigo}`, datos);
  }
  actualizar<T = unknown>(codigo: number, datos: SucursalApiRequest) {
    return this.http.put<T>(`${this.baseUrl}/sucursales/${codigo}`, datos);
  }
  eliminar<T = unknown>(codigo: number) { return this.http.delete<T>(`${this.baseUrl}/sucursales/${codigo}`); }
}
