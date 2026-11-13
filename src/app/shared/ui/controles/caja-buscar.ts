import { Component, input, output } from '@angular/core';
import { GammaIcon } from '../gamma-icon';

@Component({
  selector: 'caja_buscar',
  imports: [GammaIcon],
  template: `
    <label class="caja_buscar">
      <app-icon name="search" />
      <input
        type="search"
        [value]="value()"
        [placeholder]="placeholder()"
        [attr.aria-label]="placeholder()"
        (input)="onInput($event)"
      />
    </label>
  `,
  styleUrl: './caja-buscar.scss',
})
export class CajaBuscar {
  readonly value = input('');
  readonly placeholder = input('Buscar...');
  readonly valueChange = output<string>();

  onInput(event: Event): void {
    this.valueChange.emit((event.target as HTMLInputElement).value);
  }
}
