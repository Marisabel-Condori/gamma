import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  template: `
    <div class="empty">
      <span class="material-icons" aria-hidden="true">search_off</span>
      <p>{{ message() }}</p>
    </div>
  `,
  styleUrl: './empty-state.component.scss',
})
export class EmptyStateComponent {
  readonly message = input('No hay resultados.');
}
