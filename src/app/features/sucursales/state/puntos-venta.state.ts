import { Injectable, signal } from '@angular/core';
import { PuntoVenta } from '../models/punto-venta.model';

@Injectable({ providedIn: 'root' })
export class PuntosVentaState {
  readonly rows = signal<PuntoVenta[]>([]);

  forSucursal(sucursalId: string): PuntoVenta[] {
    return this.rows().filter((row) => row.sucursalId === sucursalId);
  }
}
