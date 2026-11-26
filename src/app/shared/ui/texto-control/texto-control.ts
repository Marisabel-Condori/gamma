import { Component, input } from '@angular/core';
import { ESTILOS_CONTROL, GmControl } from '../control/control';
import { GmTexto } from '../texto/texto';

/**  gm-texto para formularios reactivos:
 *   <gm-texto-control etiqueta="Cantidad" tipo="number" formControlName="cantidad" />
 */
@Component({
  selector: 'gm-texto-control',
  imports: [GmTexto],
  host: {
    '[class.invalido]': 'error() !== null',
    '(focusout)': 'tocar()',
  },
  template: `
    <gm-texto
      [etiqueta]="etiqueta()"
      [placeholder]="placeholder()"
      [tipo]="tipo()"
      [maxlength]="maxlength()"
      [valor]="valor() ?? ''"
      (valorChange)="cambiar($event)"
    />
    @if (error(); as mensaje) {
      <span class="error" role="alert" [attr.title]="mensaje">{{ mensaje }}</span>
    }
  `,
  styles: `
    ${ESTILOS_CONTROL}
    :host(.invalido) ::ng-deep input {
      border-color: var(--peligro);
    }
  `,
})
export class GmTextoControl extends GmControl<string> {
  readonly etiqueta = input.required<string>();
  readonly placeholder = input('');
  readonly tipo = input<'text' | 'number' | 'email' | 'date' | 'time'>('text');
  readonly maxlength = input<number>();

  protected readonly vacio = '';
}
