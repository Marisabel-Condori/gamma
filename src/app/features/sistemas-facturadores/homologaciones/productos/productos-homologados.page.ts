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
  GmLista,
  GmMiga,
  GmModal,
  GmOpcionLista,
  GmSeccion,
  GmTabla,
  GmTexto,
  Toast,
} from '../../../../shared/ui';
import { oracion } from '../../../../shared/utils/texto';
import { ACTIVIDADES_SIN, PRODUCTOS_SIN } from '../../data/catalogos-sin';
import { HomologacionProductoResponse } from '../../data/sistemas.models';
import { SistemasService } from '../../data/sistemas.service';

/** Nombre corto para el tipo de cada fila de esta pantalla. */
type Homologacion = HomologacionProductoResponse;

const COLUMNAS: GmColumna<Homologacion>[] = [
  {
    id: 'fecha',
    titulo: 'Fecha',
    valor: (homologacion) => `${homologacion.fecha} · ${homologacion.hora}`,
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
    valorMovil: (homologacion) => oracion(homologacion.productoEntel),
  },
  {
    id: 'actividad',
    titulo: 'Actividad',
    grupo: 'SIN',
    valor: (homologacion) => `${homologacion.actividadCodigo} · ${homologacion.actividadNombre}`,
    etiquetaMovil: 'Actividad',
    ordenMovil: 99,
  },
  { id: 'codigoSin', titulo: 'Código', grupo: 'SIN', etiquetaMovil: 'Código SIN' },
  {
    id: 'productoSin',
    titulo: 'Producto o servicio',
    grupo: 'SIN',
    movil: 'titulo',
    valorMovil: (homologacion) => oracion(homologacion.productoSin),
  },
  { id: 'acciones', titulo: 'Acciones', ancho: '120px', movil: 'pie-fin' },
];

const ACTIVIDADES: GmOpcionLista[] = ACTIVIDADES_SIN.map((a) => ({ valor: a.codigo, etiqueta: `${a.codigo} · ${a.nombre}` }));

@Component({
  selector: 'gm-productos-homologados-page',
  imports: [
    RouterLink,
    GmEncabezado,
    GmBuscar,
    GmBoton,
    GmTabla,
    GmCelda,
    GmAccionesFila,
    GmModal,
    GmSeccion,
    GmTexto,
    GmLista,
  ],
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
  readonly actividades = ACTIVIDADES;

  readonly query = signal('');

  // ── Formulario del modal ──
  /** null = modal cerrado; '' = crear; id = editar. */
  readonly editando = signal<string | null>(null);
  readonly codigoEntel = signal('');
  readonly productoEntel = signal('');
  readonly actividad = signal('');
  readonly productoSin = signal('');
  readonly error = signal<string | null>(null);

  /** Productos del SIN de la actividad elegida. */
  readonly productosSin = computed<GmOpcionLista[]>(() =>
    PRODUCTOS_SIN.filter((p) => p.actividad === this.actividad()).map((p) => ({
      valor: p.codigo,
      etiqueta: `${p.codigo} · ${p.nombre}`,
    })),
  );

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
    return this.datos.homologaciones().filter((homologacion) => {
      if (homologacion.sistemaId !== id) return false;
      if (!q) return true;
      return [
        homologacion.codigoEntel,
        homologacion.productoEntel,
        homologacion.actividadCodigo,
        homologacion.actividadNombre,
        homologacion.codigoSin,
        homologacion.productoSin,
      ]
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

  abrir(homologacion?: Homologacion): void {
    this.codigoEntel.set(homologacion?.codigoEntel ?? '');
    this.productoEntel.set(homologacion?.productoEntel ?? '');
    this.actividad.set(homologacion?.actividadCodigo ?? '');
    this.productoSin.set(homologacion?.codigoSin ?? '');
    this.error.set(null);
    this.editando.set(homologacion?.id ?? '');
  }

  /** Al cambiar de actividad, el producto elegido ya no corresponde. */
  elegirActividad(codigo: string): void {
    this.actividad.set(codigo);
    this.productoSin.set('');
  }

  guardar(event: Event): void {
    event.preventDefault();
    const id = this.editando();
    const sistema = this.sistema();
    if (id === null || !sistema) return;

    const actividad = ACTIVIDADES_SIN.find((a) => a.codigo === this.actividad());
    const producto = PRODUCTOS_SIN.find((p) => p.codigo === this.productoSin() && p.actividad === this.actividad());
    if (!this.codigoEntel().trim() || !this.productoEntel().trim() || !actividad || !producto) {
      this.error.set('Completa todos los campos de la homologación.');
      return;
    }

    // La fecha y hora de homologación se registran al crear; al editar se conservan.
    const anterior = this.datos.homologaciones().find((homologacion) => homologacion.id === id);
    const { fecha, hora } = anterior ?? ahora();
    const payload = {
      sistemaId: sistema.id,
      fecha,
      hora,
      codigoEntel: this.codigoEntel(),
      productoEntel: this.productoEntel(),
      actividadCodigo: actividad.codigo,
      actividadNombre: actividad.nombre,
      codigoSin: producto.codigo,
      productoSin: producto.nombre,
    };
    const error = id ? this.datos.updateHomologacion(id, payload) : this.datos.createHomologacion(payload);
    if (error) {
      this.error.set(error);
      return;
    }
    this.toast.mostrar(id ? 'Homologación actualizada.' : 'Homologación creada.');
    this.editando.set(null);
  }

  async eliminar(homologacion: Homologacion): Promise<void> {
    const si = await this.confirmar.preguntar({
      titulo: 'Eliminar homologación',
      mensaje: `¿Está seguro de que desea eliminar ${homologacion.productoEntel}?`,
      aceptar: 'Eliminar',
      peligro: true,
    });
    if (!si) return;
    this.datos.deleteHomologacion(homologacion.id);
    this.toast.mostrar('Homologación eliminada.');
  }
}

function ahora(): { fecha: string; hora: string } {
  const d = new Date();
  const dos = (n: number) => String(n).padStart(2, '0');
  return {
    fecha: `${dos(d.getDate())}/${dos(d.getMonth() + 1)}/${d.getFullYear()}`,
    hora: `${dos(d.getHours())}:${dos(d.getMinutes())}:${dos(d.getSeconds())}`,
  };
}
