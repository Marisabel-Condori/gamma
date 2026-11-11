import { Injectable, computed, signal } from '@angular/core';
import { SistemaInput } from '../models/gamma.models';
import { GammaData, createSeed } from './seed';

const STORAGE_KEY = 'gamma.demo.v2';

@Injectable({ providedIn: 'root' })
export class GammaState {
  private readonly state = signal<GammaData>(this.restore());

  readonly empresas = computed(() => this.state().empresas);
  readonly sistemas = computed(() => this.state().sistemas);

  createSistema(input: SistemaInput): string | null {
    const codigo = cleanUpper(input.codigo);
    const descripcion = input.descripcion.trim();
    if (!codigo || !descripcion) {
      return 'Completa código y descripción.';
    }

    if (
      this.state().sistemas.some(
        (sistema) => sistema.empresaId === input.empresaId && sistema.codigo === codigo,
      )
    ) {
      return 'Ya existe un sistema con ese código.';
    }

    this.commit((current) => ({
      ...current,
      sistemas: [
        ...current.sistemas,
        {
          id: `${input.empresaId}-${codigo}`,
          empresaId: input.empresaId,
          codigo,
          descripcion,
        },
      ],
    }));
    return null;
  }

  updateSistema(id: string, input: Pick<SistemaInput, 'codigo' | 'descripcion'>): string | null {
    const codigo = cleanUpper(input.codigo);
    const descripcion = input.descripcion.trim();
    if (!codigo || !descripcion) {
      return 'Completa código y descripción.';
    }

    const empresaId = this.state().sistemas.find((sistema) => sistema.id === id)?.empresaId;
    if (
      this.state().sistemas.some(
        (sistema) =>
          sistema.id !== id && sistema.empresaId === empresaId && sistema.codigo === codigo,
      )
    ) {
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
      const parsed = JSON.parse(raw) as Partial<GammaData>;
      if (!Array.isArray(parsed.empresas) || !Array.isArray(parsed.sistemas)) {
        return createSeed();
      }
      return { empresas: parsed.empresas, sistemas: parsed.sistemas };
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
