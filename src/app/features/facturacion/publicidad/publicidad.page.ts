import { Component } from '@angular/core';
import { GmRutaNavegacion, GmEncabezado } from '../../../shared/ui';

@Component({
  selector: 'gm-publicidad.page',
  imports: [GmEncabezado],
  templateUrl: './publicidad.page.html',
  styleUrl: './publicidad.page.scss',
})
export class PublicidadPage {
  readonly rutanavegacion: GmRutaNavegacion[] = [
    { etiqueta: 'Facturación' },
    { etiqueta: 'Publicidad' },
  ];
}
