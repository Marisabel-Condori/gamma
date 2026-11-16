import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  Confirmar,
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
import { HomologacionSucursal } from '../data/sucursales.models';
import { SucursalesService } from '../data/sucursales.service';

const COLUMNAS: GmColumna<HomologacionSucursal>[] = [
  { id: 'codigo', titulo: 'Código sucursal SIN', ancho: '160px', destacar: true, movil: 'titulo', etiquetaMovil: 'Código SIN' },
  { id: 'descripcion', titulo: 'Descripción', movil: 'subtitulo' },
  { id: 'asignacion', titulo: 'Asignación puntos de venta', ancho: '220px', alinear: 'centro', movil: 'pie' },
  { id: 'acciones', titulo: 'Acciones', ancho: '120px', movil: 'pie-fin' },
];

@Component({
  selector: 'gm-sucursales-sin-page',
  imports: [RouterLink, GmEncabezado, GmBuscar, GmBoton, GmTabla, GmCelda, GmAccionesFila, GmModal],
  templateUrl: './sucursales-sin.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'gm-pagina' },
})
export class SucursalesSinPage {
  private readonly sistemas = inject(SistemasService);
  private readonly datos = inject(SucursalesService);
  private readonly toast = inject(Toast);
  private readonly confirmar = inject(Confirmar);

  readonly sistemaId = input.required<string>();
  readonly columnas = COLUMNAS;
  readonly query = signal('');
  readonly editando = signal<string | null>(null);
  readonly form = signal({ codigo: '', descripcion: '' });
  readonly error = signal<string | null>(null);
  readonly sistema = computed(() => this.sistemas.sistemas().find((s) => s.id === this.sistemaId()) ?? null);
  readonly migas = computed<GmMiga[]>(() => [
    { etiqueta: 'Sistemas Facturadores', enlace: '/sistemas-facturadores' },
    { etiqueta: `Sucursales SIN de ${this.sistema()?.codigo ?? 'sistema'}` },
  ]);
  readonly filtradas = computed(() => {
    const q = this.query().trim().toLowerCase();
    return this.datos.sucursales()
      .filter((s) => s.sistemaId === this.sistemaId())
      .filter((s) => !q || `${s.codigo} ${s.descripcion}`.toLowerCase().includes(q));
  });
  readonly vacio = computed(() => this.query().trim()
    ? 'No hay sucursales que coincidan con la búsqueda.'
    : 'Este sistema todavía no tiene sucursales SIN.');

  puntos(sucursal: HomologacionSucursal): string {
    const total = this.datos.puntosDe(sucursal.id).length;
    return `${total} ${total === 1 ? 'punto de venta' : 'puntos de venta'}`;
  }

  abrir(sucursal?: HomologacionSucursal): void {
    this.form.set({ codigo: sucursal?.codigo ?? '', descripcion: sucursal?.descripcion ?? '' });
    this.error.set(null);
    this.editando.set(sucursal?.id ?? '');
  }

  campo(nombre: 'codigo' | 'descripcion', valor: string): void {
    this.form.update((actual) => ({ ...actual, [nombre]: valor }));
  }

  guardar(event: Event): void {
    event.preventDefault();
    const id = this.editando();
    if (id === null) return;
    const datos = { ...this.form(), sistemaId: this.sistemaId() };
    const error = id ? this.datos.actualizar(id, datos) : this.datos.crear(datos);
    if (error) {
      this.error.set(error);
      return;
    }
    this.toast.mostrar(id ? 'Sucursal SIN actualizada.' : 'Sucursal SIN creada.');
    this.editando.set(null);
  }

  async eliminar(sucursal: HomologacionSucursal): Promise<void> {
    const si = await this.confirmar.preguntar({
      titulo: 'Eliminar sucursal SIN',
      mensaje: `¿Está seguro de que desea eliminar la sucursal ${sucursal.codigo}?`,
      aceptar: 'Eliminar',
      peligro: true,
    });
    if (!si) return;
    this.datos.eliminar(sucursal.id);
    this.toast.mostrar(`Sucursal ${sucursal.codigo} eliminada.`);
  }
}
