import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { GmBoton, GmColumna, GmModal, GmTabla } from '../../../../shared/ui';
import { CuentaCliente } from '../../../../core/models/cliente.model';

const COLUMNAS: GmColumna<CuentaCliente>[] = [
  { id: 'codigoCliente', titulo: 'CLIENTE', sinSalto: true, etiquetaMovil: 'Cliente' },
  { id: 'codigoCuenta', titulo: 'CUENTA', destacar: true, sinSalto: true, movil: 'titulo' },
  { id: 'razonSocial', titulo: 'RAZÓN SOCIAL', recortar: true, movil: 'subtitulo' },
  { id: 'numeroDocumento', titulo: 'NÚMERO DOCUMENTO', sinSalto: true, etiquetaMovil: 'Documento' },
  {
    id: 'complemento',
    titulo: 'COMPLEMENTO',
    valor: (c) => c.complemento || '—',
    etiquetaMovil: 'Complemento',
  },
  { id: 'tipoDocumento', titulo: 'TIPO DOCUMENTO', movil: 'esquina' },
];

/**  Modal para elegir una cuenta cuando la búsqueda devuelve varios resultados.
 *   <gm-seleccionar-cuenta [cuentas]="cuentas" (seleccionar)="elegir($event)" (cerrar)="..." />
 */
@Component({
  selector: 'gm-seleccionar-cuenta',
  imports: [GmModal, GmTabla, GmBoton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <gm-modal
      titulo="Seleccione la cuenta"
      [etiqueta]="cuentas().length + ' resultados'"
      ancho="980px"
      (cerrar)="cerrar.emit()"
    >
      <gm-tabla
        [datos]="cuentas()"
        [columnas]="columnas"
        clave="codigoCuenta"
        cabecera="clara"
        [compacta]="true"
        [porPagina]="5"
        anchoMinimo="760px"
        seleccionable
        (seleccionarFila)="seleccionar.emit($event)"
      />
      <div class="gm-acciones">
        <button gmBoton="neutro" type="button" etiqueta="Cancelar" (click)="cerrar.emit()"></button>
      </div>
    </gm-modal>
  `,
  styles: `
    .ayuda {
      margin: 0 0 14px;
      color: var(--tinta-2);
      font-size: var(--texto-sm);
    }
  `,
})
export class GmSeleccionarCuenta {
  readonly cuentas = input.required<readonly CuentaCliente[]>();
  readonly seleccionar = output<CuentaCliente>();
  readonly cerrar = output<void>();

  protected readonly columnas = COLUMNAS;
}
