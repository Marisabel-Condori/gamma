import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  template: `
    <div class="backdrop" role="presentation">
      <div
        class="dialog"
        [class.plain]="plain()"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="title()"
      >
        @if (!plain()) {
          <div class="dialog-head">
            <h2>{{ title() }}</h2>
            <button type="button" class="icon-btn" aria-label="Cerrar" (click)="closed.emit()">
              <span class="material-icons">close</span>
            </button>
          </div>
        } @else {
          <button type="button" class="icon-btn modal-close" aria-label="Cerrar" (click)="closed.emit()">
            <span class="material-icons">close</span>
          </button>
        }
        <ng-content />
      </div>
    </div>
  `,
  styleUrl: './modal.component.scss',
})
export class ModalComponent {
  readonly title = input.required<string>();
  readonly plain = input(false);
  readonly closed = output<void>();
}
