// Catálogos del SIN usados al homologar. Datos de demostración: luego vendrán del backend.

export interface ActividadSin {
  codigo: string;
  nombre: string;
}

export interface ProductoSin {
  codigo: string;
  nombre: string;
  actividad: string;
}

export const ACTIVIDADES_SIN: ActividadSin[] = [
  { codigo: '610000', nombre: 'Telecomunicaciones' },
  { codigo: '474100', nombre: 'Venta al por menor de equipos de telecomunicaciones' },
  { codigo: '951200', nombre: 'Reparación de equipos de comunicación' },
];

export const PRODUCTOS_SIN: ProductoSin[] = [
  { codigo: '99100', nombre: 'Otros productos o servicios alcanzados por el IVA', actividad: '610000' },
  { codigo: '84190', nombre: 'Otros servicios de telecomunicaciones', actividad: '610000' },
  { codigo: '84120', nombre: 'Servicios de telefonía móvil', actividad: '610000' },
  { codigo: '84220', nombre: 'Servicios de acceso a internet', actividad: '610000' },
  { codigo: '47410', nombre: 'Equipos de telecomunicaciones', actividad: '474100' },
  { codigo: '95120', nombre: 'Reparación de equipos de comunicación', actividad: '951200' },
];
