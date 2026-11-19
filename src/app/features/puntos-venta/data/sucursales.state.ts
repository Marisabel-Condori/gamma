import { Injectable, signal } from '@angular/core';
import { HomologacionSucursal, HomologacionSucursalRequest, PuntoVenta } from './sucursales.model';


@Injectable({ providedIn: 'root' })
export class SucursalesState {
  readonly sucursales = signal<HomologacionSucursal[]>([]);
  readonly puntosVenta = signal<PuntoVenta[]>([]);

  puntosDe(sucursalId: string): PuntoVenta[] {
    return this.puntosVenta().filter((p) => p.sucursalId === sucursalId);
  }

  crear(datos: HomologacionSucursalRequest): string | null {
    const limpio = limpiar(datos);
    const error = this.validar(limpio);
    if (error) return error;
    this.guardar((lista) => [...lista, { ...limpio, id: `${limpio.sistemaId}-sucursal-${Date.now()}` }]);
    return null;
  }

  actualizar(id: string, datos: HomologacionSucursalRequest): string | null {
    const limpio = limpiar(datos);
    const error = this.validar(limpio, id);
    if (error) return error;
    this.guardar((lista) => lista.map((s) => (s.id === id ? { ...s, ...limpio } : s)));
    return null;
  }

  eliminar(id: string): void {
    this.guardar((lista) => lista.filter((s) => s.id !== id));
  }

  private validar(datos: HomologacionSucursalRequest, id?: string): string | null {
    if (!datos.codigo || !datos.descripcion) return 'Completa el código y la descripción de la sucursal.';
    const repetida = this.sucursales().some(
      (s) => s.id !== id && s.sistemaId === datos.sistemaId && s.codigo === datos.codigo,
    );
    return repetida ? 'Ya existe una sucursal con ese código en este sistema.' : null;
  }

  private guardar(receta: (lista: HomologacionSucursal[]) => HomologacionSucursal[]): void {
    this.sucursales.update((lista) => {
      const siguiente = receta(lista);
      return siguiente;
    });
  }
}

function limpiar(datos: HomologacionSucursalRequest): HomologacionSucursalRequest {
  return { ...datos, codigo: datos.codigo.trim(), descripcion: datos.descripcion.trim() };
}

