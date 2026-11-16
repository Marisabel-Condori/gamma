import { Injectable, signal } from '@angular/core';
import { HomologacionUnidadMedida, HomologacionUnidadMedidaRequest } from './unidades-medida.model';

const CLAVE = 'gamma.unidades-medida.v1';

const EJEMPLO: HomologacionUnidadMedida[] = [
  {
    id: 'ZSMART-um-1',
    sistemaId: 'ZSMART',
    fecha: '01/05/2022',
    hora: '05:43:28',
    codigoEntel: '58',
    unidadEntel: 'SERVICIOS',
    codigoSin: '58',
    unidadSin: 'UNIDAD (SERVICIOS)',
  },
  {
    id: 'ZSMART-um-2',
    sistemaId: 'ZSMART',
    fecha: '01/05/2022',
    hora: '05:43:50',
    codigoEntel: '57',
    unidadEntel: 'BIENES',
    codigoSin: '57',
    unidadSin: 'UNIDAD (BIENES)',
  },
];

@Injectable({ providedIn: 'root' })
export class UnidadesMedidaService {
  readonly homologaciones = signal<HomologacionUnidadMedida[]>(restaurar());

  crear(datos: HomologacionUnidadMedidaRequest): string | null {
    const limpio = limpiar(datos);
    const error = this.validar(limpio);
    if (error) return error;
    this.guardar((lista) => [...lista, { ...limpio, id: `${limpio.sistemaId}-um-${Date.now()}` }]);
    return null;
  }

  actualizar(id: string, datos: HomologacionUnidadMedidaRequest): string | null {
    const limpio = limpiar(datos);
    const error = this.validar(limpio, id);
    if (error) return error;
    this.guardar((lista) => lista.map((h) => (h.id === id ? { ...h, ...limpio } : h)));
    return null;
  }

  eliminar(id: string): void {
    this.guardar((lista) => lista.filter((h) => h.id !== id));
  }

  private validar(datos: HomologacionUnidadMedidaRequest, id?: string): string | null {
    if (!datos.codigoEntel || !datos.unidadEntel || !datos.codigoSin || !datos.unidadSin) {
      return 'Completa todos los campos de la homologación.';
    }
    const repetida = this.homologaciones().some(
      (h) => h.id !== id && h.sistemaId === datos.sistemaId && h.codigoEntel === datos.codigoEntel,
    );
    return repetida ? 'Ya existe una homologación con ese código ENTEL en este sistema.' : null;
  }

  private guardar(receta: (lista: HomologacionUnidadMedida[]) => HomologacionUnidadMedida[]): void {
    this.homologaciones.update((lista) => {
      const siguiente = receta(lista);
      try {
        sessionStorage.setItem(CLAVE, JSON.stringify(siguiente));
      } catch {
      }
      return siguiente;
    });
  }
}

function limpiar(datos: HomologacionUnidadMedidaRequest): HomologacionUnidadMedidaRequest {
  return { ...datos, codigoEntel: datos.codigoEntel.trim(), unidadEntel: datos.unidadEntel.trim() };
}

function restaurar(): HomologacionUnidadMedida[] {
  try {
    const guardado = JSON.parse(sessionStorage.getItem(CLAVE) ?? 'null') as unknown;
    if (Array.isArray(guardado)) return guardado as HomologacionUnidadMedida[];
  } catch {
  }
  return EJEMPLO;
}
