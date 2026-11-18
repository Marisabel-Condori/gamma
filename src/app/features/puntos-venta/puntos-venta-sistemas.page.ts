import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { Confirmar, GmAccionesFila, GmBoton, GmBuscar, GmCelda, GmColumna, GmEncabezado, GmModal, GmRutaNavegacion, GmTabla, Toast } from '../../shared/ui';
import { conteo as contarRegistros } from '../../shared/utils/texto';
import {
  CuisCufdVigenteApiResponse,
  PuntoVentaSucursalApiResponse,
  SucursalApiRequest,
  SucursalApiResponse,
  VortexApiService,
} from '../sistemas-facturadores/homologaciones/sucursales/data/vortex-api.service';

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
  { id: 'codigoPuntoVenta', titulo: 'Código punto de venta SIN', ancho: '170px', destacar: true },
  { id: 'nombrePuntoVenta', titulo: 'Descripción', movil: 'titulo' },
  { id: 'codigoCuis', titulo: 'CUIS', ancho: '150px', valor: (p) => p.codigoCuis || '—' },
  { id: 'fechaVigenciaCuis', titulo: 'Fecha vigencia CUIS', ancho: '190px', valor: (p) => formatearFecha(p.fechaVigenciaCuis) },
  { id: 'codigoCufd', titulo: 'CUFD', ancho: '210px', recortar: true, valor: (p) => p.codigoCufd || p.cufd || '—' },
  { id: 'fechaVigenciaCufd', titulo: 'Fecha vigencia CUFD', ancho: '190px', valor: (p) => formatearFecha(p.fechaVigenciaCufd || p.fechaCufd) },
  { id: 'tipoPuntoVenta', titulo: 'Tipo punto de venta', ancho: '250px', movil: 'subtitulo' },
  { id: 'sincroniza', titulo: 'Sincroniza', ancho: '120px', alinear: 'centro', valor: (p) => p.sincroniza === undefined ? '—' : p.sincroniza ? 'Sí' : 'No' },
  { id: 'acciones', titulo: 'Acciones', ancho: '160px', movil: 'pie-fin' },
];

@Component({
  selector: 'gm-puntos-venta-sistemas-page',
  imports: [GmEncabezado, GmBuscar, GmBoton, GmTabla, GmCelda, GmAccionesFila, GmModal],
  template: `
    @if (sucursalSeleccionada(); as sucursal) {
      <gm-encabezado
        titulo="Puntos de venta"
        tituloMovil="Puntos de venta"
        volver="/puntos-de-venta"
        [rutanavegacion]="migas()"
        [etiqueta]="'Sucursal ' + sucursal.codSucursalSin"
        etiquetaTipo="chip"
      >
        <gm-buscar placeholder="Buscar punto de venta..." [(valor)]="queryPuntos" />
        <button
          gmBoton="primario"
          type="button"
          icono="sincronizar"
          etiqueta="Sincronizar Puntos Venta"
          (click)="sincronizarPuntosVenta()"
        ></button>
      </gm-encabezado>
      @if (errorPuntos()) {
        <p class="gm-error" role="alert">{{ errorPuntos() }}</p>
      }
      @if (errorCodigos()) {
        <p class="gm-muted" role="status">No se pudieron cargar los datos vigentes CUIS/CUFD: {{ errorCodigos() }}</p>
      }
      <gm-tabla
        [datos]="filtradosPuntos()"
        [columnas]="columnasPuntos"
        cabecera="clara"
        anchoMinimo="1500px"
        [porPagina]="10"
        [vacio]="vacioPuntos()"
      >
        <ng-template gmCelda="acciones">
          <gm-acciones-fila que="punto de venta" (editar)="avisarAccion('Editar')" (eliminar)="avisarAccion('Eliminar')" />
        </ng-template>
      </gm-tabla>
    } @else {
      <gm-encabezado
        titulo="Puntos de venta"
        tituloMovil="Puntos de venta"
        [rutanavegacion]="migas()"
        [etiqueta]="conteoSucursales()"
      >
        <gm-buscar placeholder="Buscar sucursal..." [(valor)]="query" />
      </gm-encabezado>
      @if (error()) {
        <p class="gm-error" role="alert">{{ error() }}</p>
      }
      <gm-tabla
        [datos]="filtradas()"
        [columnas]="columnasSucursales"
        anchoMinimo="720px"
        [porPagina]="10"
        [vacio]="vacioSucursales()"
      >
        <ng-template gmCelda="puntosVenta" let-sucursal>
          <button
            gmBoton
            chico
            icono="tienda"
            [etiqueta]="etiquetaPuntos(sucursal.codSucursalSin)"
            [disabled]="estaCargandoPuntos(sucursal.codSucursalSin)"
            [attr.aria-label]="'Ver puntos de venta de la sucursal ' + sucursal.codSucursalSin"
            (click)="mostrarPuntos(sucursal)"
          ></button>
        </ng-template>
        <ng-template gmCelda="acciones" let-sucursal>
          <div class="acciones-punto">
            <button
              gmBoton
              chico
              type="button"
              icono="menu"
              [attr.aria-label]="'Ver detalle de sucursal ' + sucursal.codSucursalSin"
              (click)="abrirDetalleSucursal(sucursal)"
            ></button>
            <gm-acciones-fila que="sucursal SIN" (editar)="abrirEdicionSucursal(sucursal)" (eliminar)="eliminarSucursal(sucursal)" />
          </div>
        </ng-template>
      </gm-tabla>
    }
    @if (detalleSucursalSeleccionada(); as sucursal) {
      <gm-modal titulo="Detalle de sucursal SIN" ancho="820px" (cerrar)="detalleSucursalSeleccionada.set(null)">
        <dl class="detalle-sucursal">
          @for (campo of camposDetalleSucursal(); track campo.etiqueta) {
            <div class="detalle-sucursal__fila">
              <dt>{{ campo.etiqueta }}</dt>
              <dd>{{ campo.valor }}</dd>
            </div>
          }
        </dl>
        <div class="gm-acciones">
          <button gmBoton="primario" type="button" etiqueta="Cerrar" (click)="detalleSucursalSeleccionada.set(null)"></button>
        </div>
      </gm-modal>
    }
    @if (editandoSucursal(); as sucursal) {
      <gm-modal titulo="Modificar sucursal SIN" ancho="760px" (cerrar)="editandoSucursal.set(null)">
        <form (submit)="guardarSucursal($event)" novalidate>
          <div class="edicion-sucursal">
            <label class="edicion-sucursal__fila">
              <span>Código sucursal SIN</span>
              <input [value]="formularioSucursal().codigoSucursalSin" (input)="actualizarFormularioSucursal('codigoSucursalSin', $event)" />
            </label>
            <label class="edicion-sucursal__fila">
              <span>Descripción SIN</span>
              <input [value]="formularioSucursal().descripcion" (input)="actualizarFormularioSucursal('descripcion', $event)" />
            </label>
            <label class="edicion-sucursal__fila">
              <span>Departamento</span>
              <select [value]="formularioSucursal().departamento" (change)="actualizarFormularioSucursal('departamento', $event)">
                <option value="">-- Seleccione --</option>
                @for (departamento of departamentosSucursal(); track departamento) {
                  <option [value]="departamento">{{ departamento }}</option>
                }
              </select>
            </label>
            <label class="edicion-sucursal__fila">
              <span>Municipio</span>
              <select [value]="formularioSucursal().municipio" (change)="actualizarFormularioSucursal('municipio', $event)">
                <option value="">-- Seleccione --</option>
                @for (municipio of municipiosSucursal(); track municipio) {
                  <option [value]="municipio">{{ municipio }}</option>
                }
              </select>
            </label>
            <label class="edicion-sucursal__fila">
              <span>Localidad</span>
              <select [value]="formularioSucursal().localidad" (change)="actualizarFormularioSucursal('localidad', $event)">
                <option value="">-- Seleccione --</option>
                @for (localidad of localidadesSucursal(); track localidad) {
                  <option [value]="localidad">{{ localidad }}</option>
                }
              </select>
            </label>
            <label class="edicion-sucursal__fila">
              <span>Oficina</span>
              <select [value]="formularioSucursal().oficina" (change)="actualizarFormularioSucursal('oficina', $event)">
                <option value="">-- Seleccione --</option>
                @for (oficina of oficinasSucursal(); track oficina) {
                  <option [value]="oficina">{{ oficina }}</option>
                }
              </select>
            </label>
            <label class="edicion-sucursal__fila">
              <span>Org ID</span>
              <input [value]="formularioSucursal().orgId" (input)="actualizarFormularioSucursal('orgId', $event)" />
            </label>
            <label class="edicion-sucursal__fila">
              <span>Dirección</span>
              <input [value]="formularioSucursal().direccion" (input)="actualizarFormularioSucursal('direccion', $event)" />
            </label>
            <label class="edicion-sucursal__fila">
              <span>Observación</span>
              <input [value]="formularioSucursal().observacion" (input)="actualizarFormularioSucursal('observacion', $event)" />
            </label>
          </div>
          @if (errorEdicionSucursal()) {
            <p class="gm-error" role="alert">{{ errorEdicionSucursal() }}</p>
          }
          <div class="gm-acciones">
            <button gmBoton="neutro" type="button" etiqueta="Cancelar" (click)="editandoSucursal.set(null)"></button>
            <button gmBoton="primario" type="submit" [disabled]="guardandoSucursal()" [etiqueta]="guardandoSucursal() ? 'Guardando…' : 'Guardar'"></button>
          </div>
        </form>
      </gm-modal>
    }
  `,
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
  private readonly vortex = inject(VortexApiService);
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
      { etiqueta: 'Localidad', valor: sucursal.localidad || '—' },
      { etiqueta: 'Oficina', valor: sucursal.oficina || '—' },
      { etiqueta: 'Org ID', valor: sucursal.orgId === undefined ? '—' : String(sucursal.orgId) },
      { etiqueta: 'Dirección', valor: sucursal.direccion || '—' },
      { etiqueta: 'Fecha de alta', valor: formatearFecha(sucursal.fechaAlta) },
      { etiqueta: 'Observación', valor: sucursal.observacion || '—' },
    ];
  });

  readonly filtradas = computed(() => {
    const q = this.query().trim().toLowerCase();
    return this.sucursales().filter((sucursal) =>
      !q || [sucursal.codSucursalSin, sucursal.direccion, sucursal.departamento, sucursal.municipio]
        .join(' ').toLowerCase().includes(q),
    );
  });
  readonly filtradosPuntos = computed(() => {
    const q = this.queryPuntos().trim().toLowerCase();
    return this.puntosVenta().filter((punto) =>
      !q || Object.values(punto).join(' ').toLowerCase().includes(q),
    );
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
    this.vortex.listarSucursales<SucursalApiResponse[]>().pipe(
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
    this.vortex.actualizarSucursal(sucursal.codSucursalSin, datos).subscribe({
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
    this.vortex.eliminarSucursal(sucursal.codSucursalSin).subscribe({
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
      puntos: this.vortex.listarPuntosVentaSucursal<PuntoVentaSucursalApiResponse[]>(sucursal.codSucursalSin).pipe(
        catchError((error: HttpErrorResponse) => {
          this.errorPuntos.set(mensajeError(error, 'No se pudieron cargar los puntos de venta.'));
          return of([] as PuntoVentaSucursalApiResponse[]);
        }),
      ),
      codigos: this.vortex.listarCuisCufdVigentes<CuisCufdVigenteApiResponse[]>().pipe(
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
    this.toast.mostrar('Para sincronizar se deben configurar los parámetros SIAT de la empresa.');
  }
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
