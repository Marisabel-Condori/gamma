import { Component, input, output } from '@angular/core';
import { GmBoton } from '../boton/boton';

/**
 * <gm-modal titulo="Crear sistema" (cerrar)="close()"> ...contenido... </gm-modal>
 */
@Component({
  selector: 'gm-modal',
  imports: [GmBoton],
  template: `
    <div class="velo" role="presentation"></div>
    <section class="dialogo" [style.width]="'min(100%, ' + ancho() + ')'" role="dialog" aria-modal="true" [attr.aria-label]="titulo()">
      <header>
        <div>
          <h2>{{ titulo() }}</h2>
          @if (etiqueta()) {
            <span class="etiqueta">{{ etiqueta() }}</span>
          }
        </div>
        <button gmBoton icono="cerrar" type="button" aria-label="Cerrar" (click)="cerrar.emit()"></button>
      </header>
      <ng-content />
    </section>
  `,
  styles: `
    :host {
      position: fixed;
      inset: 0;
      z-index: 40;
      display: grid;
      place-items: center;
      padding: 24px;
    }
    .velo {
      position: absolute;
      inset: 0;
      background: var(--velo);
    }
    .dialogo {
      position: relative;
      max-height: min(86vh, 820px);
      overflow: auto;
      padding: 24px 26px 22px;
      background: var(--superficie);
      border-radius: var(--radio-xl);
      box-shadow: var(--sombra);
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 8px;
    }
    h2 {
      font-size: var(--texto-2xl);
      font-weight: var(--peso-negrita);
    }
    .etiqueta {
      display: inline-block;
      margin-top: 6px;
      padding: 3px 12px;
      border-radius: var(--radio-pill);
      background: var(--apagado);
      color: var(--tinta-2);
      font-size: var(--texto-sm);
      font-weight: var(--peso-semi);
    }
  `,
})
export class GmModal {
  readonly titulo = input.required<string>();
  readonly etiqueta = input<string>();
  /** Ancho máximo del modal. */
  readonly ancho = input('520px');
  readonly cerrar = output<void>();
}
