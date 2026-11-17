import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { firstValueFrom, timeout } from 'rxjs';
import { API_GAMMA_URL, TIEMPO_ESPERA_API } from '../../../core/constants';
import { createSeed } from './sistemas.mock';
import {
  HomologacionProductoRequest,
  HomologacionProductoResponse,
  SistemaFacturadorResponse,
  SistemaResponse,
} from './sistemas.model';

const STORAGE_KEY = 'gamma.homologaciones';

@Injectable({ providedIn: 'root' })
export class SistemasService {
  private readonly http = inject(HttpClient);

  private readonly lista = signal<SistemaResponse[]>([]);
  private readonly estadoCargando = signal(false);
  private readonly estadoError = signal<string | null>(null);
  private peticion: Promise<void> | null = null;

  readonly sistemas = this.lista.asReadonly();
  readonly cargando = this.estadoCargando.asReadonly();
  readonly error = this.estadoError.asReadonly();

  cargar(): Promise<void> {
    this.peticion ??= this.pedir();
    return this.peticion;
  }

  recargar(): Promise<void> {
    this.peticion = this.pedir();
    return this.peticion;
  }

  private async pedir(): Promise<void> {
    this.estadoCargando.set(true);
    this.estadoError.set(null);
    try {
      const datos = await firstValueFrom(
        this.http
          .get<SistemaFacturadorResponse[]>(`${API_GAMMA_URL}/sistemas/facturadores`)
          .pipe(timeout(TIEMPO_ESPERA_API)),
      );
      this.lista.set(datos.map(aSistema));
    } catch {
      this.lista.set([]);
      this.estadoError.set('No se pudieron cargar los sistemas facturadores.');
      this.peticion = null;
    } finally {
      this.estadoCargando.set(false);
    }
  }

  private readonly state = signal<HomologacionProductoResponse[]>(this.restore());

  readonly homologaciones = this.state.asReadonly();

  createHomologacion(input: HomologacionProductoRequest): string | null {
    const payload = cleanHomologacion(input);
    if (!payload) {
      return 'Completa todos los campos de la homologación.';
    }
    this.commit((data) => [...data, { ...payload, id: crypto.randomUUID() }]);
    return null;
  }

  updateHomologacion(id: string, input: HomologacionProductoRequest): string | null {
    const payload = cleanHomologacion(input);
    if (!payload) {
      return 'Completa todos los campos de la homologación.';
    }
    if (!this.state().some((item) => item.id === id)) {
      return 'La homologación que intentas actualizar no existe.';
    }
    this.commit((data) => data.map((item) => (item.id === id ? { ...item, ...payload } : item)));
    return null;
  }

  deleteHomologacion(id: string): void {
    this.commit((data) => data.filter((item) => item.id !== id));
  }

  private commit(recipe: (data: HomologacionProductoResponse[]) => HomologacionProductoResponse[]): void {
    this.state.update((data) => {
      const next = recipe(data);
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Los datos siguen en memoria si el navegador bloquea el almacenamiento.
      }
      return next;
    });
  }

  private restore(): HomologacionProductoResponse[] {
    try {
      const guardado = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? 'null');
      return Array.isArray(guardado) ? guardado : createSeed();
    } catch {
      return createSeed();
    }
  }
}

/** Para las rutas que necesitan la lista de sistemas antes de mostrarse. */
export const cargarSistemas: ResolveFn<boolean> = () =>
  inject(SistemasService)
    .cargar()
    .then(() => true);

function aSistema(sistema: SistemaFacturadorResponse): SistemaResponse {
  return {
    id: String(sistema.idSistema),
    idSistema: sistema.idSistema,
    codigo: sistema.sistema,
    descripcion: sistema.descripcion,
  };
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
