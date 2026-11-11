import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-search-field',
  template: `
    <label class="search">
      <span class="material-icons" aria-hidden="true">search</span>
      <input
        type="search"
        [value]="value()"
        [placeholder]="placeholder()"
        [attr.aria-label]="placeholder()"
        (input)="onInput($event)"
      />
    </label>
  `,
  styles: ':host { display: contents; }',
})
export class SearchFieldComponent {
  readonly value = input('');
  readonly placeholder = input('Buscar...');
  readonly valueChange = output<string>();

  onInput(event: Event): void {
    this.valueChange.emit((event.target as HTMLInputElement).value);
  }
}
