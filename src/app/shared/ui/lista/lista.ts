import { Component, booleanAttribute, input, model } from '@angular/core';
import { GmIcono } from '../icono/icono';

export interface GmOpcionLista {
  valor: string;
  etiqueta: string;
}

/**
 * Lista desplegable con su etiqueta.
 *   <gm-lista etiqueta="Actividad" placeholder="Selecciona una actividad"
 *             [opciones]="actividades" [(valor)]="actividad" />
 * `deshabilitado`: gris y sin poder elegir (ej. mientras falta elegir otra lista).
 */
@Component({
  selector: 'gm-lista',
  imports: [GmIcono],
  template: `
    <label class="gm-campo">
      {{ etiqueta() }}
      <span class="control">
        <select [disabled]="deshabilitado()" [class.vacia]="!valor()" (change)="valor.set($any($event.target).value)">
          <option value="" disabled [selected]="!valor()">{{ placeholder() }}</option>
          @for (opcion of opciones(); track opcion.valor) {
            <option [value]="opcion.valor" [selected]="opcion.valor === valor()">{{ opcion.etiqueta }}</option>
          }
        </select>
        <gm-icono nombre="desplegar" />
      </span>
    </label>
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }
    .control {
      position: relative;
      display: block;
    }
    select {
      width: 100%;
      padding-right: 40px;
      appearance: none;
      cursor: pointer;
    }
    select.vacia,
    select:disabled {
      color: var(--tinta-3);
    }
    select:disabled {
      background: var(--apagado);
      cursor: default;
    }
    gm-icono {
      position: absolute;
      top: 50%;
      right: 12px;
      transform: translateY(-50%);
      color: var(--tinta-3);
      font-size: var(--icono-lg);
      pointer-events: none;
    }
  `,
})
export class GmLista {
  readonly etiqueta = input.required<string>();
  readonly opciones = input.required<readonly GmOpcionLista[]>();
  readonly valor = model('');
  readonly placeholder = input('Selecciona una opción');
  readonly deshabilitado = input(false, { transform: booleanAttribute });
}
