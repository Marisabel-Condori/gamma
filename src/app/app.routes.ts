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
      { path: 'empresas1', pathMatch: 'full', redirectTo: 'empresas1/entel' },
      {
        path: 'empresas1/:empresaId',
        loadComponent: () =>
          import('./features/empresas1/pages/empresas1.page').then((m) => m.Empresas1Page),
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
