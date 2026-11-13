import { Component, input, output } from '@angular/core';
import { GmBoton } from '../boton/boton';

/** Botones editar y eliminar de una fila: <gm-acciones-fila que="sistema" (editar)="..." (eliminar)="..." /> */
@Component({
  selector: 'gm-acciones-fila',
  imports: [GmBoton],
  template: `
    <button gmBoton icono="editar" type="button" [attr.aria-label]="'Editar ' + que()" (click)="editar.emit()"></button>
    <button gmBoton="peligro" icono="eliminar" type="button" [attr.aria-label]="'Eliminar ' + que()" (click)="eliminar.emit()"></button>
  `,
  styles: `
    :host {
      display: inline-flex;
      gap: 10px;
    }
  `,
})
export class GmAccionesFila {
  readonly que = input('registro');
  readonly editar = output<void>();
  readonly eliminar = output<void>();
}
