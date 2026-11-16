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
} as const;

export type GmIconoNombre = keyof typeof ICONOS;

/** <gm-icono nombre="editar" />. El tamaño lo hereda del font-size del padre. */
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
