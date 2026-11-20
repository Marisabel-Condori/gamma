import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { Confirmar, GmAccionesFila, GmBoton, GmBuscar, GmCelda, GmColumna, GmEncabezado, GmModal, GmRutaNavegacion, GmTabla, Toast } from '../../../shared/ui';
import { conteo as contarRegistros } from '../../../shared/utils/texto';
import { PuntosVentaService } from '../data/puntos-venta.service';
import { SucursalesService } from '../data/sucursales.service';
import {
  CierrePuntoVentaRequest,
  CuisCufdVigenteApiResponse,
  PuntoVentaSucursalApiResponse,
  RegistrarPuntoVentaRequest,
  SucursalApiRequest,
  SucursalApiResponse,
  SolicitudConsultaPuntoVenta,
  SolicitudSincronizarSucursal,
} from '../data/puntos-venta.model';

const COLUMNAS_SUCURSALES: GmColumna<SucursalApiResponse>[] = [
  { id: 'codSucursalSin', titulo: 'Código sucursal SIN', ancho: '170px', destacar: true, movil: 'titulo' },
  {
    id: 'descripcion',
    titulo: 'Descripción',
    movil: 'subtitulo',
    valor: (s) => s.descripcion?.trim() || [s.direccion, s.departamento].map((valor) => valor?.trim()).filter(Boolean).join(' ') || '—',
  },
  { id: 'puntosVenta', titulo: 'Asignación puntos venta', ancho: '150px', alinear: 'centro', movil: 'pie' },
  { id: 'acciones', titulo: 'Acciones', ancho: '160px', alinear: 'centro', movil: 'esquina' },
];

interface DetalleSucursal {
  etiqueta: string;
  valor: string;
}

interface FormularioEdicionSucursal {
  codigoSucursalSin: string;
  descripcion: string;
  direccion: string;
  departamento: string;
  municipio: string;
  localidad: string;
  oficina: string;
  orgId: string;
  observacion: string;
}

const COLUMNAS_PUNTOS: GmColumna<PuntoVentaSucursalApiResponse>[] = [
  { id: 'codigoPuntoVenta', titulo: 'Código punto de venta SIN', ancho: '100px', destacar: true },
  { id: 'nombrePuntoVenta', titulo: 'Descripción', ancho: '155px', movil: 'titulo' },
  { id: 'codigoCuis', titulo: 'CUIS', ancho: '90px', valor: (p) => p.codigoCuis || '—' },
  { id: 'fechaVigenciaCuis', titulo: 'Fecha vigencia CUIS', ancho: '140px', valor: (p) => formatearFecha(p.fechaVigenciaCuis) },
  { id: 'codigoCufd', titulo: 'CUFD', ancho: '150px', recortar: true, valor: (p) => p.codigoCufd || p.cufd || '—' },
  { id: 'fechaVigenciaCufd', titulo: 'Fecha vigencia CUFD', ancho: '140px', valor: (p) => formatearFecha(p.fechaVigenciaCufd || p.fechaCufd) },
  { id: 'tipoPuntoVenta', titulo: 'Tipo punto de venta', ancho: '180px', movil: 'subtitulo' },
  { id: 'acciones', titulo: 'Acciones', ancho: '100px', alinear: 'centro', movil: 'pie-fin', fijaDerecha: true },
];

@Component({
  selector: 'gm-puntos-venta-sistemas-page',
  imports: [GmEncabezado, GmBuscar, GmBoton, GmTabla, GmCelda, GmAccionesFila, GmModal],
  templateUrl: './puntos-venta-sistemas.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'gm-pagina' },
  styles: `
    .acciones-punto {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .detalle-sucursal {
      margin: 0;
      border: 1px solid var(--linea);
      border-radius: var(--radio-lg);
      overflow: hidden;
    }
    .detalle-sucursal__fila {
      display: grid;
      grid-template-columns: minmax(150px, 1fr) 2fr;
      border-bottom: 1px solid var(--linea);
    }
    .detalle-sucursal__fila:last-child {
      border-bottom: 0;
    }
    .detalle-sucursal dt,
    .detalle-sucursal dd {
      margin: 0;
      padding: 12px 14px;
      overflow-wrap: anywhere;
    }
    .detalle-sucursal dt {
      background: var(--apagado);
      color: var(--tinta-2);
      font-weight: var(--peso-semi);
    }
    .detalle-sucursal dd {
      color: var(--tinta);
    }
    .edicion-sucursal {
      border: 1px solid var(--linea);
      border-radius: var(--radio-lg);
      overflow: hidden;
    }
    .contexto-nuevo-punto {
      display: grid;
      grid-template-columns: 140px minmax(0, 1fr);
      gap: 12px;
      margin: 0 0 18px;
    }
    .contexto-nuevo-punto__empresa,
    .contexto-nuevo-punto__sucursal {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 5px;
      min-width: 0;
      padding: 13px 15px;
      border: 1px solid var(--linea);
      border-radius: var(--radio-lg);
      background: var(--apagado);
      color: var(--tinta-2);
      font-size: var(--texto-sm);
      overflow-wrap: anywhere;
    }
    .contexto-nuevo-punto__empresa span,
    .contexto-nuevo-punto__sucursal span,
    .contexto-nuevo-punto__sucursal small {
      color: var(--tinta-3);
      font-size: var(--texto-xs);
    }
    .contexto-nuevo-punto__empresa strong,
    .contexto-nuevo-punto__sucursal strong {
      color: var(--tinta);
    }
    .nuevo-punto-formulario {
      display: grid;
      gap: 14px;
      padding: 17px;
      border: 1px solid var(--linea);
      border-radius: var(--radio-lg);
      background: var(--superficie);
    }
    .nuevo-punto-formulario__campo {
      display: grid;
      gap: 7px;
      color: var(--tinta-2);
      font-size: var(--texto-sm);
      font-weight: var(--peso-semi);
    }
    .nuevo-punto-formulario__campo input,
    .nuevo-punto-formulario__campo select {
      width: 100%;
      min-width: 0;
      height: var(--control-lg);
      padding: 0 12px;
      border: 1px solid var(--linea);
      border-radius: var(--radio-md);
      background: var(--superficie);
      color: var(--tinta);
      font: inherit;
      font-weight: var(--peso-normal);
    }
    .nuevo-punto-formulario__campo input:focus,
    .nuevo-punto-formulario__campo select:focus {
      border-color: var(--marca);
      outline: 3px solid var(--marca-tenue);
      outline-offset: 1px;
    }
    .edicion-sucursal__fila {
      display: grid;
      grid-template-columns: minmax(170px, 1fr) 2fr;
      align-items: center;
      gap: 12px;
      padding: 9px 12px;
      border-bottom: 1px solid var(--linea);
      color: var(--tinta-2);
      font-size: var(--texto-sm);
    }
    .edicion-sucursal__fila:last-child {
      border-bottom: 0;
    }
    .edicion-sucursal__fila input,
    .edicion-sucursal__fila select {
      width: 100%;
      min-width: 0;
      height: var(--control-md);
      padding: 0 10px;
      border: 1px solid var(--linea);
      border-radius: var(--radio-md);
      background: var(--superficie);
      color: var(--tinta);
      font: inherit;
    }
    .edicion-sucursal__fila input[readonly] {
      background: var(--apagado);
      color: var(--tinta-3);
    }
    @media (max-width: 600px) {
      .contexto-nuevo-punto {
        grid-template-columns: 1fr;
      }
      .detalle-sucursal__fila {
        grid-template-columns: 1fr;
      }
      .detalle-sucursal dd {
        padding-top: 0;
      }
      .edicion-sucursal__fila {
        grid-template-columns: 1fr;
        gap: 6px;
      }
    }
  `,
})
export class PuntosVentaSistemasPage implements OnInit {
  private readonly sucursalesApi = inject(SucursalesService);
  private readonly puntosApi = inject(PuntosVentaService);
  private readonly toast = inject(Toast);
  private readonly confirmar = inject(Confirmar);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly columnasSucursales = COLUMNAS_SUCURSALES;
  readonly columnasPuntos = COLUMNAS_PUNTOS;
  readonly query = signal('');
  readonly queryPuntos = signal('');
  readonly sucursales = signal<SucursalApiResponse[]>([]);
  readonly puntosVenta = signal<PuntoVentaSucursalApiResponse[]>([]);
  readonly sucursalSeleccionada = signal<SucursalApiResponse | null>(null);
  readonly codigoSucursalRuta = signal<string | null>(null);
  readonly conteos = signal<Record<string, number>>({});
  readonly cargandoPuntosPorSucursal = signal<Record<string, boolean>>({});
  readonly cargandoSucursales = signal(false);
  readonly cargandoPuntos = signal(false);
  readonly error = signal('');
  readonly errorPuntos = signal('');
  readonly errorCodigos = signal('');
  readonly editandoSucursal = signal<SucursalApiResponse | null>(null);
  readonly nuevaSucursalAbierta = signal(false);
  readonly sucursalCreadaExitosa = signal(false);
  readonly sincronizandoPuntos = signal(false);
  readonly sincronizacionExitosa = signal(false);
  readonly nuevoPuntoAbierto = signal(false);
  readonly formularioPunto = signal({ descripcion: '', tipo: '' });
  readonly errorNuevoPunto = signal('');
  readonly guardandoNuevoPunto = signal(false);
  readonly tiposPuntoVenta = [
    { codigo: 1, nombre: 'PUNTO VENTA COMISIONISTA' },
    { codigo: 2, nombre: 'PUNTO VENTA VENTANILLA DE COBRANZA' },
    { codigo: 3, nombre: 'PUNTO DE VENTA MOVILES' },
    { codigo: 4, nombre: 'PUNTO DE VENTA YPFB' },
    { codigo: 5, nombre: 'PUNTO DE VENTA CAJEROS' },
    { codigo: 6, nombre: 'PUNTO DE VENTA CONJUNTA' },
  ];
  readonly formularioSucursal = signal<FormularioEdicionSucursal>({
    codigoSucursalSin: '', descripcion: '', direccion: '', municipio: '', departamento: '', localidad: '', oficina: '', orgId: '', observacion: '',
  });
  readonly errorEdicionSucursal = signal('');
  readonly guardandoSucursal = signal(false);
  readonly departamentosSucursal = computed(() => [...new Set(this.sucursales().map((s) => s.departamento?.trim() ?? '').filter(Boolean))].sort());
  readonly municipiosSucursal = computed(() => [...new Set(this.sucursales().map((s) => s.municipio?.trim() ?? '').filter(Boolean))].sort());
  readonly localidadesSucursal = computed(() => [...new Set(this.sucursales().map((s) => s.localidad?.trim() ?? '').filter(Boolean))].sort());
  readonly oficinasSucursal = computed(() => [...new Set(this.sucursales().map((s) => s.oficina?.trim() ?? '').filter(Boolean))].sort());
  readonly detalleSucursalSeleccionada = signal<SucursalApiResponse | null>(null);
  readonly camposDetalleSucursal = computed<DetalleSucursal[]>(() => {
    const sucursal = this.detalleSucursalSeleccionada();
    if (!sucursal) return [];
    return [
      { etiqueta: 'Código sucursal SIN', valor: String(sucursal.codSucursalSin) },
      { etiqueta: 'Descripción SIN', valor: sucursal.descripcion?.trim() || [sucursal.direccion, sucursal.departamento].map((v) => v?.trim()).filter(Boolean).join(' ') || '—' },
      { etiqueta: 'Departamento', valor: sucursal.departamento || '—' },
      { etiqueta: 'Municipio', valor: sucursal.municipio || '—' },
      { etiqueta: 'Dirección', valor: sucursal.direccion || '—' },
      { etiqueta: 'Fecha de alta', valor: formatearFecha(sucursal.fechaAlta) },
      { etiqueta: 'Observación', valor: sucursal.observacion || '—' },
    ];
  });

  readonly filtradas = computed(() => {
    const query = normalizarBusqueda(this.query());
    if (!query) return this.sucursales();
    return this.sucursales().filter((sucursal) => [
      sucursal.codSucursalSin,
      sucursal.descripcion,
      sucursal.direccion,
      sucursal.departamento,
      sucursal.municipio,
      sucursal.observacion,
      sucursal.fechaAlta,
    ].some((campo) => normalizarBusqueda(campo).includes(query)));
  });
  readonly filtradosPuntos = computed(() => {
    const query = normalizarBusqueda(this.queryPuntos());
    if (!query) return this.puntosVenta();
    return this.puntosVenta().filter((punto) => [
      punto.codigoPuntoVenta,
      punto.nombrePuntoVenta,
      punto.tipoPuntoVenta,
      punto.codigoSucursal,
      punto.codigoCuis,
      punto.codigoCufd,
      punto.cufd,
      punto.fechaConsulta,
      punto.fechaVigenciaCuis,
      formatearFecha(punto.fechaVigenciaCuis),
      punto.fechaVigenciaCufd,
      formatearFecha(punto.fechaVigenciaCufd),
      punto.fechaCufd,
      formatearFecha(punto.fechaCufd),
      punto.sincroniza === undefined ? '' : punto.sincroniza ? 'Sí' : 'No',
      ...Object.values(punto),
    ].some((campo) => normalizarBusqueda(campo).includes(query)));
  });
  readonly conteoSucursales = computed(() => contarRegistros(this.filtradas().length, 'sucursal', 'sucursales'));
  readonly conteoPuntos = computed(() => contarRegistros(this.filtradosPuntos().length, 'punto de venta', 'puntos de venta'));
  readonly migas = computed<GmRutaNavegacion[]>(() => {
    const sucursal = this.sucursalSeleccionada();
    return sucursal
      ? [
          { etiqueta: 'Puntos de venta', enlace: '/puntos-de-venta' },
          { etiqueta: `Sucursal ${sucursal.codSucursalSin}` },
        ]
      : [];
  });
  readonly vacioSucursales = computed(() => this.cargandoSucursales()
    ? 'Cargando sucursales…'
    : this.query().trim()
      ? 'No hay sucursales que coincidan con la búsqueda.'
      : 'El servicio no devolvió sucursales SIN.');
  readonly vacioPuntos = computed(() => this.cargandoPuntos()
    ? 'Cargando puntos de venta…'
    : this.queryPuntos().trim()
      ? 'No hay puntos de venta que coincidan con la búsqueda.'
      : 'Esta sucursal no tiene puntos de venta disponibles.');

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const codigo = params.get('codigoSucursal');
      this.codigoSucursalRuta.set(codigo);
      if (!codigo) {
        this.sucursalSeleccionada.set(null);
        this.puntosVenta.set([]);
        this.queryPuntos.set('');
        this.errorPuntos.set('');
        return;
      }
      const sucursal = this.sucursales().find((item) => String(item.codSucursalSin) === codigo);
      if (sucursal) this.cargarPuntos(sucursal);
    });

    this.cargandoSucursales.set(true);
    this.sucursalesApi.listar<SucursalApiResponse[]>().pipe(
      catchError((error: HttpErrorResponse) => {
        this.error.set(mensajeError(error, 'No se pudieron cargar las sucursales.'));
        return of([] as SucursalApiResponse[]);
      }),
    ).subscribe((sucursales) => {
      this.sucursales.set(sucursales);
      this.cargandoSucursales.set(false);
      const codigo = this.codigoSucursalRuta();
      if (codigo) {
        const sucursal = sucursales.find((item) => String(item.codSucursalSin) === codigo);
        if (sucursal) this.cargarPuntos(sucursal);
        else this.errorPuntos.set(`No se encontró la sucursal SIN ${codigo}.`);
      }
    });
  }

  etiquetaPuntos(codigoSucursal: number): string {
    const codigo = String(codigoSucursal);
    if (this.estaCargandoPuntos(codigoSucursal)) return 'Cargando…';
    const total = this.conteos()[codigo];
    return total === undefined ? 'Ver puntos' : `${total} ${total === 1 ? 'punto' : 'puntos'}`;
  }

  estaCargandoPuntos(codigoSucursal: number): boolean {
    return this.cargandoPuntosPorSucursal()[String(codigoSucursal)] ?? false;
  }

  mostrarPuntos(sucursal: SucursalApiResponse): void {
    void this.router.navigate(['/puntos-de-venta', sucursal.codSucursalSin]);
  }

  abrirDetalleSucursal(sucursal: SucursalApiResponse): void {
    this.detalleSucursalSeleccionada.set(sucursal);
  }

  abrirEdicionSucursal(sucursal: SucursalApiResponse): void {
    this.formularioSucursal.set({
      codigoSucursalSin: String(sucursal.codSucursalSin),
      descripcion: sucursal.descripcion ?? [sucursal.direccion, sucursal.departamento].filter(Boolean).join(' '),
      direccion: sucursal.direccion ?? '',
      municipio: sucursal.municipio ?? '',
      departamento: sucursal.departamento ?? '',
      localidad: sucursal.localidad ?? '',
      oficina: sucursal.oficina ?? '',
      orgId: sucursal.orgId === undefined ? '' : String(sucursal.orgId),
      observacion: sucursal.observacion ?? '',
    });
    this.errorEdicionSucursal.set('');
    this.editandoSucursal.set(sucursal);
  }

  abrirNuevaSucursal(): void {
    this.formularioSucursal.set({
      codigoSucursalSin: '', descripcion: '', direccion: '', municipio: '', departamento: '', localidad: '', oficina: '', orgId: '', observacion: '',
    });
    this.errorEdicionSucursal.set('');
    this.sucursalCreadaExitosa.set(false);
    this.nuevaSucursalAbierta.set(true);
  }

  actualizarDireccionNuevaSucursal(event: Event): void {
    const direccion = (event.target as HTMLInputElement).value;
    this.formularioSucursal.update((actual) => ({ ...actual, direccion, descripcion: direccion }));
  }

  crearSucursal(event: Event): void {
    event.preventDefault();
    if (this.guardandoSucursal()) return;
    const formulario = this.formularioSucursal();
    const codigo = Number(formulario.codigoSucursalSin);
    if (!Number.isInteger(codigo) || codigo < 0) {
      this.errorEdicionSucursal.set('Ingresa un código de sucursal SIN válido.');
      return;
    }
    if (this.sucursales().some((sucursal) => sucursal.codSucursalSin === codigo)) {
      this.errorEdicionSucursal.set('Ya existe una sucursal con ese código SIN.');
      return;
    }
    if (!formulario.descripcion.trim() || !formulario.direccion.trim()) {
      this.errorEdicionSucursal.set('Completa la descripción y la dirección de la sucursal.');
      return;
    }
    const datos: SucursalApiRequest = {
      direccion: formulario.direccion.trim(),
      municipio: formulario.municipio.trim(),
      departamento: formulario.departamento.trim(),
      observacion: formulario.observacion.trim(),
    };
    this.guardandoSucursal.set(true);
    this.errorEdicionSucursal.set('');
    this.sucursalesApi.crear(codigo, datos).subscribe({
      next: () => {
        this.sucursales.update((lista) => [...lista, {
          codSucursalSin: codigo,
          descripcion: formulario.direccion.trim(),
          direccion: datos.direccion,
          departamento: datos.departamento,
          municipio: datos.municipio,
          fechaAlta: new Date().toISOString(),
          observacion: datos.observacion ?? '',
        }]);
        this.guardandoSucursal.set(false);
        this.nuevaSucursalAbierta.set(false);
        this.sucursalCreadaExitosa.set(true);
      },
      error: (error: HttpErrorResponse) => {
        this.guardandoSucursal.set(false);
        this.errorEdicionSucursal.set(mensajeError(error, 'No se pudo crear la sucursal SIN.'));
      },
    });
  }

  abrirNuevoPunto(): void {
    this.formularioPunto.set({ descripcion: '', tipo: '' });
    this.errorNuevoPunto.set('');
    this.nuevoPuntoAbierto.set(true);
  }

  actualizarFormularioPunto(campo: 'descripcion' | 'tipo', event: Event): void {
    const valor = (event.target as HTMLInputElement | HTMLSelectElement).value;
    this.formularioPunto.update((actual) => ({ ...actual, [campo]: valor }));
  }

  descripcionSucursal(sucursal: SucursalApiResponse): string {
    return sucursal.descripcion?.trim() || [sucursal.direccion, sucursal.departamento].map((valor) => valor?.trim()).filter(Boolean).join(' · ');
  }

  crearPuntoVenta(event: Event, sucursal: SucursalApiResponse): void {
    event.preventDefault();
    if (this.guardandoNuevoPunto()) return;
    const formulario = this.formularioPunto();
    if (!formulario.descripcion.trim() || !formulario.tipo) {
      this.errorNuevoPunto.set('Completa la descripción y selecciona el tipo de punto de venta.');
      return;
    }
    const cuis = sucursal.codigoCuis?.trim()
      || this.puntosVenta().find((punto) => String(punto.codigoSucursal) === String(sucursal.codSucursalSin) && punto.codigoCuis?.trim())?.codigoCuis?.trim()
      || '';
    if (!cuis) {
      this.errorNuevoPunto.set('La sucursal no tiene un CUIS disponible para registrar el punto de venta.');
      return;
    }
    const datos: RegistrarPuntoVentaRequest = {
      codigoAmbiente: 2,
      codigoModalidad: 1,
      codigoSistema: '37465CC640F6326702D7',
      codigoSucursal: sucursal.codSucursalSin,
      codigoTipoPuntoVenta: Number(formulario.tipo),
      cuis,
      descripcion: formulario.descripcion.trim(),
      nit: 1020703023,
      nombrePuntoVenta: formulario.descripcion.trim(),
    };
    this.guardandoNuevoPunto.set(true);
    this.errorNuevoPunto.set('');
    this.puntosApi.registrar(datos).subscribe({
      next: () => {
        const consulta: SolicitudConsultaPuntoVenta = {
          codigoAmbiente: 2,
          codigoSistema: '37465CC640F6326702D7',
          codigoSucursal: sucursal.codSucursalSin,
          cuis,
          nit: 1020703023,
        };
        this.puntosApi.consultar(consulta).subscribe({
          next: () => this.sincronizarSucursalTrasRegistro(sucursal, true),
          error: (error: HttpErrorResponse) => {
            this.sincronizarSucursalTrasRegistro(sucursal, false, error);
          },
        });
      },
      error: (error: HttpErrorResponse) => {
        this.guardandoNuevoPunto.set(false);
        this.errorNuevoPunto.set(mensajeError(error, 'No se pudo crear el punto de venta.'));
      },
    });
  }

  async eliminarPuntoVenta(punto: PuntoVentaSucursalApiResponse): Promise<void> {
    const sucursal = this.sucursalSeleccionada();
    if (!sucursal) return;
    const cuis = punto.codigoCuis?.trim() || sucursal.codigoCuis?.trim() || '';
    if (!cuis) {
      this.toast.mostrar('No se puede cerrar el punto porque la sucursal no tiene un CUIS disponible.');
      return;
    }
    const si = await this.confirmar.preguntar({
      titulo: 'Cerrar punto de venta',
      mensaje: `¿Deseas cerrar el punto de venta ${punto.codigoPuntoVenta} (${punto.nombrePuntoVenta})?`,
      aceptar: 'Cerrar punto',
      peligro: true,
    });
    if (!si) return;
    const datos: CierrePuntoVentaRequest = {
      codigoAmbiente: 2,
      codigoPuntoVenta: punto.codigoPuntoVenta,
      codigoSistema: '37465CC640F6326702D7',
      codigoSucursal: sucursal.codSucursalSin,
      cuis,
      nit: 1020703023,
    };
    this.puntosApi.cerrar(datos).subscribe({
      next: () => {
        this.toast.mostrar(`Punto de venta ${punto.codigoPuntoVenta} cerrado.`);
        this.cargarPuntos(sucursal);
      },
      error: (error: HttpErrorResponse) => this.toast.mostrar(mensajeError(error, 'No se pudo cerrar el punto de venta.')),
    });
  }

  private sincronizarSucursalTrasRegistro(
    sucursal: SucursalApiResponse,
    consultaExitosa: boolean,
    errorConsulta?: HttpErrorResponse,
  ): void {
    const datos: SolicitudSincronizarSucursal = {
      codigoAmbiente: 2,
      codigoModalidad: 1,
      codigoSistema: '37465CC640F6326702D7',
      nit: 1020703023,
    };
    this.puntosApi.sincronizar(sucursal.codSucursalSin, datos).subscribe({
      next: () => {
        this.guardandoNuevoPunto.set(false);
        this.nuevoPuntoAbierto.set(false);
        const avisoConsulta = consultaExitosa
          ? 'Punto de venta registrado, consultado y sincronizado.'
          : `Punto registrado y sincronizado, pero falló la consulta. ${mensajeError(errorConsulta!, 'No se pudo consultar el punto de venta.')}`;
        this.toast.mostrar(avisoConsulta);
        this.cargarPuntos(sucursal);
      },
      error: (error: HttpErrorResponse) => {
        this.guardandoNuevoPunto.set(false);
        this.nuevoPuntoAbierto.set(false);
        const detalleConsulta = consultaExitosa
          ? ''
          : ` También falló la consulta: ${mensajeError(errorConsulta!, 'No se pudo consultar el punto de venta.')}`;
        this.toast.mostrar(`El punto de venta se registró, pero no se pudo sincronizar. ${mensajeError(error, 'Error al sincronizar la sucursal.')}${detalleConsulta}`);
        this.cargarPuntos(sucursal);
      },
    });
  }

  actualizarFormularioSucursal(campo: keyof FormularioEdicionSucursal, event: Event): void {
    const valor = (event.target as HTMLInputElement | HTMLSelectElement).value;
    this.formularioSucursal.update((actual) => ({ ...actual, [campo]: valor }));
  }

  guardarSucursal(event: Event): void {
    event.preventDefault();
    const sucursal = this.editandoSucursal();
    if (!sucursal || this.guardandoSucursal()) return;
    this.guardandoSucursal.set(true);
    this.errorEdicionSucursal.set('');
    const formulario = this.formularioSucursal();
    const codigoSucursalSin = Number(formulario.codigoSucursalSin);
    if (!Number.isInteger(codigoSucursalSin) || codigoSucursalSin < 0) {
      this.guardandoSucursal.set(false);
      this.errorEdicionSucursal.set('Ingresa un código de sucursal SIN válido.');
      return;
    }
    if (this.sucursales().some((item) => item.codSucursalSin === codigoSucursalSin && item.codSucursalSin !== sucursal.codSucursalSin)) {
      this.guardandoSucursal.set(false);
      this.errorEdicionSucursal.set('Ya existe una sucursal con ese código SIN.');
      return;
    }
    const datos: SucursalApiRequest = {
      codigoSucursalSin,
      descripcion: formulario.descripcion.trim(),
      direccion: formulario.direccion.trim(),
      municipio: formulario.municipio.trim(),
      departamento: formulario.departamento.trim(),
      localidad: formulario.localidad.trim(),
      oficina: formulario.oficina.trim(),
      orgId: formulario.orgId.trim(),
      observacion: formulario.observacion.trim(),
    };
    this.sucursalesApi.actualizar(sucursal.codSucursalSin, datos).subscribe({
      next: () => {
        this.sucursales.update((lista) => lista.map((item) => item.codSucursalSin === sucursal.codSucursalSin
          ? { ...item, ...datos, codSucursalSin: codigoSucursalSin, orgId: datos.orgId }
          : item));
        this.guardandoSucursal.set(false);
        this.editandoSucursal.set(null);
        this.toast.mostrar('Sucursal SIN actualizada.');
      },
      error: (error: HttpErrorResponse) => {
        this.guardandoSucursal.set(false);
        this.errorEdicionSucursal.set(mensajeError(error, 'No se pudo actualizar la sucursal SIN.'));
      },
    });
  }

  async eliminarSucursal(sucursal: SucursalApiResponse): Promise<void> {
    const si = await this.confirmar.preguntar({
      titulo: 'Eliminar sucursal SIN',
      mensaje: `¿Está seguro de que desea eliminar la sucursal ${sucursal.codSucursalSin}?`,
      aceptar: 'Eliminar',
      peligro: true,
    });
    if (!si) return;
    this.sucursalesApi.eliminar(sucursal.codSucursalSin).subscribe({
      next: () => {
        this.sucursales.update((lista) => lista.filter((item) => item.codSucursalSin !== sucursal.codSucursalSin));
        this.toast.mostrar(`Sucursal ${sucursal.codSucursalSin} eliminada.`);
      },
      error: (error: HttpErrorResponse) => this.error.set(mensajeError(error, 'No se pudo eliminar la sucursal SIN.')),
    });
  }

  private cargarPuntos(sucursal: SucursalApiResponse): void {
    const codigo = String(sucursal.codSucursalSin);
    this.codigoSucursalRuta.set(codigo);
    this.sucursalSeleccionada.set(sucursal);
    this.puntosVenta.set([]);
    this.errorPuntos.set('');
    this.errorCodigos.set('');
    this.cargandoPuntos.set(true);
    this.cargandoPuntosPorSucursal.update((actual) => ({ ...actual, [codigo]: true }));

    forkJoin({
      puntos: this.puntosApi.listarPorSucursal<PuntoVentaSucursalApiResponse[]>(sucursal.codSucursalSin).pipe(
        catchError((error: HttpErrorResponse) => {
          this.errorPuntos.set(mensajeError(error, 'No se pudieron cargar los puntos de venta.'));
          return of([] as PuntoVentaSucursalApiResponse[]);
        }),
      ),
      codigos: this.puntosApi.listarVigentes<CuisCufdVigenteApiResponse[]>().pipe(
        catchError((error: HttpErrorResponse) => {
          this.errorCodigos.set(mensajeError(error, 'No se pudieron cargar los códigos vigentes.'));
          return of([] as CuisCufdVigenteApiResponse[]);
        }),
      ),
    }).subscribe(({ puntos, codigos }) => {
      if (this.codigoSucursalRuta() !== codigo) return;
      const enriquecidos = puntos.map((punto) => {
        const codigoVigente = codigos.find((item) =>
          String(item.codigoSucursal) === String(punto.codigoSucursal || sucursal.codSucursalSin)
          && item.codigoPuntoVenta === punto.codigoPuntoVenta,
        );
        return {
          ...punto,
          codigoCuis: punto.codigoCuis || codigoVigente?.codigoCuis || '',
          fechaVigenciaCuis: punto.fechaVigenciaCuis || codigoVigente?.fechaVigenciaCuis || '',
          codigoCufd: codigoVigente?.codigoCufd || '',
          fechaVigenciaCufd: codigoVigente?.fechaVigenciaCufd || '',
        };
      });
      this.puntosVenta.set(enriquecidos);
      this.conteos.update((actual) => ({ ...actual, [codigo]: enriquecidos.length }));
      this.cargandoPuntos.set(false);
      this.cargandoPuntosPorSucursal.update((actual) => ({ ...actual, [codigo]: false }));
    });
  }

  volverASucursales(): void {
    void this.router.navigate(['/puntos-de-venta']);
  }

  avisarAccion(accion: string): void {
    this.toast.mostrar(`${accion} punto de venta: el backend todavía no tiene un endpoint para esta acción.`);
  }

  sincronizarPuntosVenta(): void {
    if (this.sincronizandoPuntos()) return;
    const sucursal = this.sucursalSeleccionada();
    if (!sucursal) {
      this.toast.mostrar('Selecciona una sucursal para sincronizar sus puntos de venta.');
      return;
    }
    const datos: SolicitudSincronizarSucursal = {
      codigoAmbiente: 2,
      codigoModalidad: 1,
      codigoSistema: '37465CC640F6326702D7',
      nit: 1020703023,
    };
    this.sincronizandoPuntos.set(true);
    this.puntosApi.sincronizar(sucursal.codSucursalSin, datos).subscribe({
      next: () => {
        this.sincronizandoPuntos.set(false);
        this.sincronizacionExitosa.set(true);
        this.cargarPuntos(sucursal);
      },
      error: (error: HttpErrorResponse) => {
        this.sincronizandoPuntos.set(false);
        this.toast.mostrar(`La sincronización no funcionó. ${mensajeError(error, 'No se pudieron sincronizar los puntos de venta.')}`);
      },
    });
  }
}

function normalizarBusqueda(valor: unknown): string {
  return String(valor ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

function formatearFecha(valor?: string): string {
  if (!valor) return '—';
  const match = valor.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)/);
  if (!match) return valor;
  const fecha = `${match[3]}/${match[2]}/${match[1]}`;
  return match[4] ? `${fecha} · ${match[4]}:${match[5]}:${match[6] ?? '00'}` : fecha;
}

function mensajeError(error: HttpErrorResponse, predeterminado: string): string {
  return error.status === 0 ? 'No se pudo conectar con Vortex.'
    : error.error?.mensaje || error.error?.message || `${predeterminado} (HTTP ${error.status}).`;
}
