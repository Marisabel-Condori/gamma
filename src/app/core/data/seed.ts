import { HomologacionProductoResponse, SistemaResponse } from '../models/gamma.models';

const SISTEMAS = [
  { codigo: 'ZSMART', descripcion: 'ZSMART' },
  { codigo: 'TTVENTAS', descripcion: 'TTVENTAS' },
  { codigo: 'SICO', descripcion: 'Sistema de Cobranza Entel' },
  { codigo: 'SIADIN', descripcion: 'SIADIN' },
  { codigo: 'SEES', descripcion: 'Servicios Especiales' },
  { codigo: 'RECINT', descripcion: 'Recarga Internacional' },
  { codigo: 'MASIVO', descripcion: 'Proceso Masivo de Facturas Postpago' },
  { codigo: 'GARAN', descripcion: 'GARAN' },
  { codigo: 'BANCA', descripcion: 'Transacciones desde el WS de la Banca' },
] as const;

const MUESTRA_ZSMART = [
  {
    hora: '13:37:55',
    codigoEntel: '1',
    productoEntel: 'CELULARES',
    codigoSin: '99100',
    productoSin: 'Otros productos o servicios alcanzados por el IVA',
  },
  {
    hora: '13:38:58',
    codigoEntel: '10',
    productoEntel: 'MANUALES',
    codigoSin: '99100',
    productoSin: 'Otros productos o servicios alcanzados por el IVA',
  },
  {
    hora: '13:39:06',
    codigoEntel: '9',
    productoEntel: 'ANTENAS',
    codigoSin: '99100',
    productoSin: 'Otros productos o servicios alcanzados por el IVA',
  },
  {
    hora: '13:39:13',
    codigoEntel: '8',
    productoEntel: 'BATERÍAS',
    codigoSin: '99100',
    productoSin: 'Otros productos o servicios alcanzados por el IVA',
  },
  {
    hora: '13:40:12',
    codigoEntel: '7',
    productoEntel: 'CARGADORES',
    codigoSin: '99100',
    productoSin: 'Otros productos o servicios alcanzados por el IVA',
  },
  {
    hora: '13:40:26',
    codigoEntel: '67',
    productoEntel: 'IPTV',
    codigoSin: '84190',
    productoSin: 'Otros servicios de telecomunicaciones',
  },
  {
    hora: '13:40:38',
    codigoEntel: '66',
    productoEntel: 'EQUIPOS INTERNET',
    codigoSin: '99100',
    productoSin: 'Otros productos o servicios alcanzados por el IVA',
  },
  {
    hora: '13:40:46',
    codigoEntel: '65',
    productoEntel: 'MATERIAL PAPELBOL',
    codigoSin: '99100',
    productoSin: 'Otros productos o servicios alcanzados por el IVA',
  },
  {
    hora: '13:40:55',
    codigoEntel: '64',
    productoEntel: 'EQUIPOS QUIPUS',
    codigoSin: '99100',
    productoSin: 'Otros productos o servicios alcanzados por el IVA',
  },
  {
    hora: '13:41:03',
    codigoEntel: '63',
    productoEntel: 'SIM CARD ÚNICO',
    codigoSin: '99100',
    productoSin: 'Otros productos o servicios alcanzados por el IVA',
  },
] as const;

const PRODUCTOS_EXTRA = [
  'ROUTER',
  'MODEM',
  'CABLE',
  'DECODIFICADOR',
  'SMART TV',
  'TABLET',
  'AUDÍFONOS',
  'CHIP',
  'RECARGAS',
  'PLAN POSTPAGO',
] as const;

export interface GammaData {
  sistemas: SistemaResponse[];
  homologaciones: HomologacionProductoResponse[];
}

export function createSeed(): GammaData {
  const sistemas: SistemaResponse[] = SISTEMAS.map((sistema) => ({
    ...sistema,
    id: sistema.codigo,
  }));

  return {
    sistemas,
    homologaciones: createHomologaciones(),
  };
}

function createHomologaciones(): HomologacionProductoResponse[] {
  const rows = MUESTRA_ZSMART.map((item, index) =>
    homologacion({
      sistemaId: 'ZSMART',
      index,
      fecha: '08/03/2022',
      ...item,
    }),
  );

  for (let index = 0; index < 84; index += 1) {
    const producto = PRODUCTOS_EXTRA[index % PRODUCTOS_EXTRA.length];
    const day = String(9 + Math.floor(index / 20)).padStart(2, '0');
    const minute = String(index % 60).padStart(2, '0');
    const second = String((index * 3) % 60).padStart(2, '0');
    rows.push(
      homologacion({
        sistemaId: 'ZSMART',
        index: MUESTRA_ZSMART.length + index,
        fecha: `${day}/03/2022`,
        hora: `14:${minute}:${second}`,
        codigoEntel: String(120 + index),
        productoEntel: producto,
        codigoSin: index % 7 === 0 ? '84190' : '99100',
        productoSin:
          index % 7 === 0
            ? 'Otros servicios de telecomunicaciones'
            : 'Otros productos o servicios alcanzados por el IVA',
      }),
    );
  }

  return rows;
}

function homologacion(data: {
  sistemaId: string;
  index: number;
  fecha: string;
  hora: string;
  codigoEntel: string;
  productoEntel: string;
  codigoSin: string;
  productoSin: string;
}): HomologacionProductoResponse {
  return {
    id: `${data.sistemaId}-homo-${data.index + 1}`,
    sistemaId: data.sistemaId,
    fecha: data.fecha,
    hora: data.hora,
    codigoEntel: data.codigoEntel,
    productoEntel: data.productoEntel,
    actividadCodigo: '610000',
    actividadNombre: 'Telecomunicaciones',
    codigoSin: data.codigoSin,
    productoSin: data.productoSin,
  };
}
