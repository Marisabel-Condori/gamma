import { Component, computed, input } from '@angular/core';

const ICONOS = {
  agregar: 'add',
  editar: 'edit',
  eliminar: 'delete',
  mas: 'more_vert',
  buscar: 'search',
  cerrar: 'close',
  volver: 'arrow_back',
  atras: 'chevron_left',
  anterior: 'chevron_left',
  siguiente: 'chevron_right',
  vacio: 'search_off',
  menu: 'menu',
  inicio: 'home',
  sistemas: 'account_balance',
  servicios: 'apps',
  tienda: 'store',
  sincronizar: 'sync',
  desplegar: 'expand_more',
  admin: 'admin_panel_settings',
  vistas: 'bar_chart',
  conciliar: 'compare_arrows',
  conciliarSiat: 'fact_check',
  factura: 'receipt_long',
  imprimir: 'print',
  xml: 'code',
  siat: 'qr_code_2',
  ver: 'visibility',
  bitacora: 'history',
  calendario: 'calendar_month',
  limpiar: 'filter_alt_off',
  libro: 'menu_book',
  subir: 'upload_file',
  impuestos: 'request_quote',
  publicidad: 'campaign',
  alquiler: 'real_estate_agent',
  telecomunicaciones: 'cell_tower',
  comprayventa: 'shopping_cart',
  emitir: 'send',
} as const;

export type GmIconoNombre = keyof typeof ICONOS;

/** <gm-icono nombre="editar" />. El tamaño del padre. */
@Component({
  selector: 'gm-icono',
  template: `<span class="material-icons-outlined" aria-hidden="true">{{ icono() }}</span>`,
  styles: `
    :host {
      display: inline-grid;
      place-items: center;
      line-height: 1;
    }
    .material-icons-outlined {
      font-size: inherit;
    }
  `,
})
export class GmIcono {
  readonly nombre = input.required<GmIconoNombre>();
  readonly icono = computed(() => ICONOS[this.nombre()]);
}
