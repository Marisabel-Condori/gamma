import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_VORTEX_SERVICE_URL } from '../../../../../../environments/environment';
import { HomologacionSucursalApiResponse, HomologacionSucursalRequest, HomologacionSucursalUpdateRequest } from './multicentros.model';

@Injectable({ providedIn: 'root' })
export class MulticentrosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = API_VORTEX_SERVICE_URL;

  listar(idSistema: number) {
    return this.http.get<HomologacionSucursalApiResponse[]>(`${this.baseUrl}/hom-sucursales/${idSistema}`);
  }

  crear<T = unknown>(datos: HomologacionSucursalRequest) {
    return this.http.post<T>(`${this.baseUrl}/hom-sucursales`, datos);
  }

  actualizar<T = unknown>(idHomSucursal: number, datos: HomologacionSucursalUpdateRequest) {
    return this.http.put<T>(`${this.baseUrl}/hom-sucursales/${idHomSucursal}`, datos);
  }
}
