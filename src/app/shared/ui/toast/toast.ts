import { Component, Injectable, inject, signal } from '@angular/core';

/** Mensajes breves: this.toast.mostrar('Sistema creado.') */
@Injectable({ providedIn: 'root' })
export class Toast {
  readonly actual = signal<string | null>(null);
  private temporizador = 0;

  mostrar(mensaje: string): void {
    this.actual.set(mensaje);
    window.clearTimeout(this.temporizador);
    this.temporizador = window.setTimeout(() => this.actual.set(null), 3200);
  }
}

/** Se coloca una sola vez, en el layout principal. */
@Component({
  selector: 'gm-toast',
  template: `
    @if (toast.actual(); as mensaje) {
      <div role="status">{{ mensaje }}</div>
    }
  `,
  styles: `
    div {
      position: fixed;
      left: 50%;
      bottom: 24px;
      z-index: 50;
      transform: translateX(-50%);
      max-width: min(520px, calc(100% - 32px));
      padding: 12px 16px;
      background: var(--tinta);
      color: var(--superficie);
      border-radius: var(--radio-lg);
      box-shadow: var(--sombra);
    }
  `,
})
export class GmToast {
  protected readonly toast = inject(Toast);
}
