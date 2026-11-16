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
        path: 'servicios',
        loadComponent: () => import('./features/servicios/servicios.page').then((m) => m.ServiciosPage),
      },

      // Direcciones antiguas que siguen funcionando.
      { path: 'sistemasFacturadores', pathMatch: 'full', redirectTo: 'sistemas-facturadores' },
      { path: 'sistemasFacturadores/entel', pathMatch: 'full', redirectTo: 'sistemas-facturadores' },
      {
        path: 'sistemasFacturadores/:sistemaId/productos',
        redirectTo: ({ params }) => `/sistemas-facturadores/${params['sistemaId']}/productos`,
      },
      {
        path: 'sistemasFacturadores/:origen/:sistemaId/productos',
        redirectTo: ({ params }) => {
          const sistemaId = (params['sistemaId'] ?? '').replace(/^entel-/, '');
          return `/sistemas-facturadores/${sistemaId}/productos`;
        },
      },
    ],
  },
  { path: '**', redirectTo: 'inicio' },
];
