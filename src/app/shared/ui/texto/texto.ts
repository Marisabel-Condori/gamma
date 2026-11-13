import { Component, input, model } from '@angular/core';

/**
 * Campo de texto con su etiqueta.
 *   <gm-texto etiqueta="Código" placeholder="Ingresa el código" [(valor)]="codigo" />
 */
@Component({
  selector: 'gm-texto',
  template: `
    <label class="gm-campo">
      {{ etiqueta() }}
      <input
        [type]="tipo()"
        [value]="valor()"
        [placeholder]="placeholder()"
        [attr.maxlength]="maxlength() ?? null"
        (input)="valor.set($any($event.target).value)"
      />
    </label>
  `,
  styles: ':host { display: block; min-width: 0; }',
})
export class GmTexto {
  readonly etiqueta = input.required<string>();
  readonly valor = model('');
  readonly placeholder = input('');
  readonly tipo = input<'text' | 'number' | 'email' | 'date' | 'time'>('text');
  readonly maxlength = input<number>();
}
