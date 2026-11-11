import { Component, Injectable, inject, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly current = signal<string | null>(null);
  private timer = 0;

  show(message: string): void {
    this.current.set(message);
    window.clearTimeout(this.timer);
    this.timer = window.setTimeout(() => this.current.set(null), 3200);
  }
}

@Component({
  selector: 'app-toast-host',
  template: `
    @if (toast.current(); as message) {
      <div class="toast" role="status">{{ message }}</div>
    }
  `,
  styles: ':host { display: contents; }',
})
export class ToastHostComponent {
  readonly toast = inject(ToastService);
}
