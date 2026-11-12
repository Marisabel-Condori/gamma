import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

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
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'inicio' },
      {
        path: 'inicio',
        loadComponent: () => import('./features/inicio/pages/inicio.page').then((m) => m.InicioPage),
      },
      {
        path: 'sistemas-facturadores',
        loadComponent: () =>
          import('./features/sistemasFacturadores/pages/sistemasFacturadores.page').then(
            (m) => m.SistemasFacturadoresPage,
          ),
      },
      {
        path: 'sistemas-facturadores/:sistemaId/productos',
        loadComponent: () =>
          import('./features/sistemasFacturadores/pages/productosHomologados.page').then(
            (m) => m.ProductosHomologadosPage,
          ),
      },
      { path: 'sistemasFacturadores', pathMatch: 'full', redirectTo: 'sistemas-facturadores' },
      { path: 'sistemasFacturadores/entel', pathMatch: 'full', redirectTo: 'sistemas-facturadores' },
      {
        path: 'sistemasFacturadores/:sistemaId/productos',
        redirectTo: ({ params }) => `/sistemas-facturadores/${params['sistemaId']}/productos`,
      },
      {
        path: 'sistemasFacturadores/:origen/:sistemaId/productos',
        redirectTo: ({ params }) => {
          const raw = params['sistemaId'] ?? '';
          const sistemaId = raw.replace(/^entel-/, '');
          return `/sistemas-facturadores/${sistemaId}/productos`;
        },
      },
      {
        path: 'servicios',
        loadComponent: () =>
          import('./features/servicios/pages/servicios.page').then((m) => m.ServiciosPage),
      },
    ],
  },
  { path: '**', redirectTo: 'inicio' },
];
