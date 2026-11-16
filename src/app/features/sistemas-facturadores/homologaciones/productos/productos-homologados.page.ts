import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
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
import { oracion } from '../../../../shared/utils/texto';
import { HomologacionProductoRequest, HomologacionProductoResponse } from '../../data/sistemas.models';
import { SistemasService } from '../../data/sistemas.service';

type Formulario = Omit<HomologacionProductoRequest, 'sistemaId'>;

const FORM_VACIO: Formulario = {
  fecha: '',
  hora: '',
  codigoEntel: '',
  productoEntel: '',
  actividadCodigo: '610000',
  actividadNombre: 'Telecomunicaciones',
  codigoSin: '',
  productoSin: '',
};

const CAMPOS: { id: keyof Formulario; etiqueta: string; ejemplo?: string }[] = [
  { id: 'fecha', etiqueta: 'Fecha', ejemplo: '08/03/2022' },
  { id: 'hora', etiqueta: 'Hora', ejemplo: '13:37:55' },
  { id: 'codigoEntel', etiqueta: 'Código' },
  { id: 'productoEntel', etiqueta: 'Producto o servicio' },
  { id: 'actividadCodigo', etiqueta: 'Actividad' },
  { id: 'actividadNombre', etiqueta: 'Nombre de la actividad' },
  { id: 'codigoSin', etiqueta: 'Código SIN' },
  { id: 'productoSin', etiqueta: 'Producto o servicio SIN' },
];

type H = HomologacionProductoResponse;

const COLUMNAS: GmColumna<H>[] = [
  {
    id: 'fecha',
    titulo: 'Fecha',
    valor: (h) => `${h.fecha} · ${h.hora}`,
    sinSalto: true,
    movil: 'pie',
    etiquetaMovil: 'Homologado',
  },
  { id: 'codigoEntel', titulo: 'Código', grupo: 'ENTEL', etiquetaMovil: 'Código ENTEL' },
  {
    id: 'productoEntel',
    titulo: 'Producto o servicio',
    grupo: 'ENTEL',
    destacar: true,
    movil: 'titulo',
    valorMovil: (h) => oracion(h.productoEntel),
  },
  {
    id: 'actividad',
    titulo: 'Actividad',
    grupo: 'SIN',
    valor: (h) => `${h.actividadCodigo} · ${h.actividadNombre}`,
    etiquetaMovil: 'Actividad',
    ordenMovil: 99,
  },
  { id: 'codigoSin', titulo: 'Código', grupo: 'SIN', etiquetaMovil: 'Código SIN' },
  {
    id: 'productoSin',
    titulo: 'Producto o servicio',
    grupo: 'SIN',
    movil: 'titulo',
    valorMovil: (h) => oracion(h.productoSin),
  },
  { id: 'acciones', titulo: 'Acciones', ancho: '120px', movil: 'pie-fin' },
];

@Component({
  selector: 'gm-productos-homologados-page',
  imports: [RouterLink, GmEncabezado, GmBuscar, GmBoton, GmTabla, GmCelda, GmAccionesFila, GmModal],
  templateUrl: './productos-homologados.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'gm-pagina' },
})
export class ProductosHomologadosPage {
  private readonly datos = inject(SistemasService);
  private readonly toast = inject(Toast);
  private readonly confirmar = inject(Confirmar);
  private readonly router = inject(Router);

  /** Viene de la ruta :sistemaId */
  readonly sistemaId = input.required<string>();

  readonly columnas = COLUMNAS;
  readonly campos = CAMPOS;

  readonly query = signal('');
  /** null = modal cerrado; '' = crear; id = editar. */
  readonly editando = signal<string | null>(null);
  readonly form = signal<Formulario>({ ...FORM_VACIO });
  readonly error = signal<string | null>(null);

  readonly sistema = computed(() => {
    const id = this.sistemaId().replace(/^entel-/, '');
    return this.datos.sistemas().find((s) => s.id === id) ?? null;
  });

  readonly migas = computed<GmMiga[]>(() => [
    { etiqueta: 'Sistemas Facturadores', enlace: '/sistemas-facturadores' },
    { etiqueta: `Homologación de productos de ${this.sistema()?.codigo ?? 'sistema'}` },
  ]);

  readonly filtrados = computed(() => {
    const q = this.query().trim().toLowerCase();
    const id = this.sistema()?.id;
    return this.datos.homologaciones().filter((h) => {
      if (h.sistemaId !== id) return false;
      if (!q) return true;
      return [h.codigoEntel, h.productoEntel, h.actividadCodigo, h.actividadNombre, h.codigoSin, h.productoSin]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  });

  readonly vacio = computed(() =>
    this.query() ? 'No hay resultados para la búsqueda.' : 'Este sistema todavía no tiene productos homologados.',
  );

  constructor() {
    // Si la URL trae un id antiguo (entel-ZSMART), se corrige.
    effect(() => {
      const sistema = this.sistema();
      if (sistema && sistema.id !== this.sistemaId()) {
        void this.router.navigate(['/sistemas-facturadores', sistema.id, 'productos'], { replaceUrl: true });
      }
    });
  }

  abrir(h?: H): void {
    this.form.set(h ? { ...h } : { ...FORM_VACIO });
    this.error.set(null);
    this.editando.set(h?.id ?? '');
  }

  campo(nombre: keyof Formulario, valor: string): void {
    this.form.update((f) => ({ ...f, [nombre]: valor }));
  }

  guardar(event: Event): void {
    event.preventDefault();
    const id = this.editando();
    const sistema = this.sistema();
    if (id === null || !sistema) return;
    const payload = { ...this.form(), sistemaId: sistema.id };
    const error = id ? this.datos.updateHomologacion(id, payload) : this.datos.createHomologacion(payload);
    if (error) {
      this.error.set(error);
      return;
    }
    this.toast.mostrar(id ? 'Homologación actualizada.' : 'Homologación creada.');
    this.editando.set(null);
  }

  async eliminar(h: H): Promise<void> {
    const si = await this.confirmar.preguntar({
      titulo: 'Eliminar homologación',
      mensaje: `¿Está seguro de que desea eliminar ${h.productoEntel}?`,
      aceptar: 'Eliminar',
      peligro: true,
    });
    if (!si) return;
    this.datos.deleteHomologacion(h.id);
    this.toast.mostrar('Homologación eliminada.');
  }
}
