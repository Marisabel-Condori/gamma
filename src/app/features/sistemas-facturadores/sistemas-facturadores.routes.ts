import { Routes } from '@angular/router';
import { cargarSistemas } from './data/sistemas.service';
import { DOCUMENTO_IDENTIFICACION } from './homologaciones/documento-identificacion/documento-identificacion.config';
import { METODOS_PAGO } from './homologaciones/metodos-pago/metodos-pago.config';
import { MONEDAS } from './homologaciones/monedas/monedas.config';
import { MOTIVOS_ANULACION } from './homologaciones/motivos-anulacion/motivos-anulacion.config';
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
    resolve: { sistemasCargados: cargarSistemas },
    loadComponent: () =>
      import('./homologaciones/productos/productos-homologados.page').then((m) => m.ProductosHomologadosPage),
  },
  {
    path: ':sistemaId/sucursales',
    resolve: { sistemasCargados: cargarSistemas },
    loadComponent: () =>
      import('./homologaciones/sucursales/sucursales-homologadas.page').then((m) => m.SucursalesHomologadasPage),
  },
  {
    path: ':sistemaId/sucursales/:sucursalId/puntos-venta',
    resolve: { sistemasCargados: cargarSistemas },
    loadComponent: () =>
      import('./homologaciones/sucursales/puntos-venta/puntos-venta.page').then((m) => m.PuntosVentaPage),
  },
  {
    path: ':sistemaId/unidades-medida',
    resolve: { sistemasCargados: cargarSistemas },
    loadComponent: homologacionCatalogo,
    data: { config: UNIDADES_MEDIDA },
  },
  {
    path: ':sistemaId/monedas',
    resolve: { sistemasCargados: cargarSistemas },
    loadComponent: homologacionCatalogo,
    data: { config: MONEDAS },
  },
  {
    path: ':sistemaId/metodos-pago',
    resolve: { sistemasCargados: cargarSistemas },
    loadComponent: homologacionCatalogo,
    data: { config: METODOS_PAGO },
  },
  {
    path: ':sistemaId/documento-identificacion',
    resolve: { sistemasCargados: cargarSistemas },
    loadComponent: homologacionCatalogo,
    data: { config: DOCUMENTO_IDENTIFICACION },
  },
  {
    path: ':sistemaId/motivos-anulacion',
    resolve: { sistemasCargados: cargarSistemas },
    loadComponent: homologacionCatalogo,
    data: { config: MOTIVOS_ANULACION },
  },
];
