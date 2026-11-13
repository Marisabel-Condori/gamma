import { Component, computed, inject, input } from '@angular/core';
import { Pantalla } from '../pantalla';

/**
 * Bloque de un formulario con título (ej. ENTEL / SIN) y sus campos en grilla.
 *   <gm-seccion titulo="ENTEL" columnas="1fr 2fr">
 *     <gm-texto ... />  <gm-texto ... />
 *   </gm-seccion>
 * `columnas`: igual que grid-template-columns. En móvil siempre es una columna.
 * Sin `titulo` sirve solo para ordenar campos en columnas.
 */
@Component({
  selector: 'gm-seccion',
  template: `
    @if (titulo()) {
      <h3>{{ titulo() }}</h3>
    }
    <div class="campos" [style.grid-template-columns]="grilla()">
      <ng-content />
    </div>
  `,
  styles: `
    :host {
      display: block;
      margin-top: 16px;
    }
    h3 {
      margin-bottom: 12px;
      padding: 7px 12px;
      border-radius: var(--radio-sm);
      background: var(--tabla-clara);
      font-size: var(--texto-md);
      font-weight: var(--peso-negrita);
    }
    .campos {
      display: grid;
      gap: 14px 16px;
    }
  `,
})
export class GmSeccion {
  readonly titulo = input<string>();
  readonly columnas = input('1fr');

  private readonly esMovil = inject(Pantalla).esMovil;
  protected readonly grilla = computed(() => (this.esMovil() ? '1fr' : this.columnas()));
}
