import { Component, Injectable, inject, signal } from '@angular/core';
import { GmBoton } from '../boton/boton';
import { GmModal } from '../modal/modal';

export interface GmPregunta {
  titulo: string;
  mensaje: string;
  aceptar?: string;
  peligro?: boolean;
}

interface Pendiente extends GmPregunta {
  responder: (si: boolean) => void;
}

/**
 * Confirmaciones sin escribir un modal en cada pantalla:
 *   if (await this.confirmar.preguntar({ titulo: 'Eliminar sistema', mensaje: '...', peligro: true })) { ... }
 */
@Injectable({ providedIn: 'root' })
export class Confirmar {
  readonly pendiente = signal<Pendiente | null>(null);

  preguntar(pregunta: GmPregunta): Promise<boolean> {
    this.pendiente()?.responder(false);
    return new Promise((resolve) => {
      this.pendiente.set({
        ...pregunta,
        responder: (si) => {
          this.pendiente.set(null);
          resolve(si);
        },
      });
    });
  }
}

/** Se coloca una sola vez, en el layout principal. */
@Component({
  selector: 'gm-confirmar',
  imports: [GmModal, GmBoton],
  template: `
    @if (confirmar.pendiente(); as p) {
      <gm-modal [titulo]="p.titulo" (cerrar)="p.responder(false)">
        <p class="mensaje">{{ p.mensaje }}</p>
        <div class="gm-acciones">
          <button gmBoton="neutro" type="button" etiqueta="Cancelar" (click)="p.responder(false)"></button>
          <button
            type="button"
            [gmBoton]="p.peligro ? 'peligro' : 'primario'"
            [etiqueta]="p.aceptar ?? 'Aceptar'"
            (click)="p.responder(true)"
          ></button>
        </div>
      </gm-modal>
    }
  `,
  styles: `
    .mensaje {
      color: var(--tinta-3);
    }
  `,
})
export class GmConfirmar {
  protected readonly confirmar = inject(Confirmar);
}
