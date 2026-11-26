import { Component, input } from '@angular/core';
import { ESTILOS_CONTROL, GmControl } from '../control/control';
import { GmOpcion, GmOpciones } from '../opciones/opciones';

/**  gm-opciones para formularios reactivos:
 *   <gm-opciones-control titulo="Tipo" [opciones]="tipos" formControlName="tipo" />
 */
@Component({
  selector: 'gm-opciones-control',
  imports: [GmOpciones],
  template: `
    <gm-opciones
      [titulo]="titulo()"
      [opciones]="opciones()"
      [seleccionado]="valor()"
      (seleccionadoChange)="elegir($event)"
    />
    @if (error(); as mensaje) {
      <span class="error" role="alert" [attr.title]="mensaje">{{ mensaje }}</span>
    }
  `,
  styles: ESTILOS_CONTROL,
})
export class GmOpcionesControl extends GmControl<string | null> {
  readonly opciones = input.required<readonly GmOpcion<string>[]>();
  readonly titulo = input<string>();

  protected readonly vacio = null;

  protected elegir(valor: string | null): void {
    this.cambiar(valor);
    this.tocar();
  }
}
