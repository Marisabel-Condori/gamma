import { Component } from '@angular/core';
import { GmRutaNavegacion, GmEncabezado } from '../../../shared/ui';

@Component({
  selector: 'gm-telecomunicaciones.page',
  imports: [GmEncabezado],
  templateUrl: './telecomunicaciones.page.html',
  styleUrl: './telecomunicaciones.page.scss',
})
export class TelecomunicacionesPage {
  readonly rutanavegacion: GmRutaNavegacion[] = [
    { etiqueta: 'Facturación' },
    { etiqueta: 'Telecomunicaciones' },
  ];
}
