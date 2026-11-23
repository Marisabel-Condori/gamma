import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { GmBoton, GmColumna, GmModal, GmTabla, Toast } from '../../../../shared/ui';
import { ContactoFactura, DetalleFacturaResponse, ItemFactura, MensajeFactura } from '../data/facturas.model';

const bs = (monto: number) => `Bs ${monto.toFixed(2)}`;

const COLUMNAS_ITEMS: GmColumna<ItemFactura>[] = [
  { id: 'codigo', titulo: 'Código', ancho: '90px', etiquetaMovil: 'Código' },
  { id: 'descripcion', titulo: 'Descripción', movil: 'titulo' },
  { id: 'cantidad', titulo: 'Cant.', alinear: 'fin', ancho: '70px', etiquetaMovil: 'Cantidad' },
  { id: 'precio', titulo: 'Precio', alinear: 'fin', sinSalto: true, valor: (item) => bs(item.precio), etiquetaMovil: 'Precio' },
  { id: 'subtotal', titulo: 'Subtotal', alinear: 'fin', sinSalto: true, valor: (item) => bs(item.subtotal), movil: 'subtitulo' },
];

const COLUMNAS_CONTACTOS: GmColumna<ContactoFactura>[] = [
  { id: 'tipo', titulo: 'Tipo', ancho: '110px', movil: 'esquina' },
  { id: 'valor', titulo: 'Valor', movil: 'titulo' },
];

const COLUMNAS_MENSAJES: GmColumna<MensajeFactura>[] = [
  { id: 'codigo', titulo: 'Código', ancho: '90px', movil: 'esquina' },
  { id: 'descripcion', titulo: 'Descripción', movil: 'titulo' },
];

@Component({
  selector: 'gm-detalle-factura',
  imports: [GmModal, GmTabla, GmBoton],
  templateUrl: './detalle-factura.html',
  styleUrl: './detalle-factura.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GmDetalleFactura {
  private readonly toast = inject(Toast);

  readonly detalle = input.required<DetalleFacturaResponse>();
  readonly cerrar = output<void>();

  readonly columnasItems = COLUMNAS_ITEMS;
  readonly columnasContactos = COLUMNAS_CONTACTOS;
  readonly columnasMensajes = COLUMNAS_MENSAJES;
  readonly bs = bs;

  verBitacora(): void {
    this.toast.mostrar('Pendiente bitácora.');
  }
}
