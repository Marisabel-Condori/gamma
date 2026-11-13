import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  Confirmar,
  GmAccionesFila,
  GmBoton,
  GmBuscar,
  GmCelda,
  GmColumna,
  GmEncabezado,
  GmMenuFila,
  GmModal,
  GmOpcion,
  GmTabla,
  Toast,
} from '../../../shared/ui';
import { conteo } from '../../../shared/utils/texto';
import { SistemaResponse } from '../data/sistemas.models';
import { SistemasService } from '../data/sistemas.service';

const OPCIONES_HOMOLOGAR: GmOpcion[] = [
  { id: 'productos', etiqueta: 'Productos' },
  { id: 'sucursales', etiqueta: 'Sucursales' },
  { id: 'unidades-medida', etiqueta: 'Unidades de medida' },
  { id: 'monedas', etiqueta: 'Tipos de moneda' },
  { id: 'metodos-pago', etiqueta: 'Tipo de método de pago' },
  { id: 'motivos-anulacion', etiqueta: 'Motivo de anulación' },
];

const COLUMNAS: GmColumna<SistemaResponse>[] = [
  { id: 'codigo', titulo: 'Sistema', destacar: true, ancho: '25%', movil: 'titulo' },
  { id: 'descripcion', titulo: 'Descripción', movil: 'subtitulo' },
  { id: 'homologar', titulo: 'Homologar', alinear: 'centro', ancho: '120px', movil: 'pie' },
  { id: 'acciones', titulo: 'Acciones', alinear: 'fin', ancho: '120px', movil: 'esquina' },
];

@Component({
  selector: 'gm-sistemas-lista-page',
  imports: [GmEncabezado, GmBuscar, GmBoton, GmTabla, GmCelda, GmAccionesFila, GmMenuFila, GmModal],
  templateUrl: './sistemas-lista.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'gm-pagina' },
})
export class SistemasListaPage {
  private readonly sistemas = inject(SistemasService);
  private readonly toast = inject(Toast);
  private readonly confirmar = inject(Confirmar);
  private readonly router = inject(Router);

  readonly columnas = COLUMNAS;
  readonly opcionesHomologar = OPCIONES_HOMOLOGAR;

  readonly query = signal('');
  /** null = modal cerrado; '' = crear; id = editar. */
  readonly editando = signal<string | null>(null);
  readonly form = signal({ codigo: '', descripcion: '' });
  readonly error = signal<string | null>(null);

  readonly filtrados = computed(() => {
    const q = this.query().trim().toLowerCase();
    return this.sistemas
      .sistemas()
      .filter((s) => !q || s.codigo.toLowerCase().includes(q) || s.descripcion.toLowerCase().includes(q));
  });

  readonly conteo = computed(() => conteo(this.filtrados().length, 'sistema', 'sistemas'));
  readonly vacio = computed(() =>
    this.query().trim() ? 'No hay resultados para la búsqueda.' : 'Todavía no hay sistemas facturadores.',
  );

  abrir(sistema?: SistemaResponse): void {
    this.form.set({ codigo: sistema?.codigo ?? '', descripcion: sistema?.descripcion ?? '' });
    this.error.set(null);
    this.editando.set(sistema?.id ?? '');
  }

  campo(nombre: 'codigo' | 'descripcion', valor: string): void {
    this.form.update((f) => ({ ...f, [nombre]: valor }));
  }

  guardar(event: Event): void {
    event.preventDefault();
    const id = this.editando();
    const error = id ? this.sistemas.updateSistema(id, this.form()) : this.sistemas.createSistema(this.form());
    if (error) {
      this.error.set(error);
      return;
    }
    this.toast.mostrar(id ? 'Sistema actualizado.' : 'Sistema creado.');
    this.editando.set(null);
  }

  async eliminar(sistema: SistemaResponse): Promise<void> {
    const si = await this.confirmar.preguntar({
      titulo: 'Eliminar sistema',
      mensaje: `¿Está seguro de que desea eliminar ${sistema.codigo}?`,
      aceptar: 'Eliminar',
      peligro: true,
    });
    if (!si) return;
    this.sistemas.deleteSistema(sistema.id);
    this.toast.mostrar(`${sistema.codigo} eliminado.`);
  }

  homologar(sistema: SistemaResponse, opcion: string): void {
    if (opcion === 'productos') {
      void this.router.navigate(['/sistemas-facturadores', sistema.id, 'productos']);
      return;
    }
    this.toast.mostrar('Esta opción todavía no está disponible.');
  }
}
