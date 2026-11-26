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
  GmCelda,
} from '../../../shared/ui';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MulticentrosService } from '../../sistemas-facturadores/homologaciones/multicentros/data/multicentros.service';
import { catchError, finalize, of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { HomologacionSucursalApiResponse } from '../../sistemas-facturadores/homologaciones/multicentros/data/multicentros.model';
import { GmOpcion } from '../../../shared/ui/opciones/opciones';
import { HomologacionCatalogoService } from '../../sistemas-facturadores/homologaciones/comun/homologacion-catalogo.service';
import { DOCUMENTO_IDENTIFICACION } from '../../sistemas-facturadores/homologaciones/documento-identificacion/documento-identificacion.config';
import { ProductosTableModel } from './data/productos.model';
import { HomologacionProductosService } from '../../sistemas-facturadores/data/homologacion-productos.service';
import { UNIDADES_MEDIDA } from '../../sistemas-facturadores/homologaciones/unidades-medida/unidades-medida.config';
import { MONEDAS } from '../../sistemas-facturadores/homologaciones/monedas/monedas.config';
import { METODOS_PAGO } from '../../sistemas-facturadores/homologaciones/metodos-pago/metodos-pago.config';
import { casosEspeciales } from './data/casos_especiales.model';
import { tiposNitInvalido } from './data/tipos_nit_invalido.model';

const COLUMNAS: GmColumna<ProductosTableModel>[] = [
  { id: 'codigo', titulo: 'Código', destacar: true, movil: 'titulo' },
  {
    id: 'descripcion',
    titulo: 'Descripción',
    valor: (p) => p.descripcion,
    movil: 'subtitulo',
  },
  {
    id: 'unidad',
    titulo: 'Unidad',
    alinear: 'fin',
    valor: (p) => p.unidadDeMedida,
    etiquetaMovil: 'Unidad',
  },
  {
    id: 'cantidad',
    titulo: 'Cantidad',
    alinear: 'fin',
    valor: (p) => p.cantidad,
    etiquetaMovil: 'Cantidad',
  },
  {
    id: 'precio_unitario',
    titulo: 'Precio unitario',
    alinear: 'fin',
    valor: (p) => p.precioUnitario,
    etiquetaMovil: 'Precio unitario',
  },
  {
    id: 'monto_descuento_subtotal',
    titulo: 'Monto descuento subtotal',
    alinear: 'fin',
    valor: (p) => p.descuento,
    etiquetaMovil: 'Descuento',
  },
  { id: 'acciones', titulo: 'Acciones', ancho: '90px', alinear: 'centro', movil: 'pie-fin' },
];

const NUMERO = /^\d+(\.\d{1,2})?$/;
const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SOLO_DIGITOS = /^\d+$/;
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
    GmCelda,
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
  readonly cantidad = signal('');
  readonly precioUnitario = signal('');
  readonly descuento = signal('');
  //metodos de pago
  readonly tipoCambio = signal('');
  readonly numeroTarjeta = signal('');
  readonly subTotal = signal('');
  readonly descuentoMetodoPago = signal('');
  readonly montoTotal = signal('');

  readonly guardando = signal(false);
  readonly error = signal<string | null>(null);
  readonly errorProducto = signal<string | null>(null);

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
  readonly isLoadingMetodoPago = computed(() => {
    return this.listadoMetodosDePago.isLoading();
  });

  private readonly multicentrosService = inject(MulticentrosService);
  private readonly homologacionesCatalogosService = inject(HomologacionCatalogoService);
  private readonly multicentrosHomologados = signal<HomologacionSucursalApiResponse[]>([]);
  private readonly homologacionProductosService = inject(HomologacionProductosService);

  readonly formulario = signal({
    codigoSucursalSin: '',
    codigoTipoDocumentoSin: '',
    tipoDocumentoSin: '',
    codigoMonedaSin: '',
    tipoMonedaSin: '',
    codigoMetodoPagoSin: '',
    tipoMetodoPagoSin: '',
  });

  readonly formularioProductos = signal({
    codigoProductoSin: '',
    tipoProductoSin: '',
    codigoUnidadMedidaSin: '',
    tipoUnidadMedidaSin: '',
  });

  readonly tiposCasosEspeciales: GmOpcion[] = casosEspeciales;
  readonly tiposNitInvalido: GmOpcion[] = tiposNitInvalido;
  readonly tipoCasoEspecialSeleccionado = signal<string | null>('NINGUNO');
  readonly tipoNitInvalidoSeleccionado = signal<string | null>('POR_DEFECTO');

  private readonly listadoTiposDeDocumento = this.homologacionesCatalogosService.listar(
    DOCUMENTO_IDENTIFICACION,
    () => this.sistemaFacturador(),
  );

  private readonly listadoProductosHomologados = this.homologacionProductosService.listar(() =>
    this.sistemaFacturador(),
  );

  private readonly listadoUnidadDeMedida = this.homologacionesCatalogosService.listar(
    UNIDADES_MEDIDA,
    () => this.sistemaFacturador(),
  );

  private readonly listadoMoneda = this.homologacionesCatalogosService.listar(MONEDAS, () =>
    this.sistemaFacturador(),
  );

  private readonly listadoMetodosDePago = this.homologacionesCatalogosService.listar(
    METODOS_PAGO,
    () => this.sistemaFacturador(),
  );

  private readonly tiposDeDocumentoHomologados = computed(() =>
    this.listadoTiposDeDocumento.hasValue()
      ? (this.listadoTiposDeDocumento.value()?.data ?? [])
      : [],
  );
  private readonly productosHomologados = computed(() =>
    this.listadoProductosHomologados.hasValue()
      ? (this.listadoProductosHomologados.value()?.data ?? [])
      : [],
  );

  private readonly monedasHomologados = computed(() =>
    this.listadoMoneda.hasValue() ? (this.listadoMoneda.value()?.data ?? []) : [],
  );

  private readonly metodosDePagoHomologados = computed(() =>
    this.listadoMetodosDePago.hasValue() ? (this.listadoMetodosDePago.value()?.data ?? []) : [],
  );

  private readonly unidadesDeMedidaHomologados = computed(() =>
    this.listadoUnidadDeMedida.hasValue() ? (this.listadoUnidadDeMedida.value()?.data ?? []) : [],
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

  readonly opcionesProductos = computed<GmOpcionLista[]>(() =>
    this.productosHomologados().map((sucursal) => ({
      valor: String(sucursal.idHomologacionProducto),
      etiqueta:
        [sucursal.codigo, sucursal.descripcion]
          .map((valor) => valor?.trim())
          .filter(Boolean)
          .join(' · ') || `${sucursal.descripcion}`,
    })),
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

  readonly opcionesMetodosPago = computed<GmOpcionLista[]>(() =>
    this.metodosDePagoHomologados().map((sucursal) => ({
      valor: String(sucursal.idHomologacion),
      etiqueta:
        [sucursal.codigo, sucursal.descripcion]
          .map((valor) => valor?.trim())
          .filter(Boolean)
          .join(' · ') || `${sucursal.descripcion}`,
    })),
  );

  seleccionarSucursal(codigo: string): void {
    this.formulario.update((formulario) => ({
      ...formulario,
      codigoSucursalSin: codigo,
    }));
  }

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
    const punto = this.productosHomologados().find(
      (item) => String(item.idHomologacionProducto) === codigo,
    );
    this.formularioProductos.update((formulario) => ({
      ...formulario,
      codigoProductoSin: codigo,
      tipoProductoSin: punto?.descripcion ?? '',
    }));
  }

  seleccionarUnidadDeMedida(codigo: string): void {
    const punto = this.unidadesDeMedidaHomologados().find(
      (item) => String(item.idHomologacion) === codigo,
    );
    this.formularioProductos.update((formulario) => ({
      ...formulario,
      codigoUnidadMedidaSin: codigo,
      tipoUnidadMedidaSin: punto?.descripcion ?? '',
    }));
  }

  seleccionarTipoMoneda(codigo: string): void {
    const punto = this.monedasHomologados().find((item) => String(item.idHomologacion) === codigo);
    this.formulario.update((formulario) => ({
      ...formulario,
      codigoMonedaSin: codigo,
      tipoMonedaSin: punto?.descripcion ?? '',
    }));
  }

  seleccionarMetodoPago(codigo: string): void {
    const punto = this.metodosDePagoHomologados().find(
      (item) => String(item.idHomologacion) === codigo,
    );
    this.formulario.update((formulario) => ({
      ...formulario,
      codigoMetodoPagoSin: codigo,
      tipoMetodoPagoSin: punto?.descripcion ?? '',
    }));
  }

  readonly filasProductos = signal<ProductosTableModel[]>([]);
  readonly columnas = COLUMNAS;

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

  async onEmitir(event: Event): Promise<void> {
    event.preventDefault();
    if (this.guardando()) return;

    const error = this.validarFactura();
    this.error.set(error);
    if (error) return;

    //todo enviar la factura al backend cuando exista el servicio de emisión
    this.toast.mostrar('Pendiente emitir factura.');
  }

  private validarFactura(): string | null {
    const formulario = this.formulario();
    const requeridos: [string, string][] = [
      ['Multicentro', formulario.codigoSucursalSin],
      ['Código cliente', this.codigoCliente().trim()],
      ['Razón social', this.razonSocial().trim()],
      ['Tipo de documento', formulario.codigoTipoDocumentoSin],
      ['Número de documento', this.numeroDocumento().trim()],
      ['Periodo', this.periodo().trim()],
      ['Correo electrónico', this.correoElectronico().trim()],
      ['Tipo moneda', formulario.codigoMonedaSin],
      ['Tipo cambio', this.tipoCambio().trim()],
      ['Método pago', formulario.codigoMetodoPagoSin],
      ['Subtotal', this.subTotal().trim()],
      ['Monto total', this.montoTotal().trim()],
    ];
    const faltantes = requeridos.filter(([, valor]) => !valor).map(([campo]) => campo);
    if (faltantes.length) return `Completa los campos: ${faltantes.join(', ')}.`;

    if (!CORREO.test(this.correoElectronico().trim()))
      return 'Ingresa un correo electrónico válido.';
    const celular = this.numeroCelular().trim();
    if (celular && !SOLO_DIGITOS.test(celular))
      return 'El número celular solo debe contener dígitos.';
    const tarjeta = this.numeroTarjeta().trim();
    if (tarjeta && !SOLO_DIGITOS.test(tarjeta))
      return 'El número de tarjeta solo debe contener dígitos.';

    const numericos: [string, string][] = [
      ['Tipo cambio', this.tipoCambio().trim()],
      ['Subtotal', this.subTotal().trim()],
      ['Descuento', this.descuentoMetodoPago().trim() || '0'],
      ['Monto total', this.montoTotal().trim()],
    ];
    const invalidos = numericos.filter(([, valor]) => !NUMERO.test(valor)).map(([campo]) => campo);
    if (invalidos.length) return `Ingresa montos válidos en: ${invalidos.join(', ')}.`;
    if (Number(this.tipoCambio()) <= 0) return 'El tipo de cambio debe ser mayor a 0.';

    if (!this.filasProductos().length) return 'Adiciona al menos un producto al detalle.';
    return null;
  }

  onRemoveProducto(producto: ProductosTableModel) {
    this.filasProductos.update((filas) => filas.filter((fila) => fila.codigo !== producto.codigo));
  }

  onAddProducto() {
    const formulario = this.formularioProductos();
    const producto = this.productosHomologados().find(
      (item) => String(item.idHomologacionProducto) === formulario.codigoProductoSin,
    );
    const unidad = this.unidadesDeMedidaHomologados().find(
      (item) => String(item.idHomologacion) === formulario.codigoUnidadMedidaSin,
    );
    const cantidad = this.cantidad().trim();
    const precioUnitario = this.precioUnitario().trim();
    const descuento = this.descuento().trim() || '0';

    if (!producto || !unidad || !cantidad || !precioUnitario) {
      this.errorProducto.set(
        'Selecciona un producto, una unidad de medida e ingresa la cantidad y el precio unitario.',
      );
      return;
    }
    if (!NUMERO.test(cantidad) || Number(cantidad) <= 0) {
      this.errorProducto.set('La cantidad debe ser un número mayor a 0.');
      return;
    }
    if (!NUMERO.test(precioUnitario) || Number(precioUnitario) <= 0) {
      this.errorProducto.set('El precio unitario debe ser un número mayor a 0.');
      return;
    }
    if (!NUMERO.test(descuento) || Number(descuento) > Number(cantidad) * Number(precioUnitario)) {
      this.errorProducto.set('El descuento debe ser un número entre 0 y el subtotal del producto.');
      return;
    }
    if (this.filasProductos().some((fila) => fila.codigo === producto.codigo)) {
      this.errorProducto.set('El producto ya fue adicionado al detalle.');
      return;
    }

    this.filasProductos.update((filas) => [
      ...filas,
      {
        codigo: producto.codigo,
        descripcion: producto.descripcion,
        unidadDeMedida: unidad.descripcion,
        cantidad,
        precioUnitario,
        descuento,
      },
    ]);
    this.errorProducto.set(null);
    this.formularioProductos.set({
      codigoProductoSin: '',
      tipoProductoSin: '',
      codigoUnidadMedidaSin: '',
      tipoUnidadMedidaSin: '',
    });
    this.cantidad.set('');
    this.precioUnitario.set('');
    this.descuento.set('');
  }
}
