import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  GmAccionesFila,
  GmBoton,
  GmBuscar,
  GmCelda,
  GmColumna,
  GmEncabezado,
  GmMiga,
  GmTabla,
  Toast,
} from '../../../../../shared/ui';
import { SistemasService } from '../../../data/sistemas.service';
import { PuntoVenta } from '../data/sucursales.models';
import { SucursalesService } from '../data/sucursales.service';

const COLUMNAS: GmColumna<PuntoVenta>[] = [
  { id: 'codigo', titulo: 'Código', ancho: '90px', etiquetaMovil: 'Código' },
  { id: 'descripcion', titulo: 'Punto de venta', destacar: true, movil: 'titulo' },
  { id: 'cuis', titulo: 'Código', grupo: 'CUIS', etiquetaMovil: 'Código' },
  { id: 'fechaCuis', titulo: 'Vigencia', grupo: 'CUIS', sinSalto: true, etiquetaMovil: 'Vigencia' },
  { id: 'cufd', titulo: 'Código', grupo: 'CUFD', recortar: true, etiquetaMovil: 'Código' },
  { id: 'fechaCufd', titulo: 'Vigencia', grupo: 'CUFD', sinSalto: true, etiquetaMovil: 'Vigencia' },
  { id: 'tipo', titulo: 'Tipo', ancho: '220px', etiquetaMovil: 'Tipo' },
  {
    id: 'sincroniza',
    titulo: 'Sincroniza',
    alinear: 'centro',
    valor: (p) => (p.sincroniza ? 'Sí' : 'No'),
    etiquetaMovil: 'Sincroniza',
  },
  { id: 'acciones', titulo: 'Acciones', ancho: '120px', movil: 'pie-fin' },
];

@Component({
  selector: 'gm-puntos-venta-page',
  imports: [RouterLink, GmEncabezado, GmBuscar, GmBoton, GmTabla, GmCelda, GmAccionesFila],
  templateUrl: './puntos-venta.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'gm-pagina' },
})
export class PuntosVentaPage {
  private readonly sistemas = inject(SistemasService);
  private readonly datos = inject(SucursalesService);
  private readonly toast = inject(Toast);
  private readonly route = inject(ActivatedRoute);

  /** Vienen de la ruta :sistemaId/sucursales/:sucursalId/puntos-venta */
  readonly sistemaId = input.required<string>();
  readonly sucursalId = input.required<string>();

  readonly columnas = COLUMNAS;
  readonly query = signal('');

  readonly sistema = computed(() => this.sistemas.sistemas().find((s) => s.id === this.sistemaId()) ?? null);
  readonly sucursal = computed(() => this.datos.sucursales().find((s) => s.id === this.sucursalId()) ?? null);
  readonly desdeSucursalesSin = computed(() => this.route.snapshot.routeConfig?.path?.includes('sucursales-sin') ?? false);
  readonly volver = computed(() => `/sistemas-facturadores/${this.sistemaId()}/${this.desdeSucursalesSin() ? 'sucursales-sin' : 'sucursales'}`);

  readonly migas = computed<GmMiga[]>(() => [
    { etiqueta: 'Sistemas Facturadores', enlace: '/sistemas-facturadores' },
    { etiqueta: `${this.desdeSucursalesSin() ? 'Sucursales SIN' : 'Multicentros'} de ${this.sistema()?.codigo ?? 'sistema'}`, enlace: this.volver() },
    { etiqueta: `${this.desdeSucursalesSin() ? 'Sucursal' : 'Multicentro'} ${this.sucursal()?.codigo ?? ''}` },
  ]);

  readonly filtrados = computed(() => {
    const q = this.query().trim().toLowerCase();
    return this.datos
      .puntosDe(this.sucursalId())
      .filter((p) => !q || `${p.codigo} ${p.descripcion} ${p.cuis} ${p.cufd} ${p.tipo}`.toLowerCase().includes(q));
  });

  readonly vacio = computed(() =>
    this.query() ? 'No hay resultados para la búsqueda.' : 'Esta sucursal todavía no tiene puntos de venta asignados.',
  );

  sincronizar(): void {
    this.toast.mostrar('Puntos de venta sincronizados.');
  }

  avisar(accion: string): void {
    this.toast.mostrar(`${accion} de punto de venta: todavía no está disponible.`);
  }
}
