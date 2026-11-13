import { Component, input, output } from '@angular/core';
import { GmBoton } from '../boton/boton';

/**
 * <gm-modal titulo="Crear sistema" (cerrar)="close()"> ...contenido... </gm-modal>
 * Se muestra mientras exista en la plantilla (envuélvelo en un @if).
 */
@Component({
  selector: 'gm-modal',
  imports: [GmBoton],
  template: `
    <div class="velo" role="presentation" (click)="cerrar.emit()"></div>
    <section class="dialogo" [style.width]="'min(100%, ' + ancho() + ')'" role="dialog" aria-modal="true" [attr.aria-label]="titulo()">
      <header>
        <h2>{{ titulo() }}</h2>
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
      padding: 20px 22px 18px;
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
      font-size: var(--texto-xl);
      font-weight: var(--peso-negrita);
    }
  `,
})
export class GmModal {
  readonly titulo = input.required<string>();
  /** Ancho máximo del modal. */
  readonly ancho = input('520px');
  readonly cerrar = output<void>();
}
