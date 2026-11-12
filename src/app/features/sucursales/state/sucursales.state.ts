import { Injectable, signal } from '@angular/core';
import { HomologacionSucursal, HomologacionSucursalInput } from '../models/homologacion-sucursal.model';

const STORAGE_KEY = 'gamma.demo.sucursales.v1';
const SAMPLE_ROWS: Array<[string, string, string[]]> = [
  ['0', 'CALLE FEDERICO ZUAZO Nro. 1771 Edif.: TOWER Piso: 10 Depto.: - Zona/Barrio: CENTRAL La Paz', ['Casa matriz · La Paz', 'Tienda central']],
  ['1', 'ZONA: CENTRAL, CALLE: FEDERICO SUAZO, TIPO DE ESTABLECIMIENTO: EDIFICIO TOWER, NRO.: 1771', ['Oficina central']],
  ['2', 'CALLE GENERAL ACHA ESQ. AYACUCHO Nro. 113 Zona/Barrio: CENTRAL Cochabamba', ['Cochabamba central']],
  ['3', 'CALLE COCHABAMBA ESQ. PLAZA ARZE S/N Nro. 0 Zona/Barrio: CENTRAL Potosí', ['Potosí plaza Arze']],
  ['4', 'CALLE BOLIVAR ESQ. SORIA GALVARRO S/N Nro. 0 Zona/Barrio: CENTRAL Oruro', ['Oruro centro']],
  ['5', 'CALLE ESPAÑA Nro. 271 Zona/Barrio: CENTRAL Sucre', ['Sucre oficina']],
  ['6', 'CALLE VIRGINIO LEMA #231 Nro. 0 Zona/Barrio: CENTRAL Tarija', ['Tarija central']],
  ['7', 'CALLE WARNES Nro. 50 Zona/Barrio: ZONA CENTRAL - CASCO VIEJO Santa Cruz', ['Santa Cruz · Casco viejo', 'Equipetrol']],
  ['8', 'CALLE CIPRIANO BARACE Nro. 0 Zona/Barrio: CENTRAL Trinidad', ['Trinidad centro']],
  ['9', 'CALLE COCHABAMBA Nro. 0 Zona/Barrio: CENTRAL Yacuiba', []],
  ['10', 'AVENIDA 6 DE AGOSTO Nro. 2455 Zona/Barrio: SOPOCACHI La Paz', ['Sopocachi']],
  ['11', 'AVENIDA BLANCO GALINDO Km. 4 Zona/Barrio: SARCO Cochabamba', ['Blanco Galindo']],
  ['12', 'CALLE JUNIN Nro. 78 Zona/Barrio: CENTRAL Cobija', ['Cobija central']],
  ['13', 'AVENIDA BALLIVIAN Nro. 120 Zona/Barrio: CENTRAL Cochabamba', ['Ballivián']],
  ['14', 'CALLE AYACUCHO Nro. 44 Zona/Barrio: CENTRAL Oruro', ['Oruro centro']],
  ['15', 'AVENIDA BUSCH Nro. 890 Zona/Barrio: MIRAFLORES La Paz', ['Miraflores']],
  ['16', 'CALLE BALLIVIAN Nro. 53 Zona/Barrio: CENTRAL Sucre', ['Sucre centro']],
  ['17', 'AVENIDA MELCHOR PEREZ Nro. 135 Zona/Barrio: SARCO Cochabamba', ['Melchor Pérez']],
  ['18', 'CALLE COMERCIO Nro. 21 Zona/Barrio: CENTRAL Potosí', ['Potosí centro']],
  ['19', 'AVENIDA BANZER Nro. 3100 Zona/Barrio: NORTE Santa Cruz', ['Norte']],
];

function createSamples(): HomologacionSucursal[] {
  return SAMPLE_ROWS.map(([codigo, descripcion, puntosVenta], index) => ({
    id: `entel-ZSMART-sucursal-${index + 1}`,
    sistemaId: 'entel-ZSMART',
    codigo,
    descripcion,
    puntosVenta,
  }));
}

@Injectable({ providedIn: 'root' })
export class SucursalesState {
  readonly rows = signal<HomologacionSucursal[]>(this.restore());

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
      try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* Keep rows in memory if storage is unavailable. */ }
      return next;
    });
  }

  private restore(): HomologacionSucursal[] {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) return parsed as HomologacionSucursal[];
      }
    } catch { /* Use the sample records if stored data is unavailable. */ }
    return createSamples();
  }
}
