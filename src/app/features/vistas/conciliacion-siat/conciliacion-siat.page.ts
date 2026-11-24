import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { GmBoton, GmEncabezado, GmRutaNavegacion, GmSeccion, Pantalla, GmFecha } from '../../../shared/ui';
import { cantidad, monto, redondear } from '../formato';
import { ConciliacionSiatFila, ConciliacionSiatResponse } from './data/conciliacion-siat.model';
import { CONCILIACION_SIAT } from './data/conciliacion-siat.ejemplo';

type Totales = Omit<ConciliacionSiatFila, 'sistema'>;

function sumar(filas: ConciliacionSiatFila[], dias: number[]): Totales {
  const total = (valor: (fila: ConciliacionSiatFila) => number) => redondear(filas.reduce((suma, fila) => suma + valor(fila), 0));
  return {
    cantidad: total((f) => f.cantidad),
    monto: total((f) => f.monto),
    descuento: total((f) => f.descuento),
    dias: Object.fromEntries(dias.map((dia) => [dia, total((f) => f.dias[dia] ?? 0)])),
  };
}

function restar(siat: Totales, total: Totales, dias: number[]): Totales {
  return {
    cantidad: siat.cantidad - total.cantidad,
    monto: redondear(siat.monto - total.monto),
    descuento: redondear(siat.descuento - total.descuento),
    dias: Object.fromEntries(dias.map((dia) => [dia, redondear((siat.dias[dia] ?? 0) - (total.dias[dia] ?? 0))])),
  };
}

@Component({
  selector: 'gm-conciliacion-siat-page',
  imports: [GmEncabezado, GmSeccion, GmFecha, GmBoton],
  templateUrl: './conciliacion-siat.page.html',
  styleUrl: './conciliacion-siat.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'gm-pagina' },
})
export class ConciliacionSiatPage {
  readonly esMovil = inject(Pantalla).esMovil;
  readonly rutanavegacion: GmRutaNavegacion[] = [{ etiqueta: 'Vistas' }, { etiqueta: 'Conciliación SIAT' }];

  readonly periodo = signal('202610');
  readonly resultado = signal<{ periodo: string; datos: ConciliacionSiatResponse } | null>(null);

  readonly dias = computed(() => {
    const periodo = this.resultado()?.periodo ?? '';
    const cantidadDias = new Date(Number(periodo.slice(0, 4)), Number(periodo.slice(4, 6)), 0).getDate() || 31;
    return Array.from({ length: cantidadDias }, (_, i) => i + 1);
  });

  readonly total = computed(() => sumar(this.resultado()?.datos.sistemas ?? [], this.dias()));
  readonly diferencia = computed(() => {
    const siat = this.resultado()?.datos.siat;
    return siat ? restar(siat, this.total(), this.dias()) : null;
  });

  readonly cantidad = cantidad;
  readonly monto = monto;

  consultar(event: Event): void {
    event.preventDefault();
    this.resultado.set({ periodo: this.periodo(), datos: CONCILIACION_SIAT });
  }
}
