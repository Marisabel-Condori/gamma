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
import { CatalogoUnidadesMedidaService } from '../../data/catalogo-unidades-medida.service';
import { SistemasService } from '../../data/sistemas.service';
import { HomologacionUnidadMedida } from './data/unidades-medida.model';
import { UnidadesMedidaService } from './data/unidades-medida.service';

type Homologacion = HomologacionUnidadMedida;

const COLUMNAS: GmColumna<Homologacion>[] = [
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
    id: 'unidadEntel',
    titulo: 'Unidad de medida',
    grupo: 'ENTEL',
    destacar: true,
    movil: 'titulo',
    valorMovil: (homologacion) => oracion(homologacion.unidadEntel),
  },
  { id: 'codigoSin', titulo: 'Código', grupo: 'SIN', ancho: '140px', etiquetaMovil: 'Código SIN' },
  {
    id: 'unidadSin',
    titulo: 'Unidad de medida',
    grupo: 'SIN',
    movil: 'titulo',
    valorMovil: (homologacion) => oracion(homologacion.unidadSin),
  },
  { id: 'acciones', titulo: 'Acciones', ancho: '120px', movil: 'pie-fin' },
];

@Component({
  selector: 'gm-unidades-medida-page',
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
  templateUrl: './unidades-medida.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'gm-pagina' },
})
export class UnidadesMedidaPage {
  private readonly sistemas = inject(SistemasService);
  private readonly datos = inject(UnidadesMedidaService);
  private readonly catalogo = inject(CatalogoUnidadesMedidaService);
  private readonly toast = inject(Toast);
  private readonly confirmar = inject(Confirmar);

  readonly sistemaId = input.required<string>();

  readonly columnas = COLUMNAS;
  readonly query = signal('');

  readonly editando = signal<string | null>(null);
  readonly codigoEntel = signal('');
  readonly unidadEntel = signal('');
  readonly unidadSin = signal('');
  readonly error = signal<string | null>(null);

  private readonly listaUnidades = computed(() => {
    const recurso = this.catalogo.unidades;
    return sinRepetidos(recurso.hasValue() ? recurso.value().data : [], (u) => String(u.codigoClasificador));
  });

  readonly unidadesSin = computed<GmOpcionLista[]>(() =>
    this.listaUnidades().map((u) => ({ valor: String(u.codigoClasificador), etiqueta: u.descripcion })),
  );

  readonly cargandoUnidades = computed(() => this.catalogo.unidades.isLoading());
  readonly errorCatalogo = computed(() =>
    this.catalogo.unidades.error() ? 'No se pudo cargar el catálogo del SIN. Cierra el modal e intenta de nuevo.' : null,
  );

  readonly sistema = computed(() => this.sistemas.sistemas().find((s) => s.id === this.sistemaId()) ?? null);

  readonly migas = computed<GmMiga[]>(() => [
    { etiqueta: 'Sistemas Facturadores', enlace: '/sistemas-facturadores' },
    { etiqueta: `Homologación de unidades de medida de ${this.sistema()?.codigo ?? 'sistema'}` },
  ]);

  readonly filtrados = computed(() => {
    const q = this.query().trim().toLowerCase();
    return this.datos
      .homologaciones()
      .filter((homologacion) => homologacion.sistemaId === this.sistemaId())
      .filter(
        (homologacion) =>
          !q ||
          [homologacion.codigoEntel, homologacion.unidadEntel, homologacion.codigoSin, homologacion.unidadSin]
            .join(' ')
            .toLowerCase()
            .includes(q),
      );
  });

  readonly vacio = computed(() =>
    this.query() ? 'No hay resultados para la búsqueda.' : 'Este sistema todavía no tiene unidades de medida homologadas.',
  );

  abrir(homologacion?: Homologacion): void {
    this.codigoEntel.set(homologacion?.codigoEntel ?? '');
    this.unidadEntel.set(homologacion?.unidadEntel ?? '');
    this.unidadSin.set(homologacion?.codigoSin ?? '');
    this.error.set(null);
    if (this.catalogo.unidades.error()) this.catalogo.unidades.reload();
    this.editando.set(homologacion?.id ?? '');
  }

  guardar(event: Event): void {
    event.preventDefault();
    const id = this.editando();
    if (id === null) return;

    const unidad = this.listaUnidades().find((u) => String(u.codigoClasificador) === this.unidadSin());
    if (!this.codigoEntel().trim() || !this.unidadEntel().trim() || !unidad) {
      this.error.set('Completa todos los campos de la homologación.');
      return;
    }

    const anterior = this.datos.homologaciones().find((homologacion) => homologacion.id === id);
    const { fecha, hora } = anterior ?? ahora();
    const payload = {
      sistemaId: this.sistemaId(),
      fecha,
      hora,
      codigoEntel: this.codigoEntel(),
      unidadEntel: this.unidadEntel(),
      codigoSin: String(unidad.codigoClasificador),
      unidadSin: unidad.descripcion,
    };
    const error = id ? this.datos.actualizar(id, payload) : this.datos.crear(payload);
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
      mensaje: `¿Está seguro de que desea eliminar ${homologacion.unidadEntel}?`,
      aceptar: 'Eliminar',
      peligro: true,
    });
    if (!si) return;
    this.datos.eliminar(homologacion.id);
    this.toast.mostrar('Homologación eliminada.');
  }
}
