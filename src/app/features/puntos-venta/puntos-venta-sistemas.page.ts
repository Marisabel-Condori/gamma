import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { GmBoton, GmCelda, GmColumna, GmEncabezado, GmTabla } from '../../shared/ui';
import { SistemaResponse } from '../sistemas-facturadores/data/sistemas.model';
import { SistemasService } from '../sistemas-facturadores/data/sistemas.service';

const COLUMNAS: GmColumna<SistemaResponse>[] = [
  { id: 'codigo', titulo: 'Sistema', destacar: true, ancho: '25%', movil: 'titulo' },
  { id: 'descripcion', titulo: 'Descripción', movil: 'subtitulo' },
  { id: 'puntosVenta', titulo: 'Puntos de venta', alinear: 'fin', ancho: '220px', movil: 'pie' },
];

@Component({
  selector: 'gm-puntos-venta-sistemas-page',
  imports: [GmEncabezado, GmBoton, GmCelda, GmTabla],
  template: `
    <gm-encabezado titulo="Puntos de venta" tituloMovil="Puntos de venta" />
    <gm-tabla [datos]="sistemas()" [columnas]="columnas" anchoMinimo="720px" vacio="Todavía no hay sistemas facturadores.">
      <ng-template gmCelda="puntosVenta" let-sistema>
        <button gmBoton="neutro" type="button" icono="tienda" etiqueta="Ver puntos de venta" (click)="abrir(sistema)"></button>
      </ng-template>
    </gm-tabla>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'gm-pagina' },
})
export class PuntosVentaSistemasPage {
  private readonly router = inject(Router);
  readonly sistemas = inject(SistemasService).sistemas;
  readonly columnas = COLUMNAS;

  abrir(sistema: SistemaResponse): void {
    void this.router.navigate(['/sistemas-facturadores', sistema.id, 'sucursales-sin']);
  }
}
