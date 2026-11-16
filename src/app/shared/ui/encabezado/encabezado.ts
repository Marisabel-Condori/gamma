import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GmIcono } from '../icono/icono';
import { Pantalla } from '../pantalla';

export interface GmRutaNavegacion {
  etiqueta: string;
  enlace?: string;
}

/**   <gm-encabezado titulo="Sistemas Facturadores" [etiqueta]="conteo()">
 *     <gm-buscar [(valor)]="query" />
 *     <button gmBoton="primario" ...></button>
 *   </gm-encabezado>
 */
@Component({
  selector: 'gm-encabezado',
  imports: [RouterLink, GmIcono],
  host: { '[class.movil]': 'esMovil()' },
  template: `
    @if (rutanavegacion().length && !esMovil()) {
      <nav class="rutanavegacion" aria-label="Ubicación">
        @for (rutanavegacion of rutanavegacion(); track rutanavegacion.etiqueta; let ultima = $last) {
          @if (rutanavegacion.enlace && !ultima) {
            <a [routerLink]="rutanavegacion.enlace">{{ rutanavegacion.etiqueta }}</a>
            <span>/</span>
          } @else {
            <span>{{ rutanavegacion.etiqueta }}</span>
          }
        }
      </nav>
    }
    <div class="fila">
      <div class="cabeza">
        @if (volver() && esMovil()) {
          <a class="volver" aria-label="Volver" [routerLink]="volver()"><gm-icono nombre="atras" /></a>
        }
        <h1>{{ esMovil() ? (tituloMovil() ?? titulo()) : titulo() }}</h1>
        @if (mostrarEtiqueta() && (etiquetaTipo() === 'chip' || !esMovil())) {
          <span class="etiqueta" [class.chip]="etiquetaTipo() === 'chip'">{{ etiqueta() }}</span>
        }
      </div>
      <div class="herramientas">
        <ng-content select="gm-buscar" />
        <ng-content />
      </div>
    </div>
    @if (subtitulo()) {
      <p class="subtitulo">{{ subtitulo() }}</p>
    }
    @if (mostrarEtiqueta() && etiquetaTipo() === 'conteo' && esMovil()) {
      <p class="conteo">{{ etiqueta() }}</p>
    }
  `,
  styleUrl: './encabezado.scss',
})
export class GmEncabezado {
  readonly titulo = input.required<string>();
  readonly tituloMovil = input<string>();
  /** Texto de contexto bajo el título, ej. la sucursal que se está viendo. */
  readonly subtitulo = input<string>();
  readonly rutanavegacion = input<GmRutaNavegacion[]>([]);
  readonly volver = input<string>();
  readonly etiqueta = input<string>();
  readonly etiquetaTipo = input<'conteo' | 'chip'>('conteo');
  /** En qué vista se muestra la etiqueta. */
  readonly etiquetaEn = input<'ambas' | 'movil' | 'escritorio'>('ambas');

  protected readonly esMovil = inject(Pantalla).esMovil;

  protected readonly mostrarEtiqueta = computed(() => {
    const donde = this.etiquetaEn();
    const vistaOk = donde === 'ambas' || (donde === 'movil') === this.esMovil();
    return !!this.etiqueta() && vistaOk;
  });
}
