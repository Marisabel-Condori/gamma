import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GmIcono } from '../icono/icono';
import { Pantalla } from '../pantalla';

export interface GmMiga {
  etiqueta: string;
  enlace?: string;
}

/**
 * Encabezado de pantalla: migas, título, etiqueta, buscador y acción.
 *
 *   <gm-encabezado titulo="Sistemas Facturadores" [etiqueta]="conteo()">
 *     <gm-buscar [(valor)]="query" />
 *     <button gmBoton="primario" ...></button>
 *   </gm-encabezado>
 *
 * etiquetaTipo 'conteo': pill junto al título; en móvil pasa a texto debajo.
 * etiquetaTipo 'chip':   se mantiene junto al título también en móvil.
 * volver / tituloMovil:  en móvil reemplazan a las migas.
 * subtitulo:             contexto bajo el título (escritorio y móvil).
 */
@Component({
  selector: 'gm-encabezado',
  imports: [RouterLink, GmIcono],
  host: { '[class.movil]': 'esMovil()' },
  template: `
    @if (migas().length && !esMovil()) {
      <nav class="migas" aria-label="Ubicación">
        @for (miga of migas(); track miga.etiqueta; let ultima = $last) {
          @if (miga.enlace && !ultima) {
            <a [routerLink]="miga.enlace">{{ miga.etiqueta }}</a>
            <span>/</span>
          } @else {
            <span>{{ miga.etiqueta }}</span>
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
        @if (etiqueta() && (etiquetaTipo() === 'chip' || !esMovil())) {
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
    @if (etiqueta() && etiquetaTipo() === 'conteo' && esMovil()) {
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
  readonly migas = input<GmMiga[]>([]);
  readonly volver = input<string>();
  readonly etiqueta = input<string>();
  readonly etiquetaTipo = input<'conteo' | 'chip'>('conteo');

  protected readonly esMovil = inject(Pantalla).esMovil;
}
