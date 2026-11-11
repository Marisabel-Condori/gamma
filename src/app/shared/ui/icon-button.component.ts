import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-icon-button',
  template: `
    <button
      type="button"
      class="icon-btn"
      [class.danger]="tone() === 'danger'"
      [attr.aria-label]="label()"
      (click)="pressed.emit()"
    >
      <span class="material-icons" aria-hidden="true">{{ icon() }}</span>
    </button>
  `,
  styles: ':host { display: contents; }',
})
export class IconButtonComponent {
  readonly icon = input.required<string>();
  readonly label = input.required<string>();
  readonly tone = input<'neutral' | 'danger'>('neutral');
  readonly pressed = output<void>();
}
