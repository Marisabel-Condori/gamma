import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  GmAccionesFila,
  GmBoton,
  GmBuscar,
  GmCelda,
  GmColumna,
  GmEncabezado,
  GmMiga,
  GmModal,
  GmTabla,
  Toast,
} from '../../../../../shared/ui';
import { SistemasService } from '../../../data/sistemas.service';
import { SISTEMAS_SIN } from '../data/sucursales.mock';
import { PuntoVenta, SistemaSin } from '../data/sucursales.models';
import { SucursalesService } from '../data/sucursales.service';

type Codigo = 'CUIS' | 'CUFD';

const COLUMNAS: GmColumna<PuntoVenta>[] = [
  { id: 'codigo', titulo: 'Código', ancho: '90px', etiquetaMovil: 'Código' },
  { id: 'descripcion', titulo: 'Punto de venta', destacar: true, movil: 'titulo' },
  { id: 'cuis', titulo: 'Código', grupo: 'CUIS', etiquetaMovil: 'Código' },
  { id: 'reprocesarCuis', titulo: 'Reprocesar', grupo: 'CUIS', alinear: 'centro', movil: 'pie' },
  { id: 'fechaCuis', titulo: 'Vigencia', grupo: 'CUIS', sinSalto: true, etiquetaMovil: 'Vigencia' },
  { id: 'cufd', titulo: 'Código', grupo: 'CUFD', recortar: true, etiquetaMovil: 'Código' },
  { id: 'reprocesarCufd', titulo: 'Reprocesar', grupo: 'CUFD', alinear: 'centro', movil: 'pie' },
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
  imports: [RouterLink, GmEncabezado, GmBuscar, GmBoton, GmTabla, GmCelda, GmAccionesFila, GmModal],
  templateUrl: './puntos-venta.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'gm-pagina' },
})
export class PuntosVentaPage {
  private readonly sistemas = inject(SistemasService);
  private readonly datos = inject(SucursalesService);
  private readonly toast = inject(Toast);

  /** Vienen de la ruta :sistemaId/sucursales/:sucursalId/puntos-venta */
  readonly sistemaId = input.required<string>();
  readonly sucursalId = input.required<string>();

  readonly columnas = COLUMNAS;
  readonly query = signal('');

  readonly sistema = computed(() => this.sistemas.sistemas().find((s) => s.id === this.sistemaId()) ?? null);
  readonly sucursal = computed(() => this.datos.sucursales().find((s) => s.id === this.sucursalId()) ?? null);
  readonly volver = computed(() => `/sistemas-facturadores/${this.sistemaId()}/sucursales`);

  readonly migas = computed<GmMiga[]>(() => [
    { etiqueta: 'Sistemas Facturadores', enlace: '/sistemas-facturadores' },
    { etiqueta: `Sucursales de ${this.sistema()?.codigo ?? 'sistema'}`, enlace: this.volver() },
    { etiqueta: `Sucursal ${this.sucursal()?.codigo ?? ''}` },
  ]);

  readonly subtitulo = computed(() => {
    const s = this.sucursal();
    return s ? `Sucursal ${s.codigo} · ${s.descripcion}` : '';
  });

  readonly filtrados = computed(() => {
    const q = this.query().trim().toLowerCase();
    return this.datos
      .puntosDe(this.sucursalId())
      .filter((p) => !q || `${p.codigo} ${p.descripcion} ${p.cuis} ${p.cufd} ${p.tipo}`.toLowerCase().includes(q));
  });

  readonly vacio = computed(() =>
    this.query() ? 'No hay resultados para la búsqueda.' : 'Esta sucursal todavía no tiene puntos de venta asignados.',
  );

  // ── Reproceso de CUIS / CUFD ──
  readonly reproceso = signal<{ punto: PuntoVenta; codigo: Codigo } | null>(null);
  readonly queryReproceso = signal('');

  readonly sistemasSin = computed(() => {
    const r = this.reproceso();
    const q = this.queryReproceso().trim().toLowerCase();
    if (!r) return [];
    return SISTEMAS_SIN.filter(
      (s) => !q || `${s.nombre} ${s.codigo} ${r.punto.cuis} ${r.punto.cufd}`.toLowerCase().includes(q),
    );
  });

  readonly columnasReproceso = computed<GmColumna<SistemaSin>[]>(() => {
    const r = this.reproceso();
    const base: GmColumna<SistemaSin>[] = [
      { id: 'nombre', titulo: 'Sistema SIN', destacar: true, movil: 'titulo' },
      { id: 'codigo', titulo: 'Código sistema SIN', recortar: true, etiquetaMovil: 'Código' },
      { id: 'cuis', titulo: 'CUIS', valor: () => r?.punto.cuis ?? '', etiquetaMovil: 'CUIS' },
    ];
    return r?.codigo === 'CUIS'
      ? [...base, { id: 'reprocesar', titulo: 'Reproceso', alinear: 'centro', movil: 'pie-fin' }]
      : [...base, { id: 'cufd', titulo: 'CUFD', recortar: true, valor: () => r?.punto.cufd ?? '', etiquetaMovil: 'CUFD' }];
  });

  abrirReproceso(punto: PuntoVenta, codigo: Codigo): void {
    this.queryReproceso.set('');
    this.reproceso.set({ punto, codigo });
  }

  reprocesar(): void {
    this.toast.mostrar(`Solicitud de reproceso ${this.reproceso()?.codigo} enviada.`);
    this.reproceso.set(null);
  }

  sincronizar(): void {
    this.toast.mostrar('Puntos de venta sincronizados.');
  }

  avisar(accion: string): void {
    this.toast.mostrar(`${accion} de punto de venta: todavía no está disponible.`);
  }
}
