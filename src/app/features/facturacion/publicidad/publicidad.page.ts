import { Component, computed, inject, signal } from '@angular/core';
import {
  GmRutaNavegacion,
  GmEncabezado,
  GmOpcionesControl,
  GmBoton,
  GmIcono,
  GmTextoControl,
  Toast,
  GmTabla,
  GmColumna,
  GmTexto,
  GmCelda,
} from '../../../shared/ui';
import { GmOpcion } from '../../../shared/ui/opciones/opciones';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CuentaCliente } from '../../../core/models/cliente.model';
import { buscarCuentas } from '../comun/cuentas.data';
import { GmSeleccionarCuenta } from '../comun/seleccionar-cuenta/seleccionar-cuenta';
import { opcionesBusqueda } from '../../../core/models/opciones_busqueda.model';
import { ServiciosTableModel } from '../../../core/models/servicios-table.model';

export const COLUMNAS: GmColumna<ServiciosTableModel>[] = [
  {
    id: 'codigoServicio',
    titulo: 'CÓDIGO SERVICIO',
    destacar: true,
    movil: 'titulo',
    valor: (p) => p.codigoServicio,
  },
  {
    id: 'unidadDeMedida',
    titulo: 'UNIDAD DE MEDIDA',
    valor: (p) => p.unidadDeMedida,
    movil: 'subtitulo',
  },
  {
    id: 'descripcion',
    titulo: 'DESCRIPCIÓN',
    alinear: 'fin',
    valor: (p) => p.descripcion,
    etiquetaMovil: 'Unidad',
  },
  {
    id: 'monto',
    titulo: 'MONTO',
    alinear: 'fin',
    valor: (p) => p.monto,
    etiquetaMovil: 'Cantidad',
  },
];

export type CampoFila = 'codigoServicio' | 'unidadDeMedida' | 'descripcion' | 'monto';

export const CAMPOS_FILA: { campo: CampoFila; nombre: string }[] = [
  { campo: 'codigoServicio', nombre: 'código de servicio' },
  { campo: 'unidadDeMedida', nombre: 'unidad de medida' },
  { campo: 'descripcion', nombre: 'descripción' },
  { campo: 'monto', nombre: 'monto válido' },
];

export function campoValido(fila: ServiciosTableModel, campo: CampoFila): boolean {
  if (campo === 'monto') {
    const monto = Number(fila.monto);
    return fila.monto?.toString().trim() !== '' && Number.isFinite(monto) && monto > 0;
  }
  return !!fila[campo]?.trim();
}

@Component({
  selector: 'gm-publicidad.page',
  imports: [
    ReactiveFormsModule,
    GmEncabezado,
    GmOpcionesControl,
    GmBoton,
    GmIcono,
    GmTextoControl,
    GmTabla,
    GmTexto,
    GmCelda,
    GmSeleccionarCuenta,
  ],
  templateUrl: './publicidad.page.html',
  styleUrl: './publicidad.page.scss',
})
export class PublicidadPage {
  readonly rutanavegacion: GmRutaNavegacion[] = [
    { etiqueta: 'Facturación' },
    { etiqueta: 'Publicidad' },
  ];
  private readonly fb = inject(NonNullableFormBuilder);
  readonly formulario = this.fb.group({
    tipoBusqueda: ['CUENTA', Validators.required],
    busqueda: ['', Validators.required],
  });
  readonly tiposOpcionesBusqueda: GmOpcion[] = opcionesBusqueda;
  readonly cliente = signal<CuentaCliente | null>(null);
  readonly cuentasEncontradas = signal<CuentaCliente[] | null>(null);
  readonly buscando = signal(false);
  private readonly toast = inject(Toast);

  readonly filasProductos = signal<ServiciosTableModel[]>([
    {
      idServicio: 1,
      codigoServicio: 'FODPUB',
      idUnidadDeMedida: 1,
      unidadDeMedida: 'Unidad (Servicios)',
      descripcion: '',
      monto: '',
    },
  ]);
  readonly columnas = COLUMNAS;
  readonly intentoEmitir = signal(false);
  readonly erroresEmision = computed(() => {
    const errores: string[] = [];
    const cliente = this.cliente();
    if (!cliente) {
      errores.push('Busca una cuenta o documento antes de emitir.');
    } else {
      const faltantes = [
        !cliente.razonSocial?.trim() && 'razón social',
        !cliente.codigoCliente?.trim() && 'código de cliente',
        !cliente.codigoCuenta?.trim() && 'código de cuenta',
      ].filter(Boolean);
      if (faltantes.length) errores.push(`Faltan datos del cliente: ${faltantes.join(', ')}.`);
    }
    const filas = this.filasProductos();
    if (!filas.length) errores.push('Adiciona al menos un servicio.');
    filas.forEach((fila, i) => {
      const faltantes = CAMPOS_FILA.filter((c) => !campoValido(fila, c.campo)).map((c) => c.nombre);
      if (faltantes.length) {
        errores.push(`Ingresa una ${faltantes.join(', ')}.`);
      }
    });
    return errores;
  });

  campoInvalido(fila: ServiciosTableModel, campo: CampoFila): boolean {
    return this.intentoEmitir() && !campoValido(fila, campo);
  }

  onEmitir() {
    this.intentoEmitir.set(true);
    if (this.erroresEmision().length) return;

    const factura = { cliente: this.cliente(), servicios: this.filasProductos() };
    console.log('Factura de publicidad a emitir:', factura);
    this.toast.mostrar('Pendiente emitir factura.');
  }

  async onSubmit() {
    this.formulario.markAllAsTouched();
    if (this.formulario.invalid) return;
    const { tipoBusqueda, busqueda } = this.formulario.getRawValue();

    this.cliente.set(null);
    this.buscando.set(true);
    let cuentas: CuentaCliente[];
    try {
      cuentas = await buscarCuentas(tipoBusqueda, busqueda);
    } catch {
      this.toast.mostrar('No se pudo buscar la cuenta. Intenta nuevamente.');
      return;
    } finally {
      this.buscando.set(false);
    }

    if (!cuentas.length) {
      const que = tipoBusqueda === 'DOCUMENTO' ? 'el documento' : 'la cuenta';
      this.toast.mostrar(`No se encontraron resultados para ${que} ${busqueda.trim()}.`);
    } else if (cuentas.length === 1) {
      this.elegirCuenta(cuentas[0]);
    } else {
      this.cuentasEncontradas.set(cuentas);
    }
  }

  elegirCuenta(cuenta: CuentaCliente) {
    this.cliente.set(cuenta);
    this.cuentasEncontradas.set(null);
  }

  onLimpiar() {
    this.formulario.reset();
    this.cliente.set(null);
    this.cuentasEncontradas.set(null);
    this.intentoEmitir.set(false);
    this.filasProductos.update((filas) => filas.map((f) => ({ ...f, descripcion: '', monto: '' })));
  }
  actualizarFila(idServicio: number, cambios: Partial<ServiciosTableModel>) {
    this.filasProductos.update((filas) =>
      filas.map((f) => (f.idServicio === idServicio ? { ...f, ...cambios } : f)),
    );
  }
}
