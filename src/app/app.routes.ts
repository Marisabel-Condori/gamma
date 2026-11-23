import { Routes } from '@angular/router';
import { LayoutAcceso } from './core/layout/acceso/layout-acceso';
import { LayoutPrincipal } from './core/layout/principal/layout-principal';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LayoutAcceso,
    children: [
      {
        path: '',
        loadComponent: () => import('./features/acceso/login/login.page').then((m) => m.LoginPage),
      },
    ],
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: '',
    component: LayoutPrincipal,
    canActivateChild: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'inicio' },
      {
        path: 'inicio',
        loadComponent: () => import('./features/inicio/inicio.page').then((m) => m.InicioPage),
      },
      {
        path: 'sistemas-facturadores',
        loadChildren: () =>
          import('./features/sistemas-facturadores/sistemas-facturadores.routes').then((m) => m.SISTEMAS_ROUTES),
      },
      {
        path: 'vistas/conciliar-prepago',
        data: { paginaAncha: true },
        loadComponent: () =>
          import('./features/vistas/conciliar-prepago/conciliar-prepago.page').then((m) => m.ConciliarPrepagoPage),
      },
      {
        path: 'admin/buscar-factura',
        data: { paginaAncha: true },
        loadComponent: () =>
          import('./features/admin/buscar-factura/buscar-factura.page').then((m) => m.BuscarFacturaPage),
      },
      {
        path: 'puntos-de-venta',
        loadComponent: () =>
          import('./features/sistemas-facturadores/puntos-venta/puntos-venta-sistemas.page').then((m) => m.PuntosVentaSistemasPage),
      },
      {
        path: 'puntos-de-venta/:codigoSucursal',
        loadComponent: () =>
          import('./features/sistemas-facturadores/puntos-venta/puntos-venta-sistemas.page').then((m) => m.PuntosVentaSistemasPage),
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
