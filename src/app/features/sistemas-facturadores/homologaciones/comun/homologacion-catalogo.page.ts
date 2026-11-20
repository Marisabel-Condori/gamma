import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
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
import { cambiaFormatoFecha } from '../../../../shared/utils/fechas';
import { oracion } from '../../../../shared/utils/texto';
import { CatalogoSinService } from '../../data/catalogo-sin.service';
import { SistemasService } from '../../data/sistemas.service';
import { ConfigHomologacion, HomologacionCatalogoResponse } from './homologacion-catalogo.model';
import { HomologacionCatalogoService } from './homologacion-catalogo.service';

type Homologacion = HomologacionCatalogoResponse;

function columnas(concepto: string): GmColumna<Homologacion>[] {
  return [
    {
      id: 'fechaAlta',
      titulo: 'Fecha',
      valor: (homologacion) => cambiaFormatoFecha(homologacion.fechaAlta),
      sinSalto: true,
      movil: 'pie',
      etiquetaMovil: 'Homologado',
    },
    { id: 'codigo', titulo: 'Código', grupo: 'ENTEL', ancho: '140px', etiquetaMovil: 'Código ENTEL' },
    {
      id: 'descripcion',
      titulo: concepto,
      grupo: 'ENTEL',
      destacar: true,
      movil: 'titulo',
      valorMovil: (homologacion) => oracion(homologacion.descripcion),
    },
    { id: 'codigoSin', titulo: 'Código', grupo: 'SIN', ancho: '140px', etiquetaMovil: 'Código SIN' },
    {
      id: 'descripcionSin',
      titulo: concepto,
      grupo: 'SIN',
      movil: 'titulo',
      valorMovil: (homologacion) => oracion(homologacion.descripcionSin),
    },
    { id: 'acciones', titulo: 'Acciones', ancho: '120px', movil: 'pie-fin' },
  ];
}

@Component({
  selector: 'gm-homologacion-catalogo-page',
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
  templateUrl: './homologacion-catalogo.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'gm-pagina' },
})
export class HomologacionCatalogoPage {
  private readonly sistemas = inject(SistemasService);
  private readonly api = inject(HomologacionCatalogoService);
  private readonly toast = inject(Toast);
  private readonly confirmar = inject(Confirmar);

  readonly config: ConfigHomologacion = inject(ActivatedRoute).snapshot.data['config'];
  readonly sistemaId = input.required<string>();

  readonly columnas = columnas(this.config.concepto);
  private readonly catalogo = inject(CatalogoSinService).clasificador(this.config.endpoint);

  readonly query = signal('');

  /** null = modal cerrado; '' = crear; id = editar. */
  readonly editando = signal<string | null>(null);
  readonly codigoEntel = signal('');
  readonly descripcionEntel = signal('');
  readonly idSin = signal('');
  readonly error = signal<string | null>(null);
  readonly guardando = signal(false);

  readonly sistema = computed(
    () => this.sistemas.sistemas().find((s) => String(s.idSistema) === this.sistemaId()) ?? null,
  );

  private readonly listado = this.api.listar(this.config, () => this.sistema()?.idSistema);
  private readonly homologaciones = computed(() => (this.listado.hasValue() ? (this.listado.value()?.data ?? []) : []));

  private readonly listaCatalogo = computed(() => (this.catalogo.hasValue() ? (this.catalogo.value()?.data ?? []) : []));

  readonly opcionesSin = computed<GmOpcionLista[]>(() =>
    this.listaCatalogo().map((c) => ({ valor: String(c[this.config.campoId]), etiqueta: c.descripcion })),
  );

  readonly cargandoCatalogo = computed(() => this.catalogo.isLoading());
  readonly errorCatalogo = computed(() =>
    this.catalogo.error() ? 'No se pudo cargar el catálogo del SIN. Cierra el modal e intenta de nuevo.' : null,
  );

  readonly rutanavegacion = computed<GmRutaNavegacion[]>(() => [
    { etiqueta: 'Sistemas Facturadores', enlace: '/sistemas-facturadores' },
    { etiqueta: `Homologación de ${this.config.conceptoPlural} de ${this.sistema()?.codigo ?? 'sistema'}` },
  ]);

  readonly filtrados = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return this.homologaciones();
    return this.homologaciones().filter((homologacion) =>
      [homologacion.codigo, homologacion.descripcion, homologacion.codigoSin, homologacion.descripcionSin]
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  });

  readonly vacio = computed(() => {
    if (this.listado.isLoading()) return 'Cargando homologaciones...';
    if (this.listado.error()) return 'No se pudieron cargar las homologaciones.';
    if (this.listado.hasValue() && !this.listado.value()?.exito) {
      return this.listado.value()?.mensaje || 'No se pudieron cargar las homologaciones.';
    }
    return this.query() ? 'No hay resultados para la búsqueda.' : this.config.vacio;
  });

  abrir(homologacion?: Homologacion): void {
    this.codigoEntel.set(homologacion?.codigo ?? '');
    this.descripcionEntel.set(homologacion?.descripcion ?? '');
    this.idSin.set(homologacion ? String(homologacion.idSin) : '');
    this.error.set(null);
    if (this.catalogo.error()) this.catalogo.reload();
    this.editando.set(homologacion ? String(homologacion.idHomologacion) : '');
  }

  async guardar(event: Event): Promise<void> {
    event.preventDefault();
    const id = this.editando();
    const sistema = this.sistema();
    if (id === null || !sistema || this.guardando()) return;

    const codigo = this.codigoEntel().trim();
    const descripcion = this.descripcionEntel().trim();
    const elegido = this.listaCatalogo().find((c) => String(c[this.config.campoId]) === this.idSin());
    if (!codigo || !descripcion || !elegido) {
      this.error.set('Completa todos los campos de la homologación.');
      return;
    }

    const datos = { idSistema: sistema.idSistema, codigo, descripcion, idSin: Number(elegido[this.config.campoId]) };

    this.error.set(null);
    this.guardando.set(true);
    const error = id
      ? await this.api.actualizar(this.config, { ...datos, idHomologacion: Number(id) })
      : await this.api.crear(this.config, datos);
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
    const error = await this.api.eliminar(this.config, homologacion.idHomologacion);
    if (!error) this.listado.reload();
    this.toast.mostrar(error ?? 'Homologación eliminada.');
  }
}
