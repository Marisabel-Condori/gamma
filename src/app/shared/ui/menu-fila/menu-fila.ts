import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import { ConnectedPosition } from '@angular/cdk/overlay';
import { Component, input, output } from '@angular/core';
import { GmIcono } from '../icono/icono';

export interface GmOpcion {
  id: string;
  etiqueta: string;
}

const POSICIONES: ConnectedPosition[] = [
  { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 6 },
  { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -6 },
];

/**
 * Botón ⋮ con un menú de opciones.
 * En escritorio se ve solo el icono; en móvil, la etiqueta a la izquierda y el icono a la derecha.
 */
@Component({
  selector: 'gm-menu-fila',
  imports: [CdkMenu, CdkMenuItem, CdkMenuTrigger, GmIcono],
  template: `
    <button
      type="button"
      class="disparador"
      [attr.aria-label]="etiqueta()"
      [cdkMenuTriggerFor]="menu"
      [cdkMenuPosition]="posiciones"
    >
      <span class="etiqueta">{{ etiqueta() }}</span>
      <gm-icono nombre="mas" />
    </button>

    <ng-template #menu>
      <div class="menu" cdkMenu>
        @for (opcion of opciones(); track opcion.id) {
          <button type="button" class="item" cdkMenuItem (cdkMenuItemTriggered)="elegir.emit(opcion.id)">
            {{ opcion.etiqueta }}
          </button>
        }
      </div>
    </ng-template>
  `,
  styleUrl: './menu-fila.scss',
})
export class GmMenuFila {
  readonly etiqueta = input.required<string>();
  readonly opciones = input.required<readonly GmOpcion[]>();
  readonly elegir = output<string>();
  protected readonly posiciones = POSICIONES;
}
