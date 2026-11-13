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
import { crearHomologacionesMulticentros } from './data/sucursales.mock';
import { HomologacionMulticentro } from './data/sucursales.models';

const COLUMNAS: GmColumna<HomologacionMulticentro>[] = [
  { id: 'fecha', titulo: 'Fecha homologación', ancho: '155px', sinSalto: true, movil: 'pie', etiquetaMovil: 'Homologado' },
  { id: 'codigoEntel', titulo: 'Cod. sucursal', grupo: 'Sucursales ENTEL', ancho: '125px', etiquetaMovil: 'Código ENTEL' },
  { id: 'multicentroEntel', titulo: 'Descripción', grupo: 'Sucursales ENTEL', destacar: true, movil: 'titulo', etiquetaMovil: 'ENTEL' },
  { id: 'codigoSucursalSin', titulo: 'Cod. sucursal SIN', grupo: 'Sucursales SIN', ancho: '135px', etiquetaMovil: 'Código sucursal SIN' },
  { id: 'descripcionSin', titulo: 'Descripción SIN', grupo: 'Sucursales SIN', etiquetaMovil: 'Sucursal SIN' },
  { id: 'codigoPuntoVentaSin', titulo: 'Cod. punto venta SIN', grupo: 'Sucursales SIN', ancho: '145px', etiquetaMovil: 'Código punto de venta' },
  { id: 'puntoVentaSin', titulo: 'Punto venta SIN', grupo: 'Sucursales SIN', ancho: '180px', etiquetaMovil: 'Punto de venta SIN' },
  { id: 'acciones', titulo: 'Acciones', ancho: '120px', movil: 'pie-fin' },
];

type Formulario = Omit<HomologacionMulticentro, 'id' | 'sistemaId'>;
const FORM_VACIO: Formulario = {
  fecha: '',
  codigoEntel: '',
  multicentroEntel: '',
  codigoSucursalSin: '',
  descripcionSin: '',
  codigoPuntoVentaSin: '0',
  puntoVentaSin: 'punto de venta default',
};

@Component({
  selector: 'gm-sucursales-homologadas-page',
  imports: [RouterLink, GmEncabezado, GmBuscar, GmBoton, GmTabla, GmCelda, GmAccionesFila, GmModal],
  templateUrl: './sucursales-homologadas.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'gm-pagina' },
})
export class SucursalesHomologadasPage {
  private readonly sistemas = inject(SistemasService);
  private readonly toast = inject(Toast);
  private readonly confirmar = inject(Confirmar);

  readonly sistemaId = input.required<string>();
  readonly columnas = COLUMNAS;
  readonly query = signal('');
  readonly filas = signal(crearHomologacionesMulticentros());
  readonly editando = signal<string | null>(null);
  readonly form = signal<Formulario>({ ...FORM_VACIO });
  readonly error = signal<string | null>(null);

  readonly sistema = computed(() => this.sistemas.sistemas().find((s) => s.id === this.sistemaId()) ?? null);
  readonly migas = computed<GmMiga[]>(() => [
    { etiqueta: 'Sistemas Facturadores', enlace: '/sistemas-facturadores' },
    { etiqueta: `Multicentros de ${this.sistema()?.codigo ?? 'sistema'}` },
  ]);
  readonly filtradas = computed(() => {
    const q = this.query().trim().toLowerCase();
    return this.filas().filter((row) => row.sistemaId === this.sistemaId()).filter((row) =>
      !q || `${row.fecha} ${row.codigoEntel} ${row.multicentroEntel} ${row.codigoSucursalSin} ${row.descripcionSin} ${row.codigoPuntoVentaSin} ${row.puntoVentaSin}`.toLowerCase().includes(q),
    );
  });
  readonly vacio = computed(() =>
    this.query().trim() ? 'No hay resultados para la búsqueda.' : 'Este sistema todavía no tiene multicentros homologados.',
  );

  abrir(row?: HomologacionMulticentro): void {
    this.form.set(row ? this.aFormulario(row) : { ...FORM_VACIO, fecha: this.fechaActual() });
    this.error.set(null);
    this.editando.set(row?.id ?? '');
  }

  campo(nombre: keyof Formulario, valor: string): void {
    this.form.update((f) => ({ ...f, [nombre]: valor }));
  }

  guardar(event: Event): void {
    event.preventDefault();
    const id = this.editando();
    if (id === null) return;
    const datos = this.form();
    if (Object.values(datos).some((valor) => !valor.trim())) {
      this.error.set('Completa los datos de ambas sucursales y el punto de venta.');
      return;
    }
    if (id) {
      this.filas.update((rows) => rows.map((row) => row.id === id ? { ...row, ...datos } : row));
      this.toast.mostrar('Homologación actualizada.');
    } else {
      this.filas.update((rows) => [{ id: `ZSMART-multicentro-${Date.now()}`, sistemaId: this.sistemaId(), ...datos }, ...rows]);
      this.toast.mostrar('Homologación creada.');
    }
    this.editando.set(null);
  }

  async eliminar(row: HomologacionMulticentro): Promise<void> {
    const si = await this.confirmar.preguntar({
      titulo: 'Eliminar homologación',
      mensaje: `¿Está seguro de eliminar la homologación de ${row.multicentroEntel}?`,
      aceptar: 'Eliminar',
      peligro: true,
    });
    if (!si) return;
    this.filas.update((rows) => rows.filter((item) => item.id !== row.id));
    this.toast.mostrar('Homologación eliminada.');
  }

  private aFormulario(row: HomologacionMulticentro): Formulario {
    const { id: _id, sistemaId: _sistemaId, ...datos } = row;
    return datos;
  }

  private fechaActual(): string {
    return new Intl.DateTimeFormat('es-BO', { dateStyle: 'short', timeStyle: 'medium' }).format(new Date());
  }
}
