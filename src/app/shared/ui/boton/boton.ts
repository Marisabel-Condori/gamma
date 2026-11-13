import { Component, booleanAttribute, computed, input } from '@angular/core';
import { GmIcono, GmIconoNombre } from '../icono/icono';

export type GmBotonVariante = 'primario' | 'neutro' | 'suave' | 'peligro';

/**
 * Botón del sistema.
 *   <button gmBoton="primario" icono="agregar" etiqueta="Crear sistema" compacto></button>
 *   <button gmBoton icono="editar" aria-label="Editar"></button>        ← solo icono
 * `compacto`: en móvil oculta la etiqueta y queda como botón cuadrado.
 */
@Component({
  selector: 'button[gmBoton], a[gmBoton]',
  imports: [GmIcono],
  host: {
    '[class]': 'clases()',
  },
  template: `
    @if (icono(); as nombre) {
      <gm-icono [nombre]="nombre" />
    }
    @if (etiqueta()) {
      <span class="etiqueta">{{ etiqueta() }}</span>
    }
    <ng-content />
  `,
  styleUrl: './boton.scss',
})
export class GmBoton {
  readonly variante = input<GmBotonVariante | ''>('suave', { alias: 'gmBoton' });
  readonly icono = input<GmIconoNombre>();
  readonly etiqueta = input<string>();
  readonly compacto = input(false, { transform: booleanAttribute });

  protected readonly clases = computed(() => {
    const lista: string[] = [this.variante() || 'suave'];
    if (this.icono() && !this.etiqueta()) lista.push('solo-icono');
    if (this.compacto()) lista.push('compacto');
    return lista.join(' ');
  });
}
