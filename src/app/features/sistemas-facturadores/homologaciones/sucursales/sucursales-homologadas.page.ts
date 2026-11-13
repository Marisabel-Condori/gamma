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
} from '../../../../shared/ui';
import { SistemasService } from '../../data/sistemas.service';
import { HomologacionSucursal } from './data/sucursales.models';
import { SucursalesService } from './data/sucursales.service';

type S = HomologacionSucursal;

const COLUMNAS: GmColumna<S>[] = [
  {
    id: 'codigo',
    titulo: 'Código sucursal',
    grupo: 'SIN',
    ancho: '160px',
    destacar: true,
    movil: 'titulo',
    valorMovil: (s) => `Sucursal ${s.codigo}`,
  },
  { id: 'descripcion', titulo: 'Descripción', grupo: 'SIN', movil: 'subtitulo' },
  { id: 'puntos', titulo: 'Puntos de venta', ancho: '200px', alinear: 'centro', movil: 'pie' },
  { id: 'acciones', titulo: 'Acciones', ancho: '120px', movil: 'pie-fin' },
];

@Component({
  selector: 'gm-sucursales-homologadas-page',
  imports: [RouterLink, GmEncabezado, GmBuscar, GmBoton, GmTabla, GmCelda, GmAccionesFila, GmModal],
  templateUrl: './sucursales-homologadas.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'gm-pagina' },
})
export class SucursalesHomologadasPage {
  private readonly sistemas = inject(SistemasService);
  private readonly datos = inject(SucursalesService);
  private readonly toast = inject(Toast);
  private readonly confirmar = inject(Confirmar);

  /** Viene de la ruta :sistemaId */
  readonly sistemaId = input.required<string>();

  readonly columnas = COLUMNAS;
  readonly query = signal('');
  /** null = modal cerrado; '' = crear; id = editar. */
  readonly editando = signal<string | null>(null);
  readonly form = signal({ codigo: '', descripcion: '' });
  readonly error = signal<string | null>(null);

  readonly sistema = computed(() => this.sistemas.sistemas().find((s) => s.id === this.sistemaId()) ?? null);

  readonly migas = computed<GmMiga[]>(() => [
    { etiqueta: 'Sistemas Facturadores', enlace: '/sistemas-facturadores' },
    { etiqueta: `Homologación de sucursales de ${this.sistema()?.codigo ?? 'sistema'}` },
  ]);

  readonly filtradas = computed(() => {
    const q = this.query().trim().toLowerCase();
    return this.datos
      .sucursales()
      .filter((s) => s.sistemaId === this.sistemaId())
      .filter((s) => !q || `${s.codigo} ${s.descripcion}`.toLowerCase().includes(q));
  });

  readonly vacio = computed(() =>
    this.query() ? 'No hay resultados para la búsqueda.' : 'Este sistema todavía no tiene sucursales homologadas.',
  );

  puntos(s: S): string {
    const total = this.datos.puntosDe(s.id).length;
    return `${total} ${total === 1 ? 'punto de venta' : 'puntos de venta'}`;
  }

  abrir(s?: S): void {
    this.form.set({ codigo: s?.codigo ?? '', descripcion: s?.descripcion ?? '' });
    this.error.set(null);
    this.editando.set(s?.id ?? '');
  }

  campo(nombre: 'codigo' | 'descripcion', valor: string): void {
    this.form.update((f) => ({ ...f, [nombre]: valor }));
  }

  guardar(event: Event): void {
    event.preventDefault();
    const id = this.editando();
    if (id === null) return;
    const payload = { ...this.form(), sistemaId: this.sistemaId() };
    const error = id ? this.datos.actualizar(id, payload) : this.datos.crear(payload);
    if (error) {
      this.error.set(error);
      return;
    }
    this.toast.mostrar(id ? 'Sucursal actualizada.' : 'Sucursal creada.');
    this.editando.set(null);
  }

  async eliminar(s: S): Promise<void> {
    const si = await this.confirmar.preguntar({
      titulo: 'Eliminar sucursal',
      mensaje: `¿Está seguro de que desea eliminar la sucursal ${s.codigo}?`,
      aceptar: 'Eliminar',
      peligro: true,
    });
    if (!si) return;
    this.datos.eliminar(s.id);
    this.toast.mostrar('Sucursal eliminada.');
  }
}
