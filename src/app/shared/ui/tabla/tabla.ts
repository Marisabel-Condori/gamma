import { NgTemplateOutlet } from '@angular/common';
import { Component, TemplateRef, computed, contentChildren, inject, input, linkedSignal } from '@angular/core';
import { GmEstadoVacio } from '../estado-vacio/estado-vacio';
import { GmPaginador, rangoTexto } from '../paginador/paginador';
import { Pantalla } from '../pantalla';
import { GmCelda } from './celda';
import { GmColumna, GmLugarMovil } from './tabla.models';

interface Bloque {
  titulo: string;
  columnas: number;
  esGrupo: boolean;
  columna?: GmColumna;
}

const RANGO: Record<GmLugarMovil, number> = {
  titulo: 0,
  subtitulo: 1,
  detalle: 2,
  esquina: 3,
  pie: 4,
  'pie-fin': 5,
  oculto: 6,
};

/**
 * Tabla del sistema. En escritorio es una tabla; en móvil, una lista de tarjetas.
 *
 *   <gm-tabla [datos]="filas()" [columnas]="columnas" [porPagina]="10">
 *     <ng-template gmCelda="acciones" let-fila> ... </ng-template>
 *   </gm-tabla>
 */
@Component({
  selector: 'gm-tabla',
  imports: [NgTemplateOutlet, GmEstadoVacio, GmPaginador],
  templateUrl: './tabla.html',
  styleUrl: './tabla.scss',
})
export class GmTabla<T extends object> {
  readonly datos = input.required<readonly T[]>();
  readonly columnas = input.required<readonly GmColumna<T>[]>();
  /** Propiedad única de cada fila. */
  readonly clave = input('id');
  /** 'oscura' para listas simples; 'clara' con líneas entre grupos, para homologaciones. */
  readonly cabecera = input<'oscura' | 'clara'>('oscura');
  /** Ancho a partir del cual aparece el scroll horizontal en escritorio. */
  readonly anchoMinimo = input('0');
  /** 0 = sin paginación. */
  readonly porPagina = input(0);
  readonly vacio = input('No hay resultados.');

  protected readonly esMovil = inject(Pantalla).esMovil;
  private readonly celdas = contentChildren(GmCelda);

  protected readonly plantillas = computed(() => {
    const mapa = new Map<string, TemplateRef<unknown>>();
    for (const celda of this.celdas()) mapa.set(celda.columna(), celda.plantilla);
    return mapa;
  });

  // ── Paginación ──
  protected readonly tamano = linkedSignal(() => this.porPagina());
  protected readonly pagina = linkedSignal({ source: this.datos, computation: () => 1 });

  protected readonly visibles = computed(() => {
    const tamano = this.tamano();
    if (!tamano) return this.datos();
    const desde = (this.pagina() - 1) * tamano;
    return this.datos().slice(desde, desde + tamano);
  });

  protected readonly rango = computed(() => rangoTexto(this.pagina(), this.tamano(), this.datos().length));

  // ── Escritorio: cabecera con grupos ──
  protected readonly cabeceras = computed(() => {
    const columnas = this.columnas();
    const arriba: Bloque[] = [];
    for (const columna of columnas) {
      const anterior = arriba.at(-1);
      if (columna.grupo && anterior?.esGrupo && anterior.titulo === columna.grupo) {
        anterior.columnas++;
      } else if (columna.grupo) {
        arriba.push({ titulo: columna.grupo, columnas: 1, esGrupo: true });
      } else {
        arriba.push({ titulo: columna.titulo, columnas: 1, esGrupo: false, columna });
      }
    }
    return { hayGrupos: columnas.some((c) => c.grupo), arriba, abajo: columnas.filter((c) => c.grupo) };
  });

  /** Columnas tras las que va una línea vertical (fin de grupo). */
  protected readonly cortes = computed(() => {
    const columnas = this.columnas();
    const ids = new Set<string>();
    columnas.forEach((columna, i) => {
      const siguiente = columnas[i + 1];
      if (siguiente && (!columna.grupo || columna.grupo !== siguiente.grupo)) ids.add(columna.id);
    });
    return ids;
  });

  // ── Móvil: tarjeta ──
  protected readonly tarjeta = computed(() => {
    const columnas = this.columnas()
      .map((columna, i) => ({ columna, lugar: columna.movil ?? 'detalle', orden: columna.ordenMovil ?? i }))
      .filter((c) => c.lugar !== 'oculto');
    const de = (lugar: GmLugarMovil) => columnas.filter((c) => c.lugar === lugar).map((c) => c.columna);

    // Cuerpo de la tarjeta: una sección por grupo; dentro, título → subtítulo → detalles.
    const secciones: { grupo?: string; columnas: typeof columnas }[] = [];
    for (const c of columnas.filter((c) => RANGO[c.lugar] <= RANGO.detalle)) {
      let seccion = secciones.find((s) => s.grupo === c.columna.grupo);
      if (!seccion) secciones.push((seccion = { grupo: c.columna.grupo, columnas: [] }));
      seccion.columnas.push(c);
    }
    for (const s of secciones) {
      s.columnas.sort((a, b) => RANGO[a.lugar] - RANGO[b.lugar] || a.orden - b.orden);
    }
    return { secciones, esquina: de('esquina'), pie: de('pie'), pieFin: de('pie-fin') };
  });

  protected claveDe(fila: T): unknown {
    return (fila as Record<string, unknown>)[this.clave()];
  }

  protected texto(columna: GmColumna<T>, fila: T, movil = false): string | number {
    if (movil && columna.valorMovil) return columna.valorMovil(fila);
    if (columna.valor) return columna.valor(fila);
    const valor = (fila as Record<string, unknown>)[columna.id];
    return valor == null ? '' : String(valor);
  }
}
