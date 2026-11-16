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
import { SucursalesService } from './data/sucursales.service';

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
  codigoPuntoVentaSin: '',
  puntoVentaSin: '',
};

@Component({
  selector: 'gm-sucursales-homologadas-page',
  imports: [RouterLink, GmEncabezado, GmBuscar, GmBoton, GmTabla, GmCelda, GmAccionesFila, GmModal],
  templateUrl: './sucursales-homologadas.page.html',
  styleUrl: './sucursales-homologadas.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'gm-pagina' },
})
export class SucursalesHomologadasPage {
  private readonly sistemas = inject(SistemasService);
  private readonly toast = inject(Toast);
  private readonly confirmar = inject(Confirmar);
  private readonly sucursales = inject(SucursalesService);

  readonly sistemaId = input.required<string>();
  readonly columnas = COLUMNAS;
  readonly query = signal('');
  readonly filas = signal(crearHomologacionesMulticentros());
  readonly editando = signal<string | null>(null);
  readonly form = signal<Formulario>({ ...FORM_VACIO });
  readonly error = signal<string | null>(null);
  readonly busquedaSucursal = signal('');
  readonly busquedaPunto = signal('');
  readonly sucursalesAbiertas = signal(false);
  readonly puntosAbiertos = signal(false);
  readonly sucursalesDisponibles = computed(() => this.sucursales.sucursales());
  readonly sucursalesFiltradas = computed(() => {
    const q = this.busquedaSucursal().trim().toLowerCase();
    return this.sucursalesDisponibles().filter((sucursal) =>
      !q || `${sucursal.codigo} ${sucursal.descripcion}`.toLowerCase().includes(q),
    );
  });
  readonly puntosDisponibles = computed(() => {
    const codigo = this.form().codigoSucursalSin;
    const sucursal = this.sucursalesDisponibles().find((item) => item.codigo === codigo);
    return sucursal ? this.sucursales.puntosDe(sucursal.id) : [];
  });
  readonly puntosFiltrados = computed(() => {
    const q = this.busquedaPunto().trim().toLowerCase();
    return this.puntosDisponibles().filter((punto) => `${punto.codigo} ${punto.descripcion}`.toLowerCase().includes(q));
  });

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
    const datos = row ? this.aFormulario(row) : { ...FORM_VACIO, fecha: this.fechaActual() };
    this.form.set(datos);
    const sucursal = this.sucursalesDisponibles().find((item) => item.codigo === datos.codigoSucursalSin);
    this.busquedaSucursal.set(sucursal ? `${sucursal.codigo} — ${sucursal.descripcion}` : '');
    this.busquedaPunto.set(datos.codigoPuntoVentaSin ? `${datos.codigoPuntoVentaSin} — ${datos.puntoVentaSin}` : '');
    this.sucursalesAbiertas.set(false);
    this.puntosAbiertos.set(false);
    this.error.set(null);
    this.editando.set(row?.id ?? '');
  }

  enfocarSucursal(): void {
    this.sucursalesAbiertas.set(true);
  }

  buscarSucursal(event: Event): void {
    const texto = (event.target as HTMLInputElement).value;
    this.busquedaSucursal.set(texto);
    this.sucursalesAbiertas.set(true);
    this.busquedaPunto.set('');
    this.puntosAbiertos.set(false);
    this.form.update((actual) => ({ ...actual, codigoSucursalSin: '', descripcionSin: '', codigoPuntoVentaSin: '', puntoVentaSin: '' }));
  }

  enfocarPunto(): void {
    if (this.form().codigoSucursalSin) this.puntosAbiertos.set(true);
  }

  buscarPunto(event: Event): void {
    const texto = (event.target as HTMLInputElement).value;
    this.busquedaPunto.set(texto);
    this.puntosAbiertos.set(true);
    this.form.update((actual) => ({ ...actual, codigoPuntoVentaSin: '', puntoVentaSin: '' }));
  }

  seleccionarSucursal(codigo: string): void {
    const sucursal = this.sucursalesDisponibles().find((item) => item.codigo === codigo);
    const punto = sucursal ? this.sucursales.puntosDe(sucursal.id)[0] : null;
    this.form.update((actual) => ({
      ...actual,
      codigoSucursalSin: sucursal?.codigo ?? '',
      descripcionSin: sucursal?.descripcion ?? '',
      codigoPuntoVentaSin: punto?.codigo ?? (sucursal ? '0' : ''),
      puntoVentaSin: punto?.descripcion ?? (sucursal ? 'punto de venta default' : ''),
    }));
    this.busquedaSucursal.set(sucursal ? `${sucursal.codigo} — ${sucursal.descripcion}` : '');
    this.busquedaPunto.set(punto ? `${punto.codigo} — ${punto.descripcion}` : sucursal ? '0 — punto de venta default' : '');
    this.sucursalesAbiertas.set(false);
    this.puntosAbiertos.set(false);
  }

  seleccionarPuntoVenta(codigo: string): void {
    const punto = this.puntosDisponibles().find((item) => item.codigo === codigo);
    this.form.update((actual) => ({
      ...actual,
      codigoPuntoVentaSin: punto?.codigo ?? (codigo === '0' ? '0' : ''),
      puntoVentaSin: punto?.descripcion ?? (codigo === '0' ? 'punto de venta default' : ''),
    }));
    this.busquedaPunto.set(punto ? `${punto.codigo} — ${punto.descripcion}` : codigo === '0' ? '0 — punto de venta default' : '');
    this.puntosAbiertos.set(false);
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
