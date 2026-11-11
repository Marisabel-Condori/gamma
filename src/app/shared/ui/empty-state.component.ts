import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  template: `
    <div class="empty">
      <span class="material-icons" aria-hidden="true">search_off</span>
      <p>{{ message() }}</p>
    </div>
  `,
  styles: ':host { display: block; }',
})
export class EmptyStateComponent {
  readonly message = input('No hay resultados.');
}
