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
          import('./features/sistemas-facturadores/sistemas-facturadores.routes').then(
            (m) => m.SISTEMAS_ROUTES,
          ),
      },
      {
        path: 'vistas/conciliacion-siat',
        data: { paginaAncha: true },
        loadComponent: () =>
          import('./features/vistas/conciliacion-siat/conciliacion-siat.page').then(
            (m) => m.ConciliacionSiatPage,
          ),
      },
      {
        path: 'vistas/conciliar-prepago',
        data: { paginaAncha: true },
        loadComponent: () =>
          import('./features/vistas/conciliar-prepago/conciliar-prepago.page').then(
            (m) => m.ConciliarPrepagoPage,
          ),
      },
      {
        path: 'vistas/conciliar-postpago',
        data: { paginaAncha: true },
        loadComponent: () =>
          import('./features/vistas/conciliar-postpago/conciliar-postpago.page').then(
            (m) => m.ConciliarPostpagoPage,
          ),
      },
      {
        path: 'admin/buscar-factura',
        data: { paginaAncha: true },
        loadComponent: () =>
          import('./features/admin/buscar-factura/buscar-factura.page').then(
            (m) => m.BuscarFacturaPage,
          ),
      },
      {
        path: 'admin/libro-iva',
        loadComponent: () =>
          import('./features/admin/libro-iva/libro-iva.page').then((m) => m.LibroIvaPage),
      },
      {
        path: 'puntos-de-venta',
        loadComponent: () =>
          import('./features/sistemas-facturadores/puntos-venta/puntos-venta-sistemas.page').then(
            (m) => m.PuntosVentaSistemasPage,
          ),
      },
      {
        path: 'puntos-de-venta/:codigoSucursal',
        loadComponent: () =>
          import('./features/sistemas-facturadores/puntos-venta/puntos-venta-sistemas.page').then(
            (m) => m.PuntosVentaSistemasPage,
          ),
      },
      {
        path: 'facturacion/impuestos',
        loadComponent: () =>
          import('./features/facturacion/impuestos/impuestos.page').then((m) => m.ImpuestosPage),
      },
      {
        path: 'facturacion/publicidad',
        loadComponent: () =>
          import('./features/facturacion/publicidad/publicidad.page').then((m) => m.PublicidadPage),
      },
      {
        path: 'facturacion/alquiler',
        loadComponent: () =>
          import('./features/facturacion/alquiler/alquiler.page').then((m) => m.AlquilerPage),
      },
      {
        path: 'facturacion/telecomunicaciones',
        loadComponent: () =>
          import('./features/facturacion/telecomunicaciones/telecomunicaciones.page').then(
            (m) => m.TelecomunicacionesPage,
          ),
      },
      {
        path: 'facturacion/compra-venta',
        loadComponent: () =>
          import('./features/facturacion/compra-venta/compra-venta.page').then(
            (m) => m.CompraVentaPage,
          ),
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
