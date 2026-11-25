import { Component, input, model } from '@angular/core';

export interface GmOpcion<T = string> {
  valor: T;
  etiqueta: string;
  descripcion?: string;
  deshabilitada?: boolean;
}

let contador = 0;

/** <gm-opciones titulo="Tipo" [opciones]="tipos" [(seleccionado)]="tipo" />. Solo una a la vez. */
@Component({
  selector: 'gm-opciones',
  template: `
    <fieldset>
      @if (titulo(); as titulo) {
        <legend>{{ titulo }}</legend>
      }
      @for (opcion of opciones(); track opcion.valor) {
        <label
          [class.activa]="seleccionado() === opcion.valor"
          [class.deshabilitada]="opcion.deshabilitada"
        >
          <input
            type="radio"
            [name]="nombre()"
            [checked]="seleccionado() === opcion.valor"
            [disabled]="opcion.deshabilitada"
            (change)="seleccionado.set(opcion.valor)"
          />
          <span class="fila">
            <span class="caja" aria-hidden="true"></span>
            <span class="etiqueta">{{ opcion.etiqueta }}</span>
          </span>
          @if (opcion.descripcion) {
            <span class="descripcion">{{ opcion.descripcion }}</span>
          }
        </label>
      }
    </fieldset>
  `,
  styles: `
    fieldset {
      display: grid;
      grid-auto-flow: column;
      gap: 8px;
      margin: 0;
      padding: 0;
      border: 0;
      min-width: 0;
    }
    legend {
      margin-bottom: 8px;
      padding: 0;
      font-weight: 600;
      color: var(--tinta);
    }
    label {
      position: relative;
      display: grid;
      gap: 6px;
      padding: 12px 16px;
      background: var(--superficie);
      color: var(--tinta);
      border: 1px solid color-mix(in srgb, var(--tinta) 18%, transparent);
      border-radius: var(--radio-lg);
      cursor: pointer;
      transition:
        border-color 0.15s,
        box-shadow 0.15s;
    }
    label:hover,
    label:focus-visible {
      background: var(--marca-tenue);
      color: var(--marca);
      outline: none;
    }
    label:hover:not(.deshabilitada) {
      border-color: color-mix(in srgb, var(--tinta) 40%, transparent);
    }
    label.activa {
      border-color: var(--marca);
    }
    label.deshabilitada {
      opacity: 0.5;
      cursor: not-allowed;
    }
    label:has(input:focus-visible) {
      outline: 2px solid var(--tinta);
      outline-offset: 2px;
    }
    input {
      position: absolute;
      opacity: 0;
      pointer-events: none;
    }
    .caja {
      flex: none;
      display: inline-grid;
      place-items: center;
      width: 18px;
      height: 18px;
      margin-top: 1px;
      border: 2px solid color-mix(in srgb, var(--tinta) 45%, transparent);
      border-radius: 4px;
      transition:
        background 0.15s,
        border-color 0.15s;
    }
    .activa .caja {
      background: var(--marca);
      border-color: var(--marca);
    }
    .activa .caja::after {
      content: '';
      width: 5px;
      height: 9px;
      margin-top: -2px;
      border: solid var(--superficie);
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
    .fila {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .etiqueta {
      font-weight: 600;
      line-height: 1.3;
    }
    .caja {
      flex: none;
      display: inline-grid;
      place-items: center;
      width: 18px;
      height: 18px;
      border: 2px solid color-mix(in srgb, var(--tinta) 45%, transparent);
      border-radius: 4px;
      transition:
        background 0.15s,
        border-color 0.15s;
    }
    .descripcion {
      font-size: 0.875em;
      line-height: 1.4;
      color: color-mix(in srgb, var(--tinta) 65%, transparent);
    }
  `,
})
export class GmOpciones<T = string> {
  readonly opciones = input.required<readonly GmOpcion<T>[]>();
  readonly seleccionado = model<T | null>(null);
  readonly titulo = input<string>();
  readonly nombre = input(`gm-opciones-${++contador}`);
}
