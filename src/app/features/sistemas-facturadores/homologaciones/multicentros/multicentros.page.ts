import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EMPTY, catchError, of } from 'rxjs';
import {
  Confirmar,
  GmAccionesFila,
  GmBoton,
  GmBuscar,
  GmCelda,
  GmColumna,
  GmEncabezado,
  GmLista,
  GmOpcionLista,
  GmRutaNavegacion,
  GmModal,
  GmSeccion,
  GmTabla,
  Toast,
} from '../../../../shared/ui';
import { SistemasService } from '../../data/sistemas.service';
import { HomologacionMulticentro, HomologacionSucursalApiResponse, HomologacionSucursalRequest, HomologacionSucursalUpdateRequest } from './data/multicentros.model';
import { PuntoVentaSucursalApiResponse, SucursalApiResponse } from '../../data/puntos-venta.model';
import { PuntosVentaService } from '../../data/puntos-venta.service';
import { SucursalesService } from '../../data/sucursales.service';
import { MulticentrosService } from './data/multicentros.service';

type Multicentro = HomologacionMulticentro;

// TODO: cambiar por usuario del login
const USUARIO = 'ADMIN';

const COLUMNAS: GmColumna<Multicentro>[] = [
  { id: 'fecha', titulo: 'Fecha Homologación', ancho: '190px', sinSalto: true, movil: 'pie', valor: (m) => formatearFecha(m.fecha) },
  { id: 'codigoEntel', titulo: 'Cod. Sucursal', grupo: 'SUCURSALES ENTEL', ancho: '130px', etiquetaMovil: 'Código ENTEL' },
  { id: 'multicentroEntel', titulo: 'Descripción', grupo: 'SUCURSALES ENTEL', destacar: true, movil: 'titulo' },
  { id: 'codigoSucursalSin', titulo: 'Cod. Sucursal SIN', grupo: 'SUCURSALES SIN', ancho: '140px', etiquetaMovil: 'Sucursal SIN' },
  { id: 'descripcionSin', titulo: 'Descripción SIN', grupo: 'SUCURSALES SIN', movil: 'subtitulo' },
  { id: 'codigoPuntoVentaSin', titulo: 'Cod. Punto Venta SIN', grupo: 'SUCURSALES SIN', ancho: '160px', etiquetaMovil: 'Punto de venta SIN' },
  { id: 'puntoVentaSin', titulo: 'Punto Venta SIN', grupo: 'SUCURSALES SIN' },
  { id: 'acciones', titulo: 'Acciones', ancho: '120px', movil: 'pie-fin' },
];

@Component({
  selector: 'gm-multicentros-page',
  imports: [RouterLink, GmEncabezado, GmBuscar, GmBoton, GmTabla, GmCelda, GmAccionesFila, GmModal, GmSeccion, GmLista],
  templateUrl: './multicentros.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'gm-pagina' },
})
export class MulticentrosPage implements OnInit {
  private readonly sistemas = inject(SistemasService);
  private readonly multicentrosApi = inject(MulticentrosService);
  private readonly puntosApi = inject(PuntosVentaService);
  private readonly sucursalesApi = inject(SucursalesService);
  private readonly toast = inject(Toast);
  private readonly confirmar = inject(Confirmar);

  readonly sistemaId = input.required<string>();
  readonly columnas = COLUMNAS;
  readonly query = signal('');
  readonly homologaciones = signal<Multicentro[]>([]);
  readonly editando = signal<string | null>(null);
  readonly formulario = signal({ codigoEntel: '', multicentroEntel: '', codigoSucursalSin: '', descripcionSin: '', codigoPuntoVentaSin: '', puntoVentaSin: '' });
  readonly fechaHomologacion = signal('');
  readonly fechaActual = signal('');
  readonly puntosVentaSin = signal<PuntoVentaSucursalApiResponse[]>([]);
  readonly sucursalesSin = signal<SucursalApiResponse[]>([]);
  readonly sucursalSeleccionada = signal<SucursalApiResponse | null>(null);
  readonly cargandoSucursales = signal(false);
  readonly cargandoPuntosVenta = signal(false);
  readonly guardando = signal(false);
  readonly error = signal('');

  readonly sistema = computed(() => this.sistemas.sistemas().find((s) => s.id === this.sistemaId()) ?? null);
  readonly fechaTexto = (valor: string): string => formatearFecha(valor);
  readonly multicentroEditando = computed(() => this.homologaciones().find((m) => m.id === this.editando()) ?? null);
  readonly opcionesSucursales = computed<GmOpcionLista[]>(() =>
    this.sucursalesSin().map((sucursal) => ({
      valor: String(sucursal.codSucursalSin),
      etiqueta: [sucursal.direccion, sucursal.departamento].map((valor) => valor?.trim()).filter(Boolean).join(' · ')
        || `Sucursal ${sucursal.codSucursalSin}`,
    })),
  );
  readonly opcionesPuntoVenta = computed<GmOpcionLista[]>(() =>
    this.puntosVentaSin().map((punto) => ({
      valor: String(punto.codigoPuntoVenta),
      etiqueta: `${punto.nombrePuntoVenta} · ${punto.tipoPuntoVenta}`,
    })),
  );

  readonly rutanavegacion = computed<GmRutaNavegacion[]>(() => [
    { etiqueta: 'Sistemas Facturadores', enlace: '/sistemas-facturadores' },
    { etiqueta: `Multicentro de ${this.sistema()?.codigo ?? 'sistema'}` },
  ]);

  readonly filtradas = computed(() => {
    const q = this.query().trim().toLowerCase();
    return this.homologaciones()
      .filter((m) => m.sistemaId === this.sistemaId())
      .filter((m) => !q || Object.values(m).join(' ').toLowerCase().includes(q));
  });

  readonly vacio = computed(() => this.query().trim()
    ? 'No hay resultados para la búsqueda.'
    : 'Todavía no hay multicentros homologados.');

  ngOnInit(): void {
    this.cargarHomologaciones();
  }

  private cargarHomologaciones(): void {
    const sistema = this.sistema();
    if (!sistema) {
      this.toast.mostrar('No se encontró el sistema facturador seleccionado.');
      return;
    }
    this.multicentrosApi.listar(sistema.idSistema).pipe(
      catchError((error: HttpErrorResponse) => {
        this.toast.mostrar(mensajeError(error, 'No se pudieron cargar las homologaciones.'));
        return of(null);
      }),
    ).subscribe((respuestas) => {
      if (!respuestas) return;
      const filas = respuestas
        .filter((respuesta) => respuesta.idSistema === sistema.idSistema)
        .map((respuesta) => convertirHomologacion(respuesta, sistema.id));
      this.homologaciones.set(filas);
    });
  }

  abrir(multicentro?: Multicentro): void {
    if (multicentro && !multicentro.idHomSucursal) {
      this.toast.mostrar('No se puede editar esta fila porque no tiene idHomSucursal. Recarga la página para traer el ID del backend.');
      return;
    }
    this.error.set('');
    this.sucursalesSin.set([]);
    this.puntosVentaSin.set([]);
    this.sucursalSeleccionada.set(null);
    const ahora = new Date();
    this.fechaHomologacion.set(ahora.toISOString());
    this.fechaActual.set(ahora.toLocaleDateString('es-BO'));
    this.editando.set(multicentro?.id ?? '');
    this.formulario.set({
      codigoEntel: multicentro?.codigoEntel ?? '',
      multicentroEntel: multicentro?.multicentroEntel ?? '',
      codigoSucursalSin: multicentro?.codigoSucursalSin ?? '',
      descripcionSin: multicentro?.descripcionSin ?? '',
      codigoPuntoVentaSin: multicentro?.codigoPuntoVentaSin ?? '',
      puntoVentaSin: multicentro?.puntoVentaSin ?? '',
    });

    this.cargandoSucursales.set(true);
    this.sucursalesApi.listar<SucursalApiResponse[]>().pipe(
      catchError((error: HttpErrorResponse) => {
        this.error.set(mensajeError(error, 'No se pudo cargar el listado de sucursales SIN.'));
        return of([] as SucursalApiResponse[]);
      }),
    ).subscribe((sucursales) => {
      this.sucursalesSin.set(sucursales);
      this.cargandoSucursales.set(false);
      if (multicentro) {
        const sucursal = sucursales.find((item) => String(item.codSucursalSin) === multicentro.codigoSucursalSin);
        if (sucursal) {
          this.sucursalSeleccionada.set(sucursal);
          this.cargarPuntosVenta(sucursal.codSucursalSin, multicentro.codigoPuntoVentaSin);
        }
      }
    });
  }

  actualizarCampoEntel(
    campo: 'codigoEntel' | 'multicentroEntel' | 'codigoSucursalSin' | 'descripcionSin' | 'codigoPuntoVentaSin' | 'puntoVentaSin',
    event: Event,
  ): void {
    const valor = (event.target as HTMLInputElement).value;
    this.formulario.update((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  }

  seleccionarSucursal(codigo: string): void {
    const sucursal = this.sucursalesSin().find((item) => String(item.codSucursalSin) === codigo);
    if (!sucursal) return;
    this.sucursalSeleccionada.set(sucursal);
    this.formulario.update((formulario) => ({
      ...formulario,
      codigoSucursalSin: String(sucursal.codSucursalSin),
      descripcionSin: [sucursal.direccion, sucursal.departamento].map((valor) => valor?.trim()).filter(Boolean).join(' '),
      codigoPuntoVentaSin: '',
      puntoVentaSin: '',
    }));
    this.puntosVentaSin.set([]);
    this.error.set('');
    this.cargarPuntosVenta(sucursal.codSucursalSin);
  }

  seleccionarPuntoVenta(codigo: string): void {
    const punto = this.puntosVentaSin().find((item) => String(item.codigoPuntoVenta) === codigo);
    this.formulario.update((formulario) => ({
      ...formulario,
      codigoPuntoVentaSin: codigo,
      puntoVentaSin: punto?.nombrePuntoVenta ?? '',
    }));
  }

  private cargarPuntosVenta(codigoSucursal: number, codigoSeleccionado = ''): void {
    this.cargandoPuntosVenta.set(true);
    this.error.set('');
    this.puntosApi.listarPorSucursal<PuntoVentaSucursalApiResponse[]>(codigoSucursal).pipe(
      catchError((error: HttpErrorResponse) => {
        this.error.set(mensajeError(error, 'No se pudo cargar el listado de puntos de venta.'));
        return of([] as PuntoVentaSucursalApiResponse[]);
      }),
    ).subscribe((puntos) => {
      this.puntosVentaSin.set(puntos);
      this.cargandoPuntosVenta.set(false);
      if (codigoSeleccionado) this.seleccionarPuntoVenta(codigoSeleccionado);
    });
  }

  guardar(event: Event): void {
    event.preventDefault();
    if (this.guardando()) return;
    const id = this.editando();
    if (id === null) return;
    const formulario = this.formulario();
    const sucursal = this.sucursalSeleccionada();

    if (!formulario.codigoEntel.trim() || !formulario.multicentroEntel.trim()
      || !formulario.codigoSucursalSin.trim() || !formulario.descripcionSin.trim()
      || !formulario.codigoPuntoVentaSin.trim() || !formulario.puntoVentaSin.trim()) {
      this.error.set('Completa los datos del multicentro ENTEL y selecciona un punto de venta SIN.');
      return;
    }
    if (!Number.isInteger(Number(formulario.codigoPuntoVentaSin)) || Number(formulario.codigoPuntoVentaSin) < 0) {
      this.error.set('El código del punto de venta debe ser un número entero válido.');
      return;
    }
    if (!id && !sucursal) {
      this.error.set('Selecciona una sucursal SIN del listado.');
      return;
    }

    const existente = id ? this.homologaciones().find((m) => m.id === id) : undefined;
    if (!sucursal && !existente) {
      this.error.set('No se encontró la sucursal SIN seleccionada.');
      return;
    }
    if (existente && !existente.idHomSucursal) {
      this.error.set('Esta homologación no tiene idHomSucursal. Recarga la página para obtener el ID del backend.');
      return;
    }

    const sistema = this.sistema();
    const idSistema = sistema?.idSistema;
    if (idSistema === undefined) {
      this.error.set(`No se encontró el ID del sistema ${sistema?.codigo ?? ''} requerido por el backend.`);
      return;
    }

    const multicentro: Multicentro = {
      id: existente?.id ?? crypto.randomUUID(),
      sistemaId: this.sistemaId(),
      fecha: existente?.fecha ?? this.fechaHomologacion(),
      codigoEntel: formulario.codigoEntel.trim(),
      multicentroEntel: formulario.multicentroEntel.trim(),
      codigoSucursalSin: formulario.codigoSucursalSin.trim(),
      descripcionSin: formulario.descripcionSin.trim(),
      codigoPuntoVentaSin: formulario.codigoPuntoVentaSin.trim(),
      puntoVentaSin: formulario.puntoVentaSin.trim(),
    };

    const datosActualizacion: HomologacionSucursalUpdateRequest = {
      idSistema,
      codigoMulticentro: multicentro.codigoEntel,
      descripcion: multicentro.multicentroEntel,
      codigoPuntoVenta: Number(multicentro.codigoPuntoVentaSin),
      codigoSucursal: multicentro.codigoSucursalSin,
    };
    const datosCreacion: HomologacionSucursalRequest = {
      ...datosActualizacion,
      usuarioAlta: USUARIO,
      usuarioModificacion: '',
    };

    this.guardando.set(true);
    this.error.set('');
    const solicitud = existente
      ? this.multicentrosApi.actualizar(existente.idHomSucursal!, datosActualizacion)
      : this.multicentrosApi.crear(datosCreacion);
    solicitud.pipe(
      catchError((error: HttpErrorResponse) => {
        this.error.set(mensajeError(error, 'No se pudo guardar la homologación.'));
        this.guardando.set(false);
        return EMPTY;
      }),
    ).subscribe(() => {
      this.guardando.set(false);
      this.toast.mostrar(existente ? 'Multicentro actualizado.' : 'Homologación creada.');
      this.editando.set(null);
      this.cargarHomologaciones();
    });
  }

  async eliminar(multicentro: Multicentro): Promise<void> {
    const confirmar = await this.confirmar.preguntar({
      titulo: 'Eliminar homologación',
      mensaje: `¿Está seguro de eliminar la homologación del multicentro ${multicentro.multicentroEntel}?`,
      aceptar: 'Eliminar',
      peligro: true,
    });
    if (!confirmar) return;
    this.homologaciones.update((lista) => {
      const siguiente = lista.filter((item) => item.id !== multicentro.id);
      return siguiente;
    });
    this.toast.mostrar('Homologación eliminada.');
  }
}

function convertirHomologacion(api: HomologacionSucursalApiResponse, sistemaId: string): Multicentro {
  return {
    id: String(api.idHomSucursal),
    idHomSucursal: api.idHomSucursal,
    sistemaId,
    fecha: api.fechaAlta,
    codigoEntel: api.codigoMulticentro,
    multicentroEntel: api.descripcion,
    codigoSucursalSin: api.codigoSucursal,
    descripcionSin: api.direccionSucursal ?? '',
    codigoPuntoVentaSin: String(api.codigoPuntoVenta),
    puntoVentaSin: api.nombrePuntoVenta ?? `Punto de venta ${api.codigoPuntoVenta}`,
  };
}

function formatearFecha(valor: string): string {
  const match = valor.match(/^(\d{4})-(\d{2})-(\d{2})T?(\d{2})?:?(\d{2})?:?(\d{2})?/);
  if (!match) return valor;
  const fecha = `${match[3]}/${match[2]}/${match[1]}`;
  return match[4] ? `${fecha} · ${match[4]}:${match[5] ?? '00'}:${match[6] ?? '00'}` : fecha;
}

function mensajeError(error: HttpErrorResponse, predeterminado: string): string {
  return error.status === 0 ? 'No se pudo conectar con Vortex.'
    : error.error?.mensaje || error.error?.message || `${predeterminado} (HTTP ${error.status}).`;
}
