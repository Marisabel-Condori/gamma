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
  GmLista,
  GmRutaNavegacion,
  GmModal,
  GmOpcionLista,
  GmSeccion,
  GmTabla,
  GmTexto,
  Toast,
} from '../../../../shared/ui';
import { oracion } from '../../../../shared/utils/texto';
import { cambiaFormatoFecha } from '../../../../shared/utils/fechas';
import { sinRepetidos } from '../../../../shared/utils/listas';
import { CatalogoProductosService } from '../../data/catalogo-productos.service';
import { HomologacionProductoResponse } from '../../data/homologacion-productos.model';
import { HomologacionProductosService } from '../../data/homologacion-productos.service';
import { SistemasService } from '../../data/sistemas.service';

type Homologacion = HomologacionProductoResponse;

const COLUMNAS: GmColumna<Homologacion>[] = [
  {
    id: 'fechaAlta',
    titulo: 'Fecha',
    valor: (homologacion) => cambiaFormatoFecha(homologacion.fechaAlta),
    sinSalto: true,
    movil: 'pie',
    etiquetaMovil: 'Homologado',
  },
  { id: 'codigo', titulo: 'Código', grupo: 'ENTEL', etiquetaMovil: 'Código ENTEL' },
  {
    id: 'descripcion',
    titulo: 'Producto o servicio',
    grupo: 'ENTEL',
    destacar: true,
    movil: 'titulo',
    valorMovil: (homologacion) => oracion(homologacion.descripcion),
  },
  {
    id: 'descripcionActividadSin',
    titulo: 'Actividad',
    grupo: 'SIN',
    etiquetaMovil: 'Actividad',
    ordenMovil: 99,
  },
  { id: 'codigoProductoServicioSin', titulo: 'Código', grupo: 'SIN', etiquetaMovil: 'Código SIN' },
  {
    id: 'descripcionProductoSin',
    titulo: 'Producto o servicio',
    grupo: 'SIN',
    movil: 'titulo',
    valorMovil: (homologacion) => oracion(homologacion.descripcionProductoSin),
  },
  { id: 'acciones', titulo: 'Acciones', ancho: '120px', movil: 'pie-fin' },
];

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
  private readonly sistemas = inject(SistemasService);
  private readonly api = inject(HomologacionProductosService);
  private readonly toast = inject(Toast);
  private readonly confirmar = inject(Confirmar);
  private readonly catalogos = inject(CatalogoProductosService);

  readonly sistemaId = input.required<string>();

  readonly columnas = COLUMNAS;

  readonly query = signal('');

  /** null = modal cerrado; '' = crear; id = editar. */
  readonly editando = signal<string | null>(null);
  readonly codigoEntel = signal('');
  readonly productoEntel = signal('');
  readonly actividad = signal('');
  readonly productoSin = signal('');
  readonly error = signal<string | null>(null);
  readonly guardando = signal(false);

  readonly sistema = computed(
    () => this.sistemas.sistemas().find((s) => String(s.idSistema) === this.sistemaId()) ?? null,
  );

  private readonly listado = this.api.listar(() => this.sistema()?.idSistema);
  private readonly homologaciones = computed(() => (this.listado.hasValue() ? (this.listado.value()?.data ?? []) : []));

  private readonly productosRecurso = this.catalogos.productosSegunActividad(this.actividad);

  private readonly listaActividades = computed(() => {
    const recurso = this.catalogos.actividades;
    return sinRepetidos(recurso.hasValue() ? recurso.value().data : [], (a) => a.codigoCaeb);
  });

  private readonly listaProductos = computed(() => {
    const recurso = this.productosRecurso;
    return sinRepetidos(recurso.hasValue() ? recurso.value().data : [], (p) => String(p.codigoProducto));
  });

  readonly actividades = computed<GmOpcionLista[]>(() =>
    this.listaActividades().map((a) => ({ valor: a.codigoCaeb, etiqueta: a.descripcion })),
  );

  readonly productosSin = computed<GmOpcionLista[]>(() =>
    this.listaProductos().map((p) => ({
      valor: String(p.codigoProducto),
      etiqueta: p.descripcionProducto,
    })),
  );

  readonly cargandoActividades = computed(() => this.catalogos.actividades.isLoading());
  readonly cargandoProductos = computed(() => this.productosRecurso.isLoading());
  readonly errorCatalogo = computed(() =>
    this.catalogos.actividades.error() || this.productosRecurso.error()
      ? 'No se pudo cargar el catálogo del SIN. Cierra el modal e intenta de nuevo.'
      : null,
  );

  readonly rutanavegacion = computed<GmRutaNavegacion[]>(() => [
    { etiqueta: 'Sistemas Facturadores', enlace: '/sistemas-facturadores' },
    { etiqueta: `Homologación de productos de ${this.sistema()?.codigo ?? 'sistema'}` },
  ]);

  readonly filtrados = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return this.homologaciones();
    return this.homologaciones().filter((homologacion) =>
      [
        homologacion.codigo,
        homologacion.descripcion,
        homologacion.codigoActividadSin,
        homologacion.descripcionActividadSin,
        homologacion.codigoProductoServicioSin,
        homologacion.descripcionProductoSin,
      ]
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  });

  readonly vacio = computed(() => {
    if (this.listado.isLoading()) return 'Cargando homologaciones...';
    if (this.listado.error()) return 'No se pudieron cargar las homologaciones de productos.';
    if (this.listado.hasValue() && !this.listado.value()?.exito) {
      return this.listado.value()?.mensaje || 'No se pudieron cargar las homologaciones de productos.';
    }
    return this.query() ? 'No hay resultados para la búsqueda.' : 'Este sistema todavía no tiene productos homologados.';
  });

  abrir(homologacion?: Homologacion): void {
    this.codigoEntel.set(homologacion?.codigo ?? '');
    this.productoEntel.set(homologacion?.descripcion ?? '');
    this.actividad.set(homologacion?.codigoActividadSin ?? '');
    this.productoSin.set(homologacion?.codigoProductoServicioSin ?? '');
    this.error.set(null);
    if (this.catalogos.actividades.error()) this.catalogos.actividades.reload();
    this.editando.set(homologacion ? String(homologacion.idHomologacionProducto) : '');
  }

  elegirActividad(codigo: string): void {
    this.actividad.set(codigo);
    this.productoSin.set('');
  }

  async guardar(event: Event): Promise<void> {
    event.preventDefault();
    const id = this.editando();
    const sistema = this.sistema();
    if (id === null || !sistema || this.guardando()) return;

    const codigo = this.codigoEntel().trim();
    const descripcion = this.productoEntel().trim();
    const actividad = this.listaActividades().find((a) => a.codigoCaeb === this.actividad());
    const producto = this.listaProductos().find((p) => String(p.codigoProducto) === this.productoSin());
    if (!codigo || !descripcion || !actividad || !producto) {
      this.error.set('Completa todos los campos de la homologación.');
      return;
    }

    const datos = {
      idSistema: sistema.idSistema,
      codigo,
      descripcion,
      idActividadSin: actividad.idActividades,
      idProductoServicioSin: producto.idProductosServicios,
    };

    this.error.set(null);
    this.guardando.set(true);
    const error = id
      ? await this.api.actualizar({ ...datos, idHomologacionProducto: Number(id) })
      : await this.api.crear(datos);
    this.guardando.set(false);
    if (error) {
      this.error.set(error);
      return;
    }
    this.listado.reload();
    this.toast.mostrar(id ? 'Homologación actualizada.' : 'Homologación creada.');
    this.editando.set(null);
  }

  async eliminar(homologacion: Homologacion): Promise<void> {
    const si = await this.confirmar.preguntar({
      titulo: 'Eliminar homologación',
      mensaje: `¿Está seguro de que desea eliminar ${homologacion.descripcion}?`,
      aceptar: 'Eliminar',
      peligro: true,
    });
    if (!si) return;
    const error = await this.api.eliminar(homologacion.idHomologacionProducto);
    if (!error) this.listado.reload();
    this.toast.mostrar(error ?? 'Homologación eliminada.');
  }
}
