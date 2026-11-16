import { Injectable, Signal, WritableSignal, signal } from '@angular/core';
import { ConfigHomologacion, HomologacionCatalogo, HomologacionCatalogoRequest } from './homologacion-catalogo.model';

@Injectable({ providedIn: 'root' })
export class HomologacionCatalogoService {
  private readonly listas = new Map<string, WritableSignal<HomologacionCatalogo[]>>();

  lista(config: ConfigHomologacion): Signal<HomologacionCatalogo[]> {
    return this.senal(config).asReadonly();
  }

  crear(config: ConfigHomologacion, datos: HomologacionCatalogoRequest): string | null {
    const limpio = limpiar(datos);
    const error = this.validar(config, limpio);
    if (error) return error;
    this.guardar(config, (lista) => [...lista, { ...limpio, id: `${limpio.sistemaId}-${config.tipo}-${Date.now()}` }]);
    return null;
  }

  actualizar(config: ConfigHomologacion, id: string, datos: HomologacionCatalogoRequest): string | null {
    const limpio = limpiar(datos);
    const error = this.validar(config, limpio, id);
    if (error) return error;
    this.guardar(config, (lista) => lista.map((h) => (h.id === id ? { ...h, ...limpio } : h)));
    return null;
  }

  eliminar(config: ConfigHomologacion, id: string): void {
    this.guardar(config, (lista) => lista.filter((h) => h.id !== id));
  }

  private validar(config: ConfigHomologacion, datos: HomologacionCatalogoRequest, id?: string): string | null {
    if (!datos.codigoEntel || !datos.descripcionEntel || !datos.codigoSin || !datos.descripcionSin) {
      return 'Completa todos los campos de la homologación.';
    }
    const repetida = this.senal(config)().some(
      (h) => h.id !== id && h.sistemaId === datos.sistemaId && h.codigoEntel === datos.codigoEntel,
    );
    return repetida ? 'Ya existe una homologación con ese código ENTEL en este sistema.' : null;
  }

  private senal(config: ConfigHomologacion): WritableSignal<HomologacionCatalogo[]> {
    let lista = this.listas.get(config.tipo);
    if (!lista) {
      lista = signal(restaurar(config));
      this.listas.set(config.tipo, lista);
    }
    return lista;
  }

  private guardar(config: ConfigHomologacion, receta: (lista: HomologacionCatalogo[]) => HomologacionCatalogo[]): void {
    this.senal(config).update((lista) => {
      const siguiente = receta(lista);
      try {
        sessionStorage.setItem(clave(config), JSON.stringify(siguiente));
      } catch {
        // Si el navegador bloquea el almacenamiento, los datos siguen en memoria.
      }
      return siguiente;
    });
  }
}

function clave(config: ConfigHomologacion): string {
  return `gamma.homologacion.${config.tipo}.v1`;
}

function limpiar(datos: HomologacionCatalogoRequest): HomologacionCatalogoRequest {
  return { ...datos, codigoEntel: datos.codigoEntel.trim(), descripcionEntel: datos.descripcionEntel.trim() };
}

function restaurar(config: ConfigHomologacion): HomologacionCatalogo[] {
  try {
    const guardado = JSON.parse(sessionStorage.getItem(clave(config)) ?? 'null') as unknown;
    if (Array.isArray(guardado)) return guardado as HomologacionCatalogo[];
  } catch {
    // Datos dañados: se usan los de ejemplo.
  }
  return config.ejemplo;
}
