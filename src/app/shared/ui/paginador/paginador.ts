import { Component, computed, input, model } from '@angular/core';
import { GmIcono } from '../icono/icono';

type Ficha = number | '…';

/** <gm-paginador [total]="94" [(pagina)]="pagina" [(tamano)]="tamano" /> */
@Component({
  selector: 'gm-paginador',
  imports: [GmIcono],
  template: `
    <span class="rango">{{ rango() }}</span>
    <div class="paginas">
      <button type="button" aria-label="Anterior" [disabled]="pagina() === 1" (click)="pagina.set(pagina() - 1)">
        <gm-icono nombre="anterior" />
      </button>
      @for (ficha of fichas(); track $index) {
        @if (ficha === '…') {
          <span class="salto">…</span>
        } @else {
          <button type="button" [class.actual]="ficha === pagina()" (click)="pagina.set(ficha)">{{ ficha }}</button>
        }
      }
      <button type="button" aria-label="Siguiente" [disabled]="pagina() === paginas()" (click)="pagina.set(pagina() + 1)">
        <gm-icono nombre="siguiente" />
      </button>
    </div>
    <label class="tamano">
      Por página:
      <select [value]="tamano()" (change)="cambiarTamano($any($event.target).value)">
        @for (opcion of opciones(); track opcion) {
          <option [value]="opcion">{{ opcion }}</option>
        }
      </select>
    </label>
  `,
  styleUrl: './paginador.scss',
})
export class GmPaginador {
  readonly total = input.required<number>();
  readonly pagina = model(1);
  readonly tamano = model(10);
  readonly opciones = input([10, 20, 50]);

  readonly paginas = computed(() => Math.max(1, Math.ceil(this.total() / this.tamano())));
  readonly rango = computed(() => rangoTexto(this.pagina(), this.tamano(), this.total()));

  readonly fichas = computed<Ficha[]>(() => {
    const total = this.paginas();
    const actual = this.pagina();
    if (total <= 6) return Array.from({ length: total }, (_, i) => i + 1);
    if (actual <= 3) return [1, 2, 3, '…', total];
    if (actual >= total - 2) return [1, '…', total - 2, total - 1, total];
    return [1, '…', actual - 1, actual, actual + 1, '…', total];
  });

  cambiarTamano(valor: string): void {
    this.tamano.set(Number(valor));
    this.pagina.set(1);
  }
}

export function rangoTexto(pagina: number, tamano: number, total: number): string {
  if (total === 0) return 'Mostrando 0 de 0 registros';
  const desde = (pagina - 1) * tamano + 1;
  const hasta = Math.min(total, pagina * tamano);
  return `Mostrando ${desde}–${hasta} de ${total} registros`;
}
