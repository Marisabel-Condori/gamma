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
  {
    path: ':sistemaId/sucursales',
    loadComponent: () =>
      import('./homologaciones/sucursales/sucursales-homologadas.page').then((m) => m.SucursalesHomologadasPage),
  },
  {
    path: ':sistemaId/sucursales/:sucursalId/puntos-venta',
    loadComponent: () =>
      import('./homologaciones/sucursales/puntos-venta/puntos-venta.page').then((m) => m.PuntosVentaPage),
  },
  // Aquí se irán sumando: ':sistemaId/unidades-medida', ':sistemaId/monedas', ...
];
