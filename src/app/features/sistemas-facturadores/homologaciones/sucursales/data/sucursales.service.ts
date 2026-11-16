import { Injectable, signal } from '@angular/core';
import { crearPuntosVenta, crearSucursales } from './sucursales.mock';
import { HomologacionSucursal, HomologacionSucursalRequest, PuntoVenta } from './sucursales.models';

const CLAVE = 'gamma.demo.sucursales.v2';

/** Sucursales homologadas y sus puntos de venta (datos de demostración en sessionStorage). */
@Injectable({ providedIn: 'root' })
export class SucursalesService {
  readonly sucursales = signal<HomologacionSucursal[]>(restaurar());
  readonly puntosVenta = signal<PuntoVenta[]>(crearPuntosVenta());

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
      try {
        sessionStorage.setItem(CLAVE, JSON.stringify(siguiente));
      } catch {
        // Si el navegador bloquea el almacenamiento, los datos siguen en memoria.
      }
      return siguiente;
    });
  }
}

function limpiar(datos: HomologacionSucursalRequest): HomologacionSucursalRequest {
  return { ...datos, codigo: datos.codigo.trim(), descripcion: datos.descripcion.trim() };
}

function restaurar(): HomologacionSucursal[] {
  try {
    const guardado = JSON.parse(sessionStorage.getItem(CLAVE) ?? 'null') as unknown;
    if (Array.isArray(guardado)) return guardado as HomologacionSucursal[];
  } catch {
    // Datos dañados: se usan los de ejemplo.
  }
  return crearSucursales();
}
