import { Component, booleanAttribute, input } from '@angular/core';
import { ESTILOS_CONTROL, GmControl } from '../control/control';
import { GmLista, GmOpcionLista } from '../lista/lista';

/**  gm-lista para formularios reactivos:
 *   <gm-lista-control etiqueta="Moneda" [opciones]="monedas()" formControlName="codigoMoneda" buscable />
 */
@Component({
  selector: 'gm-lista-control',
  imports: [GmLista],
  host: {
    '[class.invalido]': 'error() !== null',
  },
  template: `
    <gm-lista
      [etiqueta]="conAsterisco(etiqueta())"
      [opciones]="opciones()"
      [placeholder]="placeholder()"
      [buscable]="buscable()"
      [deshabilitado]="deshabilitado() || deshabilitadoPorFormulario()"
      [valor]="valor() ?? ''"
      (valorChange)="elegir($event)"
    />
    @if (error(); as mensaje) {
      <span class="error" role="alert" [attr.title]="mensaje">{{ mensaje }}</span>
    }
  `,
  styles: `
    ${ESTILOS_CONTROL}
    :host(.invalido) ::ng-deep .control {
      border-color: var(--peligro);
    }
  `,
})
export class GmListaControl extends GmControl<string> {
  readonly etiqueta = input.required<string>();
  readonly opciones = input.required<readonly GmOpcionLista[]>();
  readonly placeholder = input('Selecciona una opción');
  readonly deshabilitado = input(false, { transform: booleanAttribute });
  readonly buscable = input(false, { transform: booleanAttribute });

  protected readonly vacio = '';

  /** La lista se marca como tocada al elegir (abrir el menú no cuenta). */
  protected elegir(valor: string): void {
    this.cambiar(valor);
    this.tocar();
  }
}
