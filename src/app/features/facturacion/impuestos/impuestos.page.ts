import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  GmRutaNavegacion,
  GmEncabezado,
  GmSeccion,
  Toast,
  GmBoton,
  GmIcono,
  GmOpcionLista,
  GmTabla,
  GmColumna,
  GmCelda,
  GmTextoControl,
  GmListaControl,
  GmOpcionesControl,
  GmTarjetaControl,
} from '../../../shared/ui';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MulticentrosService } from '../../sistemas-facturadores/homologaciones/multicentros/data/multicentros.service';
import { catchError, combineLatest, finalize, of, startWith } from 'rxjs';
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
const SOLO_DIGITOS = /^\d+$/;
const MENSAJE_MONTO = { pattern: 'Número con hasta 2 decimales' };
const MENSAJE_DIGITOS = { pattern: 'Solo dígitos' };
const mayorACero: ValidatorFn = (control: AbstractControl): ValidationErrors | null =>
  control.value === '' || Number(control.value) > 0 ? null : { mayorACero: true };
const descuentoDentroDelSubtotal: ValidatorFn = (
  grupo: AbstractControl,
): ValidationErrors | null => {
  const { cantidad, precioUnitario, descuento } = grupo.value;
  if (!cantidad || !precioUnitario || !descuento) return null;
  return Number(descuento) > Number(cantidad) * Number(precioUnitario)
    ? { descuentoExcede: true }
    : null;
};

@Component({
  selector: 'gm-impuestos.page',
  imports: [
    ReactiveFormsModule,
    GmEncabezado,
    GmSeccion,
    GmBoton,
    GmIcono,
    GmTabla,
    GmCelda,
    GmTextoControl,
    GmListaControl,
    GmOpcionesControl,
    GmTarjetaControl,
  ],
  templateUrl: './impuestos.page.html',
  styleUrl: './impuestos.page.scss',
})
export class ImpuestosPage implements OnInit {
  //todo cambiar esto para ser parametrico por el momento listar solo los multicentros del gamma
  readonly sistemaFacturador = signal(8);

  private readonly toast = inject(Toast);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly multicentrosService = inject(MulticentrosService);
  private readonly homologacionesCatalogosService = inject(HomologacionCatalogoService);
  private readonly homologacionProductosService = inject(HomologacionProductosService);

  readonly mensajeMonto = MENSAJE_MONTO;
  readonly mensajeDigitos = MENSAJE_DIGITOS;
  readonly mensajeMayorACero = { ...MENSAJE_MONTO, mayorACero: 'Debe ser mayor a 0' };

  readonly rutanavegacion: GmRutaNavegacion[] = [
    { etiqueta: 'Facturación' },
    { etiqueta: 'Impuestos' },
  ];

  readonly formulario = this.fb.group({
    codigoSucursal: ['', Validators.required],
    codigoCliente: ['', Validators.required],
    tipoCasoEspecial: ['NINGUNO', Validators.required],
    razonSocial: ['', Validators.required],
    codigoTipoDocumento: ['', Validators.required],
    numeroDocumento: ['', Validators.required],
    complemento: ['', Validators.maxLength(2)],
    tipoNitInvalido: ['POR_DEFECTO', Validators.required],
    periodo: ['', Validators.required],
    correoElectronico: ['', Validators.email],
    numeroCelular: ['', Validators.pattern(SOLO_DIGITOS)],
    productos: this.fb.array<ProductosTableModel>([], Validators.required),
    codigoMoneda: ['', Validators.required],
    tipoCambio: ['', [Validators.required, Validators.pattern(NUMERO), mayorACero]],
    codigoMetodoPago: ['', Validators.required],
    numeroTarjeta: ['', Validators.pattern(SOLO_DIGITOS)],
    subTotal: ['', [Validators.required, Validators.pattern(NUMERO)]],
    descuento: ['', Validators.pattern(NUMERO)],
    montoTotal: ['', [Validators.required, Validators.pattern(NUMERO)]],
  });
  readonly formularioProducto = this.fb.group(
    {
      codigoProducto: ['', Validators.required],
      codigoUnidadMedida: ['', Validators.required],
      cantidad: ['', [Validators.required, Validators.pattern(NUMERO), mayorACero]],
      precioUnitario: ['', [Validators.required, Validators.pattern(NUMERO), mayorACero]],
      descuento: ['', Validators.pattern(NUMERO)],
    },
    { validators: descuentoDentroDelSubtotal },
  );

  get productos() {
    return this.formulario.controls.productos;
  }

  readonly filasProductos = toSignal(this.productos.valueChanges, {
    initialValue: this.productos.getRawValue(),
  });
  readonly columnas = COLUMNAS;

  readonly guardando = signal(false);
  readonly intentoEmitir = signal(false);
  readonly errorProducto = signal<string | null>(null);

  readonly tiposCasosEspeciales: GmOpcion[] = casosEspeciales;
  readonly tiposNitInvalido: GmOpcion[] = tiposNitInvalido;

  readonly isLoadingMulticentros = signal<boolean>(true);
  readonly isLoadingTiposDeDocumento = computed(() => this.listadoTiposDeDocumento.isLoading());
  readonly isLoadingProductos = computed(() => this.listadoProductosHomologados.isLoading());
  readonly isLoadingUnidadesDeMedida = computed(() => this.listadoUnidadDeMedida.isLoading());
  readonly isLoadingMoneda = computed(() => this.listadoMoneda.isLoading());
  readonly isLoadingMetodoPago = computed(() => this.listadoMetodosDePago.isLoading());

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

  private readonly multicentrosHomologados = signal<HomologacionSucursalApiResponse[]>([]);
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

  readonly opcionesMulticentros = computed<GmOpcionLista[]>(() =>
    this.multicentrosHomologados().map((sucursal) => ({
      valor: String(sucursal.idHomSucursal),
      etiqueta:
        [sucursal.descripcion]
          .map((valor) => valor?.trim())
          .filter(Boolean)
          .join(' · ') || `Sucursal ${sucursal.descripcion}`,
    })),
  );
  readonly opcionesTiposDeDocumento = computed<GmOpcionLista[]>(() =>
    this.tiposDeDocumentoHomologados().map((tipo) => ({
      valor: String(tipo.idHomologacion),
      etiqueta: etiquetaDe(tipo.codigo, tipo.descripcion),
    })),
  );
  readonly opcionesProductos = computed<GmOpcionLista[]>(() =>
    this.productosHomologados().map((producto) => ({
      valor: String(producto.idHomologacionProducto),
      etiqueta: etiquetaDe(producto.codigo, producto.descripcion),
    })),
  );
  readonly opcionesUnidadesDeMedida = computed<GmOpcionLista[]>(() =>
    this.unidadesDeMedidaHomologados().map((unidad) => ({
      valor: String(unidad.idHomologacion),
      etiqueta: etiquetaDe(unidad.codigo, unidad.descripcion),
    })),
  );
  readonly opcionesMonedas = computed<GmOpcionLista[]>(() =>
    this.monedasHomologados().map((moneda) => ({
      valor: String(moneda.idHomologacion),
      etiqueta: etiquetaDe(moneda.descripcion, undefined),
    })),
  );
  readonly opcionesMetodosPago = computed<GmOpcionLista[]>(() =>
    this.metodosDePagoHomologados().map((metodo) => ({
      valor: String(metodo.idHomologacion),
      etiqueta: etiquetaDe(metodo.codigo, metodo.descripcion),
    })),
  );
  private destroyRef = inject(DestroyRef);
  ngOnInit(): void {
    this.loadListeners();
    this.loadData();
  }

  loadListeners() {
    this.formulario
      .get('codigoMoneda')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((nuevoTipoCambio) => {
        const moneda = this.monedasHomologados().find(
          (e) => e.idHomologacion === Number(nuevoTipoCambio),
        );
        const tipoCambio = moneda?.codigo;
        if (!tipoCambio) return;
        this.formulario.get('tipoCambio')?.setValue(tipoCambio);
      });
  }

  loadData() {
    this.multicentrosService
      .listar(this.sistemaFacturador())
      .pipe(
        finalize(() => {
          this.isLoadingMulticentros.set(false);
        }),
        catchError(() => {
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

  onEmitir(): void {
    if (this.guardando()) return;
    this.intentoEmitir.set(true);
    this.formulario.markAllAsTouched();
    if (this.formulario.invalid) return;

    const valores = this.formulario.getRawValue();
    const etiqueta = (opciones: GmOpcionLista[], valor: string) =>
      opciones.find((opcion) => opcion.valor === valor)?.etiqueta ?? '';
    const factura = {
      ...valores,
      sucursal: etiqueta(this.opcionesMulticentros(), valores.codigoSucursal),
      tipoDocumento: etiqueta(this.opcionesTiposDeDocumento(), valores.codigoTipoDocumento),
      moneda: etiqueta(this.opcionesMonedas(), valores.codigoMoneda),
      metodoPago: etiqueta(this.opcionesMetodosPago(), valores.codigoMetodoPago),
    };
    console.log('Factura de impuestos a emitir:', factura);

    //todo enviar la factura al backend cuando exista el servicio de emisión
    this.toast.mostrar('Pendiente emitir factura.');
  }

  onAddProducto(): void {
    const grupo = this.formularioProducto;
    grupo.markAllAsTouched();
    if (grupo.hasError('descuentoExcede')) {
      this.errorProducto.set('El descuento no puede ser mayor a cantidad × precio unitario.');
      return;
    }
    if (grupo.invalid) {
      this.errorProducto.set(null);
      return;
    }

    const valores = grupo.getRawValue();
    const producto = this.productosHomologados().find(
      (item) => String(item.idHomologacionProducto) === valores.codigoProducto,
    );
    const unidad = this.unidadesDeMedidaHomologados().find(
      (item) => String(item.idHomologacion) === valores.codigoUnidadMedida,
    );
    if (!producto || !unidad) return;
    //Para validar que solo un tipo de producto se pueda ingresar en la tabla de detalle de productos
    /*
    if (this.productos.getRawValue().some((fila) => fila.codigo === producto.codigo)) {
      this.errorProducto.set('El producto ya fue adicionado al detalle.');
      return;
    }*/

    this.productos.push(
      this.fb.control<ProductosTableModel>({
        idHomologacionProducto: producto.idHomologacionProducto,
        codigo: producto.codigo,
        descripcion: producto.descripcion,
        idUnidadMedida: unidad.idHomologacion,
        unidadDeMedida: unidad.descripcion,
        cantidad: valores.cantidad,
        precioUnitario: valores.precioUnitario,
        descuento: valores.descuento || '0',
      }),
    );
    this.errorProducto.set(null);
    grupo.reset();
  }

  onRemoveProducto(producto: ProductosTableModel): void {
    const indice = this.productos
      .getRawValue()
      .findIndex((fila) => fila.codigo === producto.codigo);
    if (indice >= 0) this.productos.removeAt(indice);
  }
}

function etiquetaDe(codigo: string | undefined, descripcion: string | undefined): string {
  return (
    [codigo, descripcion]
      .map((valor) => valor?.trim())
      .filter(Boolean)
      .join(' · ') || `${descripcion}`
  );
}
