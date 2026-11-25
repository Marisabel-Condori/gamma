import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  GmRutaNavegacion,
  GmEncabezado,
  GmSeccion,
  GmTexto,
  GmLista,
  Toast,
  Confirmar,
  GmBoton,
  GmIcono,
  GmOpcionLista,
  GmOpciones,
  GmTabla,
  GmColumna,
} from '../../../shared/ui';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MulticentrosService } from '../../sistemas-facturadores/homologaciones/multicentros/data/multicentros.service';
import { catchError, finalize, of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import {
  HomologacionMulticentro,
  HomologacionSucursalApiResponse,
} from '../../sistemas-facturadores/homologaciones/multicentros/data/multicentros.model';
import { GmOpcion } from '../../../shared/ui/opciones/opciones';
import { HomologacionCatalogoService } from '../../sistemas-facturadores/homologaciones/comun/homologacion-catalogo.service';
import { DOCUMENTO_IDENTIFICACION } from '../../sistemas-facturadores/homologaciones/documento-identificacion/documento-identificacion.config';
import { PeriodoLibroIvaResponse } from '../../admin/libro-iva/data/libro-iva.model';
import { ProductosTableModel } from './data/productos.model';
import { HomologacionProductosService } from '../../sistemas-facturadores/data/homologacion-productos.service';
import { UNIDADES_MEDIDA } from '../../sistemas-facturadores/homologaciones/unidades-medida/unidades-medida.config';
import { MONEDAS } from '../../sistemas-facturadores/homologaciones/monedas/monedas.config';
const COLUMNAS: GmColumna<ProductosTableModel>[] = [
  { id: 'codigo', titulo: 'Código', destacar: true, movil: 'titulo' },
  {
    id: 'descripcion',
    titulo: 'Descripción',
    alinear: 'fin',
    valor: (p) => p.cantidad,
    etiquetaMovil: 'Cantidad',
  },
  {
    id: 'unidad',
    titulo: 'Unidad',
    alinear: 'fin',
    valor: (p) => p.unidadDeMedida,
    etiquetaMovil: 'Monto',
  },
  {
    id: 'cantidad',
    titulo: 'Cantidad',
    alinear: 'fin',
    valor: (p) => p.cantidad,
    etiquetaMovil: 'Monto',
  },
  {
    id: 'precio_unitario',
    titulo: 'Precio unitario',
    alinear: 'fin',
    valor: (p) => p.precioUnitario,
    etiquetaMovil: 'Monto',
  },
  {
    id: 'monto_descuento_subtotal',
    titulo: 'Monto descuento subtotal',
    alinear: 'fin',
    valor: (p) => p.descuento,
    etiquetaMovil: 'Monto',
  },
];
const EJEMPLO: ProductosTableModel[] = [];
@Component({
  selector: 'gm-impuestos.page',
  imports: [
    GmEncabezado,
    GmSeccion,
    GmTexto,
    GmBoton,
    FormsModule,
    ReactiveFormsModule,
    GmIcono,
    GmLista,
    GmOpciones,
    GmTabla,
  ],
  templateUrl: './impuestos.page.html',
  styleUrl: './impuestos.page.scss',
})
export class ImpuestosPage implements OnInit {
  //todo cambiar esto para ser parametrico por el momento listar solo los multicentros del gamma
  readonly sistemaFacturador = signal(8);

  private readonly toast = inject(Toast);
  private readonly confirmar = inject(Confirmar);
  private readonly router = inject(Router);
  readonly codigoCliente = signal('');
  readonly razonSocial = signal('');
  readonly numeroDocumento = signal('');
  readonly complemento = signal('');
  readonly periodo = signal('');
  readonly correoElectronico = signal('');
  readonly numeroCelular = signal('');
  readonly guardando = signal(false);
  readonly rutanavegacion: GmRutaNavegacion[] = [
    { etiqueta: 'Facturación' },
    { etiqueta: 'Impuestos' },
  ];
  readonly isLoadingMulticentros = signal<boolean>(true);
  readonly isLoadingTiposDeDocumento = computed(() => {
    return this.listadoTiposDeDocumento.isLoading();
  });
  readonly isLoadingProductos = computed(() => {
    return this.listadoProductosHomologados.isLoading();
  });
  readonly isLoadingUnidadesDeMedida = computed(() => {
    return this.listadoUnidadDeMedida.isLoading();
  });
  readonly isLoadingMoneda = computed(() => {
    return this.listadoMoneda.isLoading();
  });
  private readonly multicentrosService = inject(MulticentrosService);
  private readonly homologacionesCatalogosService = inject(HomologacionCatalogoService);
  readonly multicentrosHomologados = signal<HomologacionSucursalApiResponse[]>([]);
  readonly formulario = signal({
    codigoSucursalSin: '',
    codigoTipoDocumentoSin: '',
    tipoDocumentoSin: '',
    codigoProductoSin: '',
    tipoProductoSin: '',
    codigoUnidadMedidaSin: '',
    tipoUnidadMedidaSin: '',
    codigoMonedaSin: '',
    tipoMonedaSin: '',
  });
  readonly opcionesMulticentros = computed<GmOpcionLista[]>(() =>
    this.multicentrosHomologados().map((sucursal) => ({
      valor: String(sucursal.idHomSucursal),
      etiqueta:
        [sucursal.codigoMulticentro, sucursal.descripcion]
          .map((valor) => valor?.trim())
          .filter(Boolean)
          .join(' · ') || `Sucursal ${sucursal.descripcion}`,
    })),
  );
  readonly tiposCasosEspeciales: GmOpcion[] = [
    { valor: 'NINGUNO', etiqueta: 'Ninguno' },
    { valor: 'EXTRANJERO_NO_INSCRITO', etiqueta: '99001', descripcion: 'Extranjero no inscrito' },
    { valor: 'CONTROL_TRIBUTARIO', etiqueta: '99002', descripcion: 'Control tributario' },
    { valor: 'VENTAS_MENORES', etiqueta: '99003', descripcion: 'Ventas menores' },
  ];
  readonly tipoCasoEspecialSeleccionado = signal<string | null>('NINGUNO');
  readonly tiposNitInvalido: GmOpcion[] = [
    { valor: 'POR_DEFECTO', etiqueta: 'Por defecto' },
    { valor: 'AUTORIZADO', etiqueta: 'Autorizado' },
  ];
  readonly tipoNitInvalidoSeleccionado = signal<string | null>('POR_DEFECTO');
  private readonly listadoTiposDeDocumento = this.homologacionesCatalogosService.listar(
    DOCUMENTO_IDENTIFICACION,
    () => this.sistemaFacturador(),
  );
  private readonly tiposDeDocumentoHomologados = computed(() =>
    this.listadoTiposDeDocumento.hasValue()
      ? (this.listadoTiposDeDocumento.value()?.data ?? [])
      : [],
  );
  readonly opcionesTiposDeDocumento = computed<GmOpcionLista[]>(() =>
    this.tiposDeDocumentoHomologados().map((sucursal) => ({
      valor: String(sucursal.idHomologacion),
      etiqueta:
        [sucursal.codigo, sucursal.descripcion]
          .map((valor) => valor?.trim())
          .filter(Boolean)
          .join(' · ') || `${sucursal.descripcion}`,
    })),
  );
  readonly periodos = signal<ProductosTableModel[]>([]);

  readonly columnas = COLUMNAS;
  seleccionarSucursal(codigo: string): void {
    const punto = this.multicentrosHomologados().find(
      (item) => String(item.idHomSucursal) === codigo,
    );
    this.formulario.update((formulario) => ({
      ...formulario,
      codigoPuntoVentaSin: codigo,
      puntoVentaSin: punto?.nombrePuntoVenta ?? '',
    }));
  }

  private readonly homologacionProductosService = inject(HomologacionProductosService);
  private readonly listadoProductosHomologados = this.homologacionProductosService.listar(() =>
    this.sistemaFacturador(),
  );
  private readonly homologacionesProductos = computed(() =>
    this.listadoProductosHomologados.hasValue()
      ? (this.listadoProductosHomologados.value()?.data ?? [])
      : [],
  );
  readonly opcionesProductos = computed<GmOpcionLista[]>(() =>
    this.homologacionesProductos().map((sucursal) => ({
      valor: String(sucursal.idHomologacionProducto),
      etiqueta:
        [sucursal.codigo, sucursal.descripcion]
          .map((valor) => valor?.trim())
          .filter(Boolean)
          .join(' · ') || `${sucursal.descripcion}`,
    })),
  );
  seleccionarTipoDocumento(codigo: string): void {
    const punto = this.tiposDeDocumentoHomologados().find(
      (item) => String(item.idHomologacion) === codigo,
    );
    this.formulario.update((formulario) => ({
      ...formulario,
      codigoTipoDocumentoSin: codigo,
      tipoDocumentoSin: punto?.descripcion ?? '',
    }));
  }
  seleccionarProducto(codigo: string): void {
    const punto = this.homologacionesProductos().find(
      (item) => String(item.idHomologacionProducto) === codigo,
    );
    this.formulario.update((formulario) => ({
      ...formulario,
      codigoProductoSin: codigo,
      tipoProductoSin: punto?.descripcion ?? '',
    }));
  }
  seleccionarUnidadDeMedida(codigo: string): void {
    const punto = this.unidadesDeMedidaHomologados().find(
      (item) => String(item.idHomologacion) === codigo,
    );
    this.formulario.update((formulario) => ({
      ...formulario,
      codigoUnidadMedidaSin: codigo,
      tipoUnidadMedidaSin: punto?.descripcion ?? '',
    }));
  }
  seleccionarTipoMoneda(codigo: string): void {
    const punto = this.monedasHomologados().find((item) => String(item.idHomologacion) === codigo);
    console.log(punto);
    this.formulario.update((formulario) => ({
      ...formulario,
      codigoMonedaSin: codigo,
      tipoMonedaSin: punto?.descripcion ?? '',
    }));
  }

  private readonly listadoUnidadDeMedida = this.homologacionesCatalogosService.listar(
    UNIDADES_MEDIDA,
    () => this.sistemaFacturador(),
  );
  private readonly unidadesDeMedidaHomologados = computed(() =>
    this.listadoUnidadDeMedida.hasValue() ? (this.listadoUnidadDeMedida.value()?.data ?? []) : [],
  );
  readonly opcionesUnidadesDeMedida = computed<GmOpcionLista[]>(() =>
    this.unidadesDeMedidaHomologados().map((sucursal) => ({
      valor: String(sucursal.idHomologacion),
      etiqueta:
        [sucursal.codigo, sucursal.descripcion]
          .map((valor) => valor?.trim())
          .filter(Boolean)
          .join(' · ') || `${sucursal.descripcion}`,
    })),
  );

  private readonly listadoMoneda = this.homologacionesCatalogosService.listar(MONEDAS, () =>
    this.sistemaFacturador(),
  );
  private readonly monedasHomologados = computed(() =>
    this.listadoMoneda.hasValue() ? (this.listadoMoneda.value()?.data ?? []) : [],
  );
  readonly opcionesMonedas = computed<GmOpcionLista[]>(() =>
    this.monedasHomologados().map((sucursal) => ({
      valor: String(sucursal.idHomologacion),
      etiqueta:
        [sucursal.codigo, sucursal.descripcion]
          .map((valor) => valor?.trim())
          .filter(Boolean)
          .join(' · ') || `${sucursal.descripcion}`,
    })),
  );

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.multicentrosService
      .listar(this.sistemaFacturador())
      .pipe(
        finalize(() => {
          this.isLoadingMulticentros.set(false);
        }),
        catchError((error: HttpErrorResponse) => {
          this.toast.mostrar('No se pudieron cargar las homologaciones.');
          return of(null);
        }),
      )
      .subscribe((respuestas) => {
        if (!respuestas) return;
        const filas = respuestas.filter(
          (respuesta) => respuesta.idSistema === this.sistemaFacturador(),
        );
        this.multicentrosHomologados.set(filas);
      });
  }

  async guardar(event: Event): Promise<void> {
    event.preventDefault();
  }

  onAddProducto() {}
}
