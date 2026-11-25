import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { GmBoton, GmEncabezado, GmRutaNavegacion, GmSeccion, Pantalla, GmFecha, Toast } from '../../../shared/ui';
import { ConciliacionDia, ConciliacionOrigen } from './data/conciliacion.model';
import { CONCILIACION_PREPAGO } from './data/conciliar-prepago.ejemplo';
import { cantidad, monto, redondear } from '../../../shared/utils/numeros';

const ORIGENES = ['BANCA', 'SICO', 'RECINT'];

@Component({
  selector: 'gm-conciliar-prepago-page',
  imports: [GmEncabezado, GmSeccion, GmFecha, GmBoton],
  templateUrl: './conciliar-prepago.page.html',
  styleUrl: './conciliar-prepago.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'gm-pagina' },
})
export class ConciliarPrepagoPage {
  readonly esMovil = inject(Pantalla).esMovil;
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

  readonly cantidad = cantidad;
  readonly monto = monto;

  diferencia(origen: ConciliacionOrigen): number {
    return redondear(origen.montoSfe - origen.montoLpt);
  }
}
