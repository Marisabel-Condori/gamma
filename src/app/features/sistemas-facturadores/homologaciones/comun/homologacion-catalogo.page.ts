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
  GmMiga,
  GmModal,
  GmOpcionLista,
  GmSeccion,
  GmTabla,
  GmTexto,
  Toast,
} from '../../../../shared/ui';
import { ahora } from '../../../../shared/utils/fechas';
import { sinRepetidos } from '../../../../shared/utils/listas';
import { oracion } from '../../../../shared/utils/texto';
import { CatalogoSinService } from '../../data/catalogo-sin.service';
import { SistemasService } from '../../data/sistemas.service';
import { ConfigHomologacion, HomologacionCatalogo } from './homologacion-catalogo.model';
import { HomologacionCatalogoService } from './homologacion-catalogo.service';

type Homologacion = HomologacionCatalogo;

function columnas(concepto: string): GmColumna<Homologacion>[] {
  return [
    {
      id: 'fecha',
      titulo: 'Fecha',
      valor: (homologacion) => `${homologacion.fecha} · ${homologacion.hora}`,
      sinSalto: true,
      movil: 'pie',
      etiquetaMovil: 'Homologado',
    },
    { id: 'codigoEntel', titulo: 'Código', grupo: 'ENTEL', ancho: '140px', etiquetaMovil: 'Código ENTEL' },
    {
      id: 'descripcionEntel',
      titulo: concepto,
      grupo: 'ENTEL',
      destacar: true,
      movil: 'titulo',
      valorMovil: (homologacion) => oracion(homologacion.descripcionEntel),
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
  private readonly datos = inject(HomologacionCatalogoService);
  private readonly toast = inject(Toast);
  private readonly confirmar = inject(Confirmar);

  readonly config: ConfigHomologacion = inject(ActivatedRoute).snapshot.data['config'];
  readonly sistemaId = input.required<string>();

  readonly columnas = columnas(this.config.concepto);
  private readonly homologaciones = this.datos.lista(this.config);
  private readonly catalogo = inject(CatalogoSinService).clasificador(this.config.endpointCatalogo);

  readonly query = signal('');

  // ── Formulario del modal ──
  readonly editando = signal<string | null>(null);
  readonly codigoEntel = signal('');
  readonly descripcionEntel = signal('');
  readonly codigoSin = signal('');
  readonly error = signal<string | null>(null);

  // ── Catálogo del SIN ──
  private readonly listaCatalogo = computed(() =>
    sinRepetidos(this.catalogo.hasValue() ? (this.catalogo.value()?.data ?? []) : [], (c) => String(c.codigoClasificador)),
  );

  readonly opcionesSin = computed<GmOpcionLista[]>(() =>
    this.listaCatalogo().map((c) => ({ valor: String(c.codigoClasificador), etiqueta: c.descripcion })),
  );

  readonly cargandoCatalogo = computed(() => this.catalogo.isLoading());
  readonly errorCatalogo = computed(() =>
    this.catalogo.error() ? 'No se pudo cargar el catálogo del SIN. Cierra el modal e intenta de nuevo.' : null,
  );

  readonly sistema = computed(() => this.sistemas.sistemas().find((s) => s.id === this.sistemaId()) ?? null);

  readonly migas = computed<GmMiga[]>(() => [
    { etiqueta: 'Sistemas Facturadores', enlace: '/sistemas-facturadores' },
    { etiqueta: `Homologación de ${this.config.conceptoPlural} de ${this.sistema()?.codigo ?? 'sistema'}` },
  ]);

  readonly filtrados = computed(() => {
    const q = this.query().trim().toLowerCase();
    return this.homologaciones()
      .filter((homologacion) => homologacion.sistemaId === this.sistemaId())
      .filter(
        (homologacion) =>
          !q ||
          [homologacion.codigoEntel, homologacion.descripcionEntel, homologacion.codigoSin, homologacion.descripcionSin]
            .join(' ')
            .toLowerCase()
            .includes(q),
      );
  });

  readonly vacio = computed(() => (this.query() ? 'No hay resultados para la búsqueda.' : this.config.vacio));

  abrir(homologacion?: Homologacion): void {
    this.codigoEntel.set(homologacion?.codigoEntel ?? '');
    this.descripcionEntel.set(homologacion?.descripcionEntel ?? '');
    this.codigoSin.set(homologacion?.codigoSin ?? '');
    this.error.set(null);
    if (this.catalogo.error()) this.catalogo.reload();
    this.editando.set(homologacion?.id ?? '');
  }

  guardar(event: Event): void {
    event.preventDefault();
    const id = this.editando();
    if (id === null) return;

    const elegido = this.listaCatalogo().find((c) => String(c.codigoClasificador) === this.codigoSin());
    if (!this.codigoEntel().trim() || !this.descripcionEntel().trim() || !elegido) {
      this.error.set('Completa todos los campos de la homologación.');
      return;
    }

    const anterior = this.homologaciones().find((homologacion) => homologacion.id === id);
    const { fecha, hora } = anterior ?? ahora();
    const payload = {
      sistemaId: this.sistemaId(),
      fecha,
      hora,
      codigoEntel: this.codigoEntel(),
      descripcionEntel: this.descripcionEntel(),
      codigoSin: String(elegido.codigoClasificador),
      descripcionSin: elegido.descripcion,
    };
    const error = id
      ? this.datos.actualizar(this.config, id, payload)
      : this.datos.crear(this.config, payload);
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
      mensaje: `¿Está seguro de que desea eliminar ${homologacion.descripcionEntel}?`,
      aceptar: 'Eliminar',
      peligro: true,
    });
    if (!si) return;
    this.datos.eliminar(this.config, homologacion.id);
    this.toast.mostrar('Homologación eliminada.');
  }
}
