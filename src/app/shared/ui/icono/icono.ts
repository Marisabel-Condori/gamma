import { Component, computed, input } from '@angular/core';

const GLIFOS = {
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
} as const;

export type GmIconoNombre = keyof typeof GLIFOS;

/** <gm-icono nombre="editar" />. El tamaño lo hereda del font-size del padre. */
@Component({
  selector: 'gm-icono',
  template: `<span class="material-icons" aria-hidden="true">{{ glifo() }}</span>`,
  styles: `
    :host {
      display: inline-grid;
      place-items: center;
      line-height: 1;
    }
    .material-icons {
      font-size: inherit;
    }
  `,
})
export class GmIcono {
  readonly nombre = input.required<GmIconoNombre>();
  readonly glifo = computed(() => GLIFOS[this.nombre()]);
}
