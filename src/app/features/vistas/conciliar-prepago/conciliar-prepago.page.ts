import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { GmBoton, GmEncabezado, GmRutaNavegacion, GmSeccion, GmTexto, Toast } from '../../../shared/ui';
import { ConciliacionDia, ConciliacionOrigen } from './data/conciliacion.model';
import { CONCILIACION_PREPAGO } from './data/conciliar-prepago.ejemplo';

const ORIGENES = ['BANCA', 'SICO', 'RECINT'];

const CANTIDAD = new Intl.NumberFormat('en-US');
const MONTO = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

@Component({
  selector: 'gm-conciliar-prepago-page',
  imports: [GmEncabezado, GmSeccion, GmTexto, GmBoton],
  templateUrl: './conciliar-prepago.page.html',
  styleUrl: './conciliar-prepago.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'gm-pagina' },
})
export class ConciliarPrepagoPage {
  private readonly toast = inject(Toast);

  readonly origenes = ORIGENES;
  readonly rutanavegacion: GmRutaNavegacion[] = [{ etiqueta: 'Vistas' }, { etiqueta: 'Conciliar prepago' }];

  readonly periodo = signal('202610');
  readonly dias = signal<ConciliacionDia[]>([]);

  consultar(event: Event): void {
    event.preventDefault();
    this.dias.set(CONCILIACION_PREPAGO);
  }

  detalleDiferencias(): void {
    this.toast.mostrar('Pendiente detalle de diferencias.');
  }

  cantidad(valor: number): string {
    return CANTIDAD.format(valor);
  }

  monto(valor: number): string {
    return MONTO.format(valor);
  }

  diferencia(origen: ConciliacionOrigen): number {
    return Math.round((origen.montoSfe - origen.montoLpt) * 100) / 100;
  }
}
