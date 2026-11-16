import { Component, input } from '@angular/core';
import { GmIcono } from '../icono/icono';

@Component({
  selector: 'gm-estado-vacio',
  imports: [GmIcono],
  template: `
    <gm-icono nombre="vacio" />
    <p>{{ mensaje() }}</p>
  `,
  styles: `
    :host {
      display: block;
      padding: 36px 16px;
      background: var(--superficie);
      border: 1px dashed var(--linea-fuerte);
      border-radius: var(--radio-xl);
      text-align: center;
      color: var(--tinta-3);
    }
    gm-icono {
      font-size: var(--texto-4xl);
    }
    p {
      margin-top: 8px;
    }
  `,
})
export class GmEstadoVacio {
  readonly mensaje = input('No hay resultados.');
}
