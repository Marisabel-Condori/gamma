import { Component, input, model } from '@angular/core';
import { GmIcono } from '../icono/icono';

/** <gm-buscar placeholder="Buscar sistema..." [(valor)]="query" /> */
@Component({
  selector: 'gm-buscar',
  imports: [GmIcono],
  template: `
    <label>
      <gm-icono nombre="buscar" />
      <input
        type="search"
        [value]="valor()"
        [placeholder]="placeholder()"
        [attr.aria-label]="placeholder()"
        (input)="valor.set($any($event.target).value)"
      />
    </label>
  `,
  styleUrl: './buscar.scss',
})
export class GmBuscar {
  readonly valor = model('');
  readonly placeholder = input('Buscar...');
}
