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
  GmSeccion,
  GmTabla,
  GmTexto,
  Toast,
} from '../../shared/ui';
import { conteo } from '../../shared/utils/texto';
import { SistemaResponse } from './data/sistemas.model';
import { SistemasService } from './data/sistemas.service';

const OPCIONES_HOMOLOGAR: GmOpcion[] = [
  { id: 'productos', etiqueta: 'Productos' },
  { id: 'multicentros', etiqueta: 'Multicentro' },
  { id: 'unidades-medida', etiqueta: 'Unidades de medida' },
  { id: 'monedas', etiqueta: 'Tipos de moneda' },
  { id: 'metodos-pago', etiqueta: 'Tipo de método de pago' },
  { id: 'documento-identificacion', etiqueta: 'Tipo documento identificación' },
  { id: 'motivos-anulacion', etiqueta: 'Motivo de anulación' },
];

const COLUMNAS: GmColumna<SistemaResponse>[] = [
  { id: 'codigo', titulo: 'Sistema', destacar: true, ancho: '25%', movil: 'titulo' },
  { id: 'descripcion', titulo: 'Descripción', movil: 'subtitulo' },
  { id: 'homologar', titulo: 'Homologar', alinear: 'centro', ancho: '120px', movil: 'pie' },
  { id: 'acciones', titulo: 'Acciones', alinear: 'fin', ancho: '120px', movil: 'esquina' },
];

// TODO: cambiar por usuario del login
const USUARIO = 'ADMIN';

const PANTALLAS_LISTAS = [
  'productos',
  'multicentros',
  'sucursales-sin',
  'unidades-medida',
  'monedas',
  'metodos-pago',
  'documento-identificacion',
  'motivos-anulacion',
];

@Component({
  selector: 'gm-sistemas-lista-page',
  imports: [GmEncabezado, GmBuscar, GmBoton, GmTabla, GmCelda, GmAccionesFila, GmMenuFila, GmModal, GmSeccion, GmTexto],
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
  readonly guardando = signal(false);

  readonly filtrados = computed(() => {
    const q = this.query().trim().toLowerCase();
    return this.sistemas
      .sistemas()
      .filter((s) => !q || s.codigo.toLowerCase().includes(q) || s.descripcion.toLowerCase().includes(q));
  });

  readonly conteo = computed(() =>
    this.sistemas.cargando() ? '' : conteo(this.filtrados().length, 'sistema', 'sistemas'),
  );
  readonly vacio = computed(() => {
    if (this.sistemas.cargando()) return 'Cargando sistemas facturadores...';
    if (this.sistemas.error()) return this.sistemas.error()!;
    return this.query().trim() ? 'No hay resultados para la búsqueda.' : 'Todavía no hay sistemas facturadores.';
  });

  constructor() {
    void this.sistemas.recargar();
  }

  abrir(sistema?: SistemaResponse): void {
    this.form.set({ codigo: sistema?.codigo ?? '', descripcion: sistema?.descripcion ?? '' });
    this.error.set(null);
    this.editando.set(sistema ? String(sistema.idSistema) : '');
  }

  campo(nombre: 'codigo' | 'descripcion', valor: string): void {
    this.form.update((f) => ({ ...f, [nombre]: valor }));
  }

  async guardar(event: Event): Promise<void> {
    event.preventDefault();
    const id = this.editando();
    if (id === null || this.guardando()) return;

    const sistema = this.form().codigo.trim();
    const descripcion = this.form().descripcion.trim();
    if (!sistema || !descripcion) {
      this.error.set('Completa código y descripción.');
      return;
    }

    this.error.set(null);
    this.guardando.set(true);
    const datos = { sistema, descripcion, usuarioAlta: USUARIO };
    const error = id ? await this.sistemas.actualizar(Number(id), datos) : await this.sistemas.crear(datos);
    this.guardando.set(false);
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
    const error = await this.sistemas.eliminar(sistema.idSistema, USUARIO);
    this.toast.mostrar(error ?? `${sistema.codigo} eliminado.`);
  }

  homologar(sistema: SistemaResponse, opcion: string): void {
    if (PANTALLAS_LISTAS.includes(opcion)) {
      void this.router.navigate(['/sistemas-facturadores', sistema.idSistema, opcion]);
      return;
    }
    this.toast.mostrar('Esta opción todavía no está disponible.');
  }
}
