import { Injectable, computed, signal } from '@angular/core';
import { HomologacionProductoResponse, HomologacionProductoRequest, SistemaRequest, SistemaResponse } from '../models/gamma.models';
import { GammaData, createSeed } from './seed';

const STORAGE_KEY = 'gamma.demo.v2';

@Injectable({ providedIn: 'root' })
export class GammaState {
  private readonly state = signal<GammaData>(this.restore());

  readonly sistemas = computed(() => this.state().sistemas);
  readonly homologaciones = computed(() => this.state().homologaciones);

  createSistema(input: SistemaRequest): string | null {
    const codigo = cleanUpper(input.codigo);
    const descripcion = input.descripcion.trim();
    if (!codigo || !descripcion) {
      return 'Completa código y descripción.';
    }

    if (this.state().sistemas.some((sistema) => sistema.codigo === codigo)) {
      return 'Ya existe un sistema con ese código.';
    }

    this.commit((current) => ({
      ...current,
      sistemas: [...current.sistemas, { id: codigo, codigo, descripcion }],
    }));
    return null;
  }

  updateSistema(id: string, input: SistemaRequest): string | null {
    const codigo = cleanUpper(input.codigo);
    const descripcion = input.descripcion.trim();
    if (!codigo || !descripcion) {
      return 'Completa código y descripción.';
    }

    if (this.state().sistemas.some((sistema) => sistema.id !== id && sistema.codigo === codigo)) {
      return 'Ya existe un sistema con ese código.';
    }

    this.commit((current) => ({
      ...current,
      sistemas: current.sistemas.map((sistema) =>
        sistema.id === id ? { ...sistema, codigo, descripcion } : sistema,
      ),
    }));
    return null;
  }

  deleteSistema(id: string): void {
    this.commit((current) => ({
      ...current,
      sistemas: current.sistemas.filter((sistema) => sistema.id !== id),
      homologaciones: current.homologaciones.filter((item) => item.sistemaId !== id),
    }));
  }

  createHomologacion(input: HomologacionProductoRequest): string | null {
    const payload = cleanHomologacion(input);
    if (!payload) {
      return 'Completa todos los campos de la homologación.';
    }
    this.commit((current) => ({
      ...current,
      homologaciones: [...current.homologaciones, { ...payload, id: `${input.sistemaId}-homo-${Date.now()}` }],
    }));
    return null;
  }

  updateHomologacion(id: string, input: HomologacionProductoRequest): string | null {
    const payload = cleanHomologacion(input);
    if (!payload) {
      return 'Completa todos los campos de la homologación.';
    }
    this.commit((current) => ({
      ...current,
      homologaciones: current.homologaciones.map((item) => (item.id === id ? { ...item, ...payload } : item)),
    }));
    return null;
  }

  deleteHomologacion(id: string): void {
    this.commit((current) => ({
      ...current,
      homologaciones: current.homologaciones.filter((item) => item.id !== id),
    }));
  }

  private commit(recipe: (data: GammaData) => GammaData): void {
    this.state.update((current) => {
      const next = recipe(current);
      this.persist(next);
      return next;
    });
  }

  private restore(): GammaData {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return createSeed();
      }
      const parsed = JSON.parse(raw) as {
        empresas?: unknown;
        sistemas?: Array<SistemaResponse & { empresaId?: string }>;
        homologaciones?: HomologacionProductoResponse[];
      };
      if (!Array.isArray(parsed.sistemas)) {
        return createSeed();
      }
      const seed = createSeed();
      const sistemas = parsed.sistemas
        .filter((sistema) => sistema.empresaId === undefined || sistema.empresaId === 'entel')
        .map((sistema) => ({
          id: sistema.id.replace(/^entel-/, ''),
          codigo: sistema.codigo,
          descripcion: sistema.descripcion,
        }));
      const stored = Array.isArray(parsed.homologaciones) ? parsed.homologaciones : seed.homologaciones;
      const data: GammaData = {
        sistemas,
        homologaciones: stored.map((item) => ({
          ...item,
          sistemaId: item.sistemaId.replace(/^entel-/, ''),
        })),
      };
      if (parsed.empresas !== undefined || parsed.sistemas.some((sistema) => 'empresaId' in sistema)) {
        this.persist(data);
      }
      return data;
    } catch {
      return createSeed();
    }
  }

  private persist(data: GammaData): void {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Los datos siguen en memoria si el navegador bloquea el almacenamiento.
    }
  }
}

function cleanUpper(value: string): string {
  return value.trim().toUpperCase();
}

function cleanHomologacion(input: HomologacionProductoRequest): Omit<HomologacionProductoRequest, 'sistemaId'> & {
  sistemaId: string;
} | null {
  const payload = {
    sistemaId: input.sistemaId,
    fecha: input.fecha.trim(),
    hora: input.hora.trim(),
    codigoEntel: input.codigoEntel.trim(),
    productoEntel: input.productoEntel.trim(),
    actividadCodigo: input.actividadCodigo.trim(),
    actividadNombre: input.actividadNombre.trim(),
    codigoSin: input.codigoSin.trim(),
    productoSin: input.productoSin.trim(),
  };
  if (Object.values(payload).some((value) => !value)) {
    return null;
  }
  return payload;
}
