import { Component } from '@angular/core';
import { GmEncabezado, GmRutaNavegacion } from '../../../shared/ui';

@Component({
  selector: 'gm-alquiler.page',
  imports: [GmEncabezado],
  templateUrl: './alquiler.page.html',
  styleUrl: './alquiler.page.scss',
})
export class AlquilerPage {
  readonly rutanavegacion: GmRutaNavegacion[] = [
    { etiqueta: 'Facturación' },
    { etiqueta: 'Alquiler' },
  ];
}
