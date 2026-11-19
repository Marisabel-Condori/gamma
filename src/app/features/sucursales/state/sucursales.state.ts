import { Injectable, signal } from '@angular/core';
import { HomologacionSucursal, HomologacionSucursalInput } from '../models/homologacion-sucursal.model';

@Injectable({ providedIn: 'root' })
export class SucursalesState {
  readonly rows = signal<HomologacionSucursal[]>([]);

  create(input: HomologacionSucursalInput): string | null {
    const codigo = input.codigo.trim();
    const descripcion = input.descripcion.trim();
    if (!codigo || !descripcion) return 'Completa el código y la descripción de la sucursal.';
    if (this.rows().some((row) => row.sistemaId === input.sistemaId && row.codigo === codigo)) {
      return 'Ya existe una sucursal con ese código en este sistema.';
    }
    this.commit((rows) => [...rows, { ...input, codigo, descripcion, id: `${input.sistemaId}-sucursal-${Date.now()}` }]);
    return null;
  }

  update(id: string, input: HomologacionSucursalInput): string | null {
    const codigo = input.codigo.trim();
    const descripcion = input.descripcion.trim();
    if (!codigo || !descripcion) return 'Completa el código y la descripción de la sucursal.';
    if (this.rows().some((row) => row.id !== id && row.sistemaId === input.sistemaId && row.codigo === codigo)) {
      return 'Ya existe una sucursal con ese código en este sistema.';
    }
    this.commit((rows) => rows.map((row) => row.id === id ? { ...row, ...input, codigo, descripcion } : row));
    return null;
  }

  delete(id: string): void {
    this.commit((rows) => rows.filter((row) => row.id !== id));
  }

  private commit(recipe: (rows: HomologacionSucursal[]) => HomologacionSucursal[]): void {
    this.rows.update((rows) => {
      const next = recipe(rows);
      return next;
    });
  }

}
