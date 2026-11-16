import { Routes } from '@angular/router';
import { DOCUMENTO_IDENTIFICACION } from './homologaciones/documento-identificacion/documento-identificacion.config';
import { MONEDAS } from './homologaciones/monedas/monedas.config';
import { UNIDADES_MEDIDA } from './homologaciones/unidades-medida/unidades-medida.config';

const homologacionCatalogo = () =>
  import('./homologaciones/comun/homologacion-catalogo.page').then((m) => m.HomologacionCatalogoPage);

export const SISTEMAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./sistemas-lista.page').then((m) => m.SistemasListaPage),
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
  {
    path: ':sistemaId/unidades-medida',
    loadComponent: homologacionCatalogo,
    data: { config: UNIDADES_MEDIDA },
  },
  {
    path: ':sistemaId/monedas',
    loadComponent: homologacionCatalogo,
    data: { config: MONEDAS },
  },
  {
    path: ':sistemaId/documento-identificacion',
    loadComponent: homologacionCatalogo,
    data: { config: DOCUMENTO_IDENTIFICACION },
  },
];
