import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
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
  private readonly router = inject(Router);
  readonly perfilAbierto = signal(false);
  readonly menuAbierto = signal(false);

  readonly perfil = this.auth.perfil;
  readonly iniciales = this.auth.iniciales;

  abrirCerrarPerfil(): void {
    this.menuAbierto.set(false);
    this.perfilAbierto.update((abierto) => !abierto);
  }

  abrirCerrarMenu(): void {
    this.perfilAbierto.set(false);
    this.menuAbierto.update((abierto) => !abierto);
  }

  cerrar(): void {
    this.menuAbierto.set(false);
    this.perfilAbierto.set(false);
  }

  salir(): void {
    this.cerrar();
    this.auth.logout().subscribe(() => void this.router.navigateByUrl('/login'));
  }
}
