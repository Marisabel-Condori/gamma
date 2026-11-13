import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { GmConfirmar, GmIcono, GmToast } from '../../../shared/ui';
import { AuthService } from '../../auth/auth.service';

/** Barra superior, menú, contenido y pie. Aloja una sola vez el toast y las confirmaciones. */
@Component({
  selector: 'gm-layout-principal',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, GmIcono, GmToast, GmConfirmar],
  templateUrl: './layout-principal.html',
  styleUrl: './layout-principal.scss',
})
export class LayoutPrincipal {
  private readonly auth = inject(AuthService);
  readonly perfilAbierto = signal(false);
  readonly menuAbierto = signal(false);

  alternarPerfil(): void {
    this.menuAbierto.set(false);
    this.perfilAbierto.update((abierto) => !abierto);
  }

  alternarMenu(): void {
    this.perfilAbierto.set(false);
    this.menuAbierto.update((abierto) => !abierto);
  }

  cerrar(): void {
    this.menuAbierto.set(false);
    this.perfilAbierto.set(false);
  }

  salir(): void {
    this.auth.logout();
    this.cerrar();
  }
}
