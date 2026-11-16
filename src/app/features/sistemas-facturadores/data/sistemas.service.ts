import { Injectable, computed, signal } from '@angular/core';
import {
  HomologacionProductoRequest,
  HomologacionProductoResponse,
  SistemaRequest,
  SistemaResponse,
} from './sistemas.models';
import { GammaData, createSeed } from './sistemas.mock';

const STORAGE_KEY = 'gamma.demo.v2';

@Injectable({ providedIn: 'root' })
export class SistemasService {
  private readonly state = signal<GammaData>(this.restore());

  readonly sistemas = computed(() => this.state().sistemas);
  readonly homologaciones = computed(() => this.state().homologaciones);

  createSistema(input: SistemaRequest): string | null {
    const codigo = cleanUpper(input.codigo);
    const descripcion = input.descripcion.trim();

    if (!codigo || !descripcion) {
      return 'Completa código y descripción.';
    }

    const current = this.state();

    if (current.sistemas.some((sistema) => sistema.codigo === codigo)) {
      return 'Ya existe un sistema con ese código.';
    }

    const sistema: SistemaResponse = {
      id: crypto.randomUUID(),
      codigo,
      descripcion,
    };

    this.commit((data) => ({
      ...data,
      sistemas: [...data.sistemas, sistema],
    }));

    return null;
  }

  updateSistema(id: string, input: SistemaRequest): string | null {
    const codigo = cleanUpper(input.codigo);
    const descripcion = input.descripcion.trim();

    if (!codigo || !descripcion) {
      return 'Completa código y descripción.';
    }

    const current = this.state();

    if (!current.sistemas.some((sistema) => sistema.id === id)) {
      return 'El sistema que intentas actualizar no existe.';
    }

    if (current.sistemas.some((sistema) => sistema.id !== id && sistema.codigo === codigo)) {
      return 'Ya existe un sistema con ese código.';
    }

    this.commit((data) => ({
      ...data,
      sistemas: data.sistemas.map((sistema) =>
        sistema.id === id ? { ...sistema, codigo, descripcion } : sistema,
      ),
    }));

    return null;
  }

  deleteSistema(id: string): void {
    this.commit((data) => ({
      ...data,
      sistemas: data.sistemas.filter((sistema) => sistema.id !== id),
      homologaciones: data.homologaciones.filter((item) => item.sistemaId !== id),
    }));
  }

  createHomologacion(input: HomologacionProductoRequest): string | null {
    const payload = cleanHomologacion(input);
    if (!payload) {
      return 'Completa todos los campos de la homologación.';
    }

    const current = this.state();

    if (!current.sistemas.some((sistema) => sistema.id === payload.sistemaId)) {
      return 'El sistema de la homologación no existe.';
    }

    const homologacion: HomologacionProductoResponse = {
      ...payload,
      id: crypto.randomUUID(),
    };

    this.commit((data) => ({
      ...data,
      homologaciones: [...data.homologaciones, homologacion],
    }));

    return null;
  }

  updateHomologacion(id: string, input: HomologacionProductoRequest): string | null {
    const payload = cleanHomologacion(input);
    if (!payload) {
      return 'Completa todos los campos de la homologación.';
    }

    const current = this.state();

    if (!current.homologaciones.some((item) => item.id === id)) {
      return 'La homologación que intentas actualizar no existe.';
    }

    if (!current.sistemas.some((sistema) => sistema.id === payload.sistemaId)) {
      return 'El sistema de la homologación no existe.';
    }

    this.commit((data) => ({
      ...data,
      homologaciones: data.homologaciones.map((item) => (item.id === id ? { ...item, ...payload } : item)),
    }));

    return null;
  }

  deleteHomologacion(id: string): void {
    this.commit((data) => ({
      ...data,
      homologaciones: data.homologaciones.filter((item) => item.id !== id),
    }));
  }

  private commit(recipe: (data: GammaData) => GammaData): void {
    this.state.update((data) => {
      const next = recipe(data);
      this.persist(next);
      return next;
    });
  }

  private restore(): GammaData {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw?.trim()) {
        return createSeed();
      }
      const parsed = JSON.parse(raw) as unknown;
      if (!isRecord(parsed) || !Array.isArray(parsed['sistemas'])) {
        return createSeed();
      }

      const sistemas = normalizeSistemas(parsed['sistemas']);
      if (parsed['sistemas'].length > 0 && sistemas.length === 0) {
        return createSeed();
      }

      const homologaciones = normalizeHomologaciones(parsed['homologaciones'], sistemas);
      const data: GammaData = { sistemas, homologaciones };
      if (storedDataChanged(parsed, data)) {
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

function cleanHomologacion(input: HomologacionProductoRequest): HomologacionProductoRequest | null {
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeSistemas(value: unknown[]): SistemaResponse[] {
  return value.flatMap((item) => {
    if (!isRecord(item)) {
      return [];
    }
    const empresaId = item['empresaId'];
    if (typeof empresaId === 'string' && empresaId !== 'entel') {
      return [];
    }
    const codigo = text(item['codigo']);
    const descripcion = text(item['descripcion']);
    const id = text(item['id']).replace(/^entel-/, '') || codigo;
    if (!id || !codigo || !descripcion) {
      return [];
    }
    return [{ id, codigo, descripcion }];
  });
}

function normalizeHomologaciones(
  value: unknown,
  sistemas: SistemaResponse[],
): HomologacionProductoResponse[] {
  const sistemaIds = new Set(sistemas.map((sistema) => sistema.id));
  const source = Array.isArray(value) ? value : createSeed().homologaciones;
  return source.flatMap((item) => {
    if (!isRecord(item)) {
      return [];
    }
    const id = text(item['id']);
    const sistemaId = text(item['sistemaId']).replace(/^entel-/, '');
    const fecha = text(item['fecha']);
    const hora = text(item['hora']);
    const codigoEntel = text(item['codigoEntel']);
    const productoEntel = text(item['productoEntel']);
    const actividadCodigo = text(item['actividadCodigo']);
    const actividadNombre = text(item['actividadNombre']);
    const codigoSin = text(item['codigoSin']);
    const productoSin = text(item['productoSin']);
    if (
      !id ||
      !sistemaId ||
      !sistemaIds.has(sistemaId) ||
      !fecha ||
      !hora ||
      !codigoEntel ||
      !productoEntel ||
      !actividadCodigo ||
      !actividadNombre ||
      !codigoSin ||
      !productoSin
    ) {
      return [];
    }
    return [
      {
        id,
        sistemaId,
        fecha,
        hora,
        codigoEntel,
        productoEntel,
        actividadCodigo,
        actividadNombre,
        codigoSin,
        productoSin,
      },
    ];
  });
}

function storedDataChanged(parsed: Record<string, unknown>, data: GammaData): boolean {
  if (parsed['empresas'] !== undefined || !Array.isArray(parsed['homologaciones'])) {
    return true;
  }
  if (parsed['sistemas'] instanceof Array && parsed['sistemas'].length !== data.sistemas.length) {
    return true;
  }
  if (parsed['homologaciones'].length !== data.homologaciones.length) {
    return true;
  }
  const sistemas = parsed['sistemas'] as unknown[];
  const legacySistema = sistemas.some(
    (item) => isRecord(item) && ('empresaId' in item || text(item['id']).startsWith('entel-')),
  );
  const homologaciones = parsed['homologaciones'] as unknown[];
  const legacyHomologacion = homologaciones.some(
    (item) => isRecord(item) && text(item['sistemaId']).startsWith('entel-'),
  );
  return legacySistema || legacyHomologacion;
}
