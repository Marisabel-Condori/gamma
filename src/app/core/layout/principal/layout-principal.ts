import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import { ConnectedPosition } from '@angular/cdk/overlay';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRouteSnapshot, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { GmConfirmar, GmIcono, GmToast, Pantalla } from '../../../shared/ui';
import { AuthService } from '../../auth/auth.service';

const POSICIONES_MENU: ConnectedPosition[] = [
  { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: -6 },
];

/** Barra superior, menú, contenido y pie. Aloja una sola vez el toast y las confirmaciones. */
@Component({
  selector: 'gm-layout-principal',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CdkMenu, CdkMenuItem, CdkMenuTrigger, GmIcono, GmToast, GmConfirmar],
  templateUrl: './layout-principal.html',
  styleUrl: './layout-principal.scss',
})
export class LayoutPrincipal {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly perfilAbierto = signal(false);
  readonly menuAbierto = signal(false);

  readonly esMovil = inject(Pantalla).esMovil;
  readonly posicionesMenu = POSICIONES_MENU;
  private readonly navegacion = toSignal(this.router.events.pipe(filter((evento) => evento instanceof NavigationEnd)));

  readonly enAdmin = computed(() => (this.navegacion(), this.router.url.startsWith('/admin')));
  /** Pantallas con muchos datos piden más ancho con `data: { paginaAncha: true }` en su ruta. */
  readonly paginaAncha = computed(() => (this.navegacion(), rutaFinal(this.router.routerState.snapshot.root).data['paginaAncha'] === true));

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

function rutaFinal(ruta: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
  return ruta.firstChild ? rutaFinal(ruta.firstChild) : ruta;
}
