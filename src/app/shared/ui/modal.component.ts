import { Component, HostListener, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  template: `
    <div class="backdrop" (click)="closed.emit()" role="presentation">
      <div
        class="dialog"
        [class.plain]="plain()"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="title()"
        (click)="$event.stopPropagation()"
      >
        @if (!plain()) {
          <div class="dialog-head">
            <h2>{{ title() }}</h2>
            <button type="button" class="icon-btn" aria-label="Cerrar" (click)="closed.emit()">
              <span class="material-icons">close</span>
            </button>
          </div>
        }
        <ng-content />
      </div>
    </div>
  `,
  styles: ':host { display: contents; }',
})
export class ModalComponent {
  readonly title = input.required<string>();
  readonly plain = input(false);
  readonly closed = output<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closed.emit();
  }
}
