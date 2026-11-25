import { Component } from '@angular/core';
import { GmEncabezado, GmRutaNavegacion } from '../../../shared/ui';

@Component({
  selector: 'gm-compra-venta.page',
  imports: [GmEncabezado],
  templateUrl: './compra-venta.page.html',
  styleUrl: './compra-venta.page.scss',
})
export class CompraVentaPage {
  readonly rutanavegacion: GmRutaNavegacion[] = [
    { etiqueta: 'Facturación' },
    { etiqueta: 'Compra y venta' },
  ];
}
