import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { authGuard } from './core/state/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./features/login/pages/login.component').then((m) => m.LoginComponent),
      },
    ],
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: '',
    component: MainLayoutComponent,
    canActivateChild: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'inicio' },
      {
        path: 'inicio',
        loadComponent: () => import('./features/inicio/pages/inicio.page').then((m) => m.InicioPage),
      },
      { path: 'sistemasFacturadores', pathMatch: 'full', redirectTo: 'sistemasFacturadores/entel' },
      {
        path: 'sistemasFacturadores/:empresaId/:sistemaId/productos',
        loadComponent: () =>
          import('./features/sistemasFacturadores/pages/productosHomologados.page').then(
            (m) => m.ProductosHomologadosPage,
          ),
      },
      {
        path: 'sistemasFacturadores/:empresaId',
        loadComponent: () =>
          import('./features/sistemasFacturadores/pages/sistemasFacturadores.page').then(
            (m) => m.SistemasFacturadoresPage,
          ),
      },
      {
        path: 'sistemasFacturadores/:empresaId/:sistemaId/sucursales',
        loadComponent: () =>
          import('./features/homologacion-sucursales/pages/homologacion-sucursales.page').then(
            (m) => m.HomologacionSucursalesPage,
          ),
      },
      {
        path: 'servicios',
        loadComponent: () =>
          import('./features/servicios/pages/servicios.page').then((m) => m.ServiciosPage),
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
