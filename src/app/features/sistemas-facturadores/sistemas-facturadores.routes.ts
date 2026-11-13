import { Routes } from '@angular/router';

export const SISTEMAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./lista/sistemas-lista.page').then((m) => m.SistemasListaPage),
  },
  {
    path: ':sistemaId/productos',
    loadComponent: () =>
      import('./homologaciones/productos/productos-homologados.page').then((m) => m.ProductosHomologadosPage),
  },
  // Aquí se irán sumando: ':sistemaId/sucursales', ':sistemaId/unidades-medida', ...
];
