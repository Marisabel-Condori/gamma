import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { GmBoton, GmCelda, GmColumna, GmEncabezado, GmRutaNavegacion, GmSeccion, Pantalla, GmTabla, GmFecha } from '../../../shared/ui';
import { ConciliacionSistema, FacturaConciliacion } from './data/conciliacion-postpago.model';
import { FACTURAS_POSTPAGO, SISTEMAS_POSTPAGO } from './data/conciliar-postpago.ejemplo';
import { cantidad, monto, redondear } from '../formato';

function diferenciaCantidad(fila: ConciliacionSistema): number | null {
  return fila.cantidadLpt == null ? null : fila.cantidadSfe - fila.cantidadLpt;
}

function diferenciaMonto(fila: ConciliacionSistema): number | null {
  return fila.montoLpt == null ? null : redondear(fila.montoSfe - fila.montoLpt);
}

const COLUMNAS_SISTEMAS: GmColumna<ConciliacionSistema>[] = [
  { id: 'sistema', titulo: 'Sistema', destacar: true, movil: 'titulo' },
  { id: 'cantidadSfe', titulo: 'Cantidad SFE', alinear: 'fin', valor: (f) => cantidad(f.cantidadSfe), etiquetaMovil: 'Cantidad SFE' },
  { id: 'cantidadLpt', titulo: 'Cantidad LPT', alinear: 'fin', valor: (f) => cantidad(f.cantidadLpt), etiquetaMovil: 'Cantidad LPT' },
  { id: 'cantidadDiferencia', titulo: 'Cantidad diferencia', alinear: 'fin', etiquetaMovil: 'Dif. cantidad' },
  { id: 'montoSfe', titulo: 'Monto SFE', alinear: 'fin', valor: (f) => monto(f.montoSfe), etiquetaMovil: 'Monto SFE' },
  { id: 'montoLpt', titulo: 'Monto LPT', alinear: 'fin', valor: (f) => monto(f.montoLpt), etiquetaMovil: 'Monto LPT' },
  { id: 'montoDiferencia', titulo: 'Monto diferencia', alinear: 'fin', etiquetaMovil: 'Dif. monto' },
];

const COLUMNAS_FACTURAS: GmColumna<FacturaConciliacion>[] = [
  { id: 'cuf', titulo: 'CUF', sinSalto: true, etiquetaMovil: 'CUF' },
  { id: 'sistemaSfe', titulo: 'Sistema SFE', etiquetaMovil: 'Sistema SFE' },
  { id: 'numeroFacturaSfe', titulo: 'Nro. factura SFE', alinear: 'fin', etiquetaMovil: 'Nro. factura SFE' },
  { id: 'fechaSfe', titulo: 'Fecha SFE', sinSalto: true, etiquetaMovil: 'Fecha SFE' },
  { id: 'montoSfe', titulo: 'Monto SFE', alinear: 'fin', valor: (f) => monto(f.montoSfe), etiquetaMovil: 'Monto SFE' },
  { id: 'sistemaPost', titulo: 'Sistema post', etiquetaMovil: 'Sistema post' },
  { id: 'numeroFacturaPost', titulo: 'Nro. factura post', alinear: 'fin', etiquetaMovil: 'Nro. factura post' },
  { id: 'fechaPost', titulo: 'Fecha post', sinSalto: true, etiquetaMovil: 'Fecha post' },
  { id: 'montoPost', titulo: 'Monto post', alinear: 'fin', valor: (f) => monto(f.montoPost), etiquetaMovil: 'Monto post' },
];

@Component({
  selector: 'gm-conciliar-postpago-page',
  imports: [GmEncabezado, GmSeccion, GmFecha, GmBoton, GmTabla, GmCelda],
  templateUrl: './conciliar-postpago.page.html',
  styleUrl: './conciliar-postpago.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'gm-pagina' },
})
export class ConciliarPostpagoPage {
  readonly esMovil = inject(Pantalla).esMovil;
  readonly columnasSistemas = COLUMNAS_SISTEMAS;
  readonly columnasFacturas = COLUMNAS_FACTURAS;
  readonly rutanavegacion: GmRutaNavegacion[] = [{ etiqueta: 'Vistas' }, { etiqueta: 'Conciliar postpago' }];

  readonly periodo = signal('202610');
  readonly sistemas = signal<ConciliacionSistema[]>([]);
  readonly facturas = signal<FacturaConciliacion[]>([]);
  readonly consultado = signal(false);

  readonly totalCantidad = computed(() => cantidad(this.sistemas().reduce((total, f) => total + f.cantidadSfe, 0)));
  readonly totalMonto = computed(() => monto(this.sistemas().reduce((total, f) => total + f.montoSfe, 0)));

  readonly diferenciaCantidad = diferenciaCantidad;
  readonly diferenciaMonto = diferenciaMonto;
  readonly cantidad = cantidad;
  readonly monto = monto;

  consultar(event: Event): void {
    event.preventDefault();
    this.sistemas.set(SISTEMAS_POSTPAGO);
    this.facturas.set(FACTURAS_POSTPAGO);
    this.consultado.set(true);
  }
}
