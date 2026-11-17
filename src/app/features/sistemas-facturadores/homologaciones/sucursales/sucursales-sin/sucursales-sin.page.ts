import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import {
  Confirmar,
  GmAccionesFila,
  GmBoton,
  GmBuscar,
  GmCelda,
  GmColumna,
  GmEncabezado,
  GmRutaNavegacion,
  GmModal,
  GmTabla,
  Toast,
} from '../../../../../shared/ui';
import { SistemasService } from '../../../data/sistemas.service';
import { HomologacionSucursal } from '../data/sucursales.model';
import { SucursalesService } from '../data/sucursales.service';
import { SucursalApiResponse, VortexApiService } from '../data/vortex-api.service';

interface SucursalSin extends HomologacionSucursal {
  fechaAlta: string;
  direccion: string;
  municipio: string;
  departamento: string;
  observacion: string;
}

const COLUMNAS: GmColumna<SucursalSin>[] = [
  { id: 'fechaAlta', titulo: 'Fecha de alta', ancho: '190px', movil: 'pie', valor: (s) => formatearFechaAlta(s.fechaAlta) },
  { id: 'codigo', titulo: 'Código sucursal SIN', ancho: '160px', destacar: true, movil: 'titulo', etiquetaMovil: 'Código SIN' },
  { id: 'descripcion', titulo: 'Descripción', movil: 'subtitulo' },
  { id: 'asignacion', titulo: 'Asignación puntos de venta', ancho: '220px', alinear: 'centro', movil: 'pie' },
  { id: 'acciones', titulo: 'Acciones', ancho: '120px', movil: 'pie-fin' },
];

@Component({
  selector: 'gm-sucursales-sin-page',
  imports: [RouterLink, GmEncabezado, GmBuscar, GmBoton, GmTabla, GmCelda, GmAccionesFila, GmModal],
  templateUrl: './sucursales-sin.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'gm-pagina' },
})
export class SucursalesSinPage implements OnInit {
  private readonly sistemas = inject(SistemasService);
  private readonly vortex = inject(VortexApiService);
  private readonly datos = inject(SucursalesService);
  private readonly toast = inject(Toast);
  private readonly confirmar = inject(Confirmar);

  readonly sistemaId = input.required<string>();
  readonly columnas = COLUMNAS;
  readonly sucursales = signal<SucursalSin[]>([]);
  readonly cargando = signal(true);
  readonly query = signal('');
  readonly editando = signal<string | null>(null);
  readonly form = signal({ codigo: '', descripcion: '', municipio: '', departamento: '', observacion: '' });
  readonly error = signal<string | null>(null);
  readonly sistema = computed(() => this.sistemas.sistemas().find((s) => s.id === this.sistemaId()) ?? null);
  readonly migas = computed<GmRutaNavegacion[]>(() => [
    { etiqueta: 'Sistemas Facturadores', enlace: '/sistemas-facturadores' },
    { etiqueta: `Puntos de venta de ${this.sistema()?.codigo ?? 'sistema'}` },
  ]);
  readonly filtradas = computed(() => {
    const q = this.query().trim().toLowerCase();
    return this.sucursales()
      .filter((s) => !q || `${s.codigo} ${s.descripcion}`.toLowerCase().includes(q));
  });
  readonly vacio = computed(() => this.cargando() ? 'Cargando sucursales…' : this.query().trim()
    ? 'No hay sucursales que coincidan con la búsqueda.'
    : 'El servicio no devolvió sucursales SIN.');

  puntos(sucursal: SucursalSin): string {
    const total = this.datos.puntosDe(sucursal.id).length;
    return `${total} ${total === 1 ? 'punto de venta' : 'puntos de venta'}`;
  }

  abrir(sucursal?: SucursalSin): void {
    this.form.set({
      codigo: sucursal?.codigo ?? '',
      descripcion: sucursal?.direccion ?? sucursal?.descripcion ?? '',
      municipio: sucursal?.municipio ?? '',
      departamento: sucursal?.departamento ?? '',
      observacion: sucursal?.observacion ?? '',
    });
    this.error.set(null);
    this.editando.set(sucursal?.id ?? '');
  }

  campo(nombre: 'codigo' | 'descripcion' | 'municipio' | 'departamento' | 'observacion', valor: string): void {
    this.form.update((actual) => ({ ...actual, [nombre]: valor }));
  }

  guardar(event: Event): void {
    event.preventDefault();
    const id = this.editando();
    if (id === null) return;
    const form = this.form();
    if (id) {
      const actual = this.sucursales().find((s) => s.id === id);
      if (!actual) return;
      this.error.set(null);
      this.vortex.actualizarSucursal(Number(actual.codigo), {
        direccion: form.descripcion.trim(),
        municipio: form.municipio.trim(),
        departamento: form.departamento.trim(),
        observacion: form.observacion.trim(),
      }).subscribe({
        next: () => {
          const descripcion = [form.descripcion, form.departamento].map((v) => v.trim()).filter(Boolean).join(' ');
          this.sucursales.update((lista) => lista.map((s) => s.id === id
            ? { ...s, direccion: form.descripcion.trim(), municipio: form.municipio.trim(),
              departamento: form.departamento.trim(), observacion: form.observacion.trim(), descripcion }
            : s));
          this.datos.actualizar(id, { codigo: actual.codigo, descripcion, sistemaId: this.sistemaId() });
          this.toast.mostrar('Sucursal SIN actualizada.');
          this.editando.set(null);
        },
        error: (error: HttpErrorResponse) => this.error.set(mensajeErrorApi(error, 'No se pudo actualizar la sucursal SIN.')),
      });
      return;
    }

    const localData = { codigo: form.codigo, descripcion: form.descripcion, sistemaId: this.sistemaId() };
    const error = this.datos.crear(localData);
    if (error) {
      this.error.set(error);
      return;
    }
    const creada = this.datos.sucursales().find((s) => s.sistemaId === localData.sistemaId && s.codigo === form.codigo.trim());
    if (creada) this.sucursales.update((lista) => [...lista, {
      ...creada, fechaAlta: '', direccion: form.descripcion, municipio: '', departamento: '', observacion: '',
    }]);
    this.toast.mostrar('Punto de venta creado.');
    this.editando.set(null);
  }

  async eliminar(sucursal: SucursalSin): Promise<void> {
    const si = await this.confirmar.preguntar({
      titulo: 'Eliminar punto de venta',
      mensaje: `¿Está seguro de que desea eliminar el punto de venta ${sucursal.codigo}?`,
      aceptar: 'Eliminar',
      peligro: true,
    });
    if (!si) return;
    this.vortex.eliminarSucursal(Number(sucursal.codigo)).subscribe({
      next: () => {
        this.datos.eliminar(sucursal.id);
        this.sucursales.update((lista) => lista.filter((item) => item.id !== sucursal.id));
        this.toast.mostrar(`Punto de venta ${sucursal.codigo} eliminado.`);
      },
      error: (error: HttpErrorResponse) => this.error.set(mensajeErrorApi(error, 'No se pudo eliminar la sucursal SIN.')),
    });
  }

  ngOnInit(): void {
    this.vortex.listarSucursales<SucursalApiResponse[]>().pipe(
      catchError((error: HttpErrorResponse) => {
        this.error.set(mensajeErrorApi(error, 'No se pudieron cargar las sucursales SIN.'));
        return of([] as SucursalApiResponse[]);
      }),
    ).subscribe((respuesta) => {
      this.sucursales.set(respuesta.map((sucursal) => ({
        id: this.datos.sucursales().find((local) =>
          local.sistemaId === this.sistemaId() && local.codigo === String(sucursal.codSucursalSin),
        )?.id ?? `${this.sistemaId()}-sin-${sucursal.codSucursalSin}`,
        sistemaId: this.sistemaId(),
        fechaAlta: sucursal.fechaAlta ?? '',
        codigo: String(sucursal.codSucursalSin),
        descripcion: [sucursal.direccion, sucursal.departamento].map((v) => v?.trim()).filter(Boolean).join(' '),
        direccion: sucursal.direccion ?? '',
        municipio: sucursal.municipio ?? '',
        departamento: sucursal.departamento ?? '',
        observacion: sucursal.observacion ?? '',
      })));
      this.cargando.set(false);
    });
  }
}

function formatearFechaAlta(valor: string): string {
  if (!valor) return '';
  const fecha = valor.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/);
  if (fecha) {
    const dia = `${fecha[3]}/${fecha[2]}/${fecha[1]}`;
    return fecha[4] ? `${dia} · ${fecha[4]}:${fecha[5]}:${fecha[6] ?? '00'}` : dia;
  }
  return valor;
}

function mensajeErrorApi(error: HttpErrorResponse, predeterminado: string): string {
  return error.status === 0 ? 'No se pudo conectar con el servicio de sucursales SIN.'
    : error.error?.mensaje || error.error?.message || `${predeterminado} (HTTP ${error.status}).`;
}
