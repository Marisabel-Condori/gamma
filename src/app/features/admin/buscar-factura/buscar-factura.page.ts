import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  GmBoton,
  GmCelda,
  GmColumna,
  GmEncabezado,
  GmLista,
  GmFecha,
  GmOpcionLista,
  GmRutaNavegacion,
  GmSeccion,
  GmTabla,
  GmTexto,
  Toast,
} from '../../../shared/ui';
import { DetalleFacturaResponse, FacturaResponse, FiltroFacturas } from './data/facturas.model';
import { GmDetalleFactura } from './detalle-factura/detalle-factura';

type Factura = FacturaResponse;

const COLUMNAS: GmColumna<Factura>[] = [
  { id: 'origen', titulo: 'Origen', etiquetaMovil: 'Origen' },
  { id: 'recepcion', titulo: 'Recepción', movil: 'esquina' },
  { id: 'numeroFactura', titulo: 'Nro. factura', etiquetaMovil: 'Nro. factura' },
  { id: 'razonSocial', titulo: 'Razón social', destacar: true, movil: 'titulo' },
  { id: 'numeroDocumento', titulo: 'Nro. documento', etiquetaMovil: 'Nro. documento' },
  { id: 'tipoDocumento', titulo: 'Tipo', etiquetaMovil: 'Tipo documento' },
  { id: 'fecha', titulo: 'Fecha', sinSalto: true, movil: 'pie', etiquetaMovil: 'Fecha' },
  { id: 'cuf', titulo: 'CUF', recortar: true, ancho: '220px', etiquetaMovil: 'CUF' },
  {
    id: 'montoTotal',
    titulo: 'Monto total',
    alinear: 'fin',
    sinSalto: true,
    valor: (factura) => `Bs ${factura.montoTotal.toFixed(2)}`,
    movil: 'subtitulo',
  },
  { id: 'estado', titulo: 'Estado', etiquetaMovil: 'Estado' },
  { id: 'tipoEmision', titulo: 'Emisión', etiquetaMovil: 'Emisión' },
  { id: 'usuario', titulo: 'Usuario', etiquetaMovil: 'Usuario' },
  { id: 'acciones', titulo: 'Acciones', ancho: '210px', fijaDerecha: true, movil: 'pie-fin' },
];

const TODOS = 'TODOS';

const SIAT_CONSULTA_QR = 'https://siat.impuestos.gob.bo/consulta/QR';
const NIT_EMISOR = '1020703023';

// Temporal: fila de ejemplo con mis datos Marisabel...
const EJEMPLO: Factura = {
  idFactura: 1,
  origen: 'BANCA',
  recepcion: 'VALIDADA',
  numeroFactura: '23908832',
  razonSocial: 'MARISABEL CONDORI CANO',
  numeroDocumento: '10928881',
  tipoDocumento: 'CI',
  fecha: '2026/10/25 09:17:17',
  cuf: '45D6DEA7127982ABCCD29A9D3DFCB25BCB3A6B6C29267A3DE08B4BF74',
  montoTotal: 10,
  estado: 'OK',
  tipoEmision: 'ONLINE',
  usuario: '1',
};

const EJEMPLO_DETALLE: DetalleFacturaResponse = {
  idFactura: 1,
  fecha: '2026/10/25 09:17:17',
  numeroFactura: '23908832',
  razonSocial: 'MARISABEL CONDORI CANO',
  tipoDocumento: 'CI',
  numeroDocumento: '10928881',
  complemento: '',
  descuento: 0,
  montoTotal: 10,
  montoSujetoIva: 10,
  sistema: 'BANCA',
  transaccion: 'COB_242791896',
  sucursal: 'Multicentro Tower',
  puntoVenta: 'BANCO UNION',
  items: [
    {
      codigo: '24',
      descripcion: 'Recarga Prepago - 71204974 - GSM - BONIFICACION BS. 10',
      cantidad: 1,
      precio: 10,
      subtotal: 10,
    },
  ],
  contactos: [
    { tipo: 'CELULAR', valor: '71204974' },
    { tipo: 'EMAIL', valor: 'mari.17ymy@gmail.com' },
  ],
  mensajes: [],
};

const ORIGENES: GmOpcionLista[] = [
  'TODOS',
  'GAMMA',
  'ALQUILER',
  'SICO',
  'ZSMART',
  'RECINT',
  'SEES',
  'SIADIN',
  'MASIVO',
  'BANCA',
  'TTVENTAS',
].map((origen) => ({ valor: origen, etiqueta: origen }));

const RECEPCIONES: GmOpcionLista[] = ['TODOS', 'VALIDA', 'NO VALIDA', 'OFFLINE NOK', 'ANULADO'].map(
  (recepcion) => ({
    valor: recepcion,
    etiqueta: recepcion,
  }),
);

const FILTRO_INICIAL: FiltroFacturas = {
  origen: TODOS,
  recepcion: TODOS,
  numeroFactura: '',
  razonSocial: '',
  numeroDocumento: '',
  periodo: '',
  cuf: '',
};

@Component({
  selector: 'gm-buscar-factura-page',
  imports: [GmEncabezado, GmSeccion, GmTexto, GmLista, GmFecha, GmBoton, GmTabla, GmCelda, GmDetalleFactura],
  templateUrl: './buscar-factura.page.html',
  styleUrl: './buscar-factura.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'gm-pagina' },
})
export class BuscarFacturaPage {
  private readonly toast = inject(Toast);

  readonly columnas = COLUMNAS;
  readonly origenes = ORIGENES;
  readonly recepciones = RECEPCIONES;

  readonly rutanavegacion: GmRutaNavegacion[] = [
    { etiqueta: 'Admin' },
    { etiqueta: 'Buscar factura' },
  ];

  readonly filtro = signal<FiltroFacturas>({ ...FILTRO_INICIAL });
  readonly facturas = signal<Factura[]>([]);
  readonly buscado = signal(false);
  readonly detalle = signal<DetalleFacturaResponse | null>(null);

  readonly vacio = computed(() =>
    this.buscado()
      ? 'No se encontraron facturas con esos filtros.'
      : 'Completa los filtros y presiona Buscar.',
  );

  campo<K extends keyof FiltroFacturas>(nombre: K, valor: FiltroFacturas[K]): void {
    this.filtro.update((f) => ({ ...f, [nombre]: valor }));
  }

  buscar(event: Event): void {
    event.preventDefault();
    this.facturas.set([EJEMPLO]);
    this.buscado.set(true);
  }

  limpiar(): void {
    this.filtro.set({ ...FILTRO_INICIAL });
    this.facturas.set([]);
    this.buscado.set(false);
  }

  urlSiat(factura: Factura): string {
    const parametros = new URLSearchParams({ nit: NIT_EMISOR, cuf: factura.cuf, numero: factura.numeroFactura, t: '2' });
    return `${SIAT_CONSULTA_QR}?${parametros}`;
  }

  verDetalle(factura: Factura): void {
    this.detalle.set(EJEMPLO_DETALLE);
  }

  accion(nombre: string, factura: Factura): void {
    this.toast.mostrar(`Pendiente ${nombre}.`);
  }
}
