import { HomologacionProductoResponse, SistemaResponse } from '../models/gamma.models';

const SISTEMAS: ReadonlyArray<readonly [string, string]> = [
  ['ZSMART', 'ZSMART'],
  ['TTVENTAS', 'TTVENTAS'],
  ['SICO', 'Sistema de Cobranza Entel'],
  ['SIADIN', 'SIADIN'],
  ['SEES', 'Servicios Especiales'],
  ['RECINT', 'Recarga Internacional'],
  ['MASIVO', 'Proceso Masivo de Facturas Postpago'],
  ['GARAN', 'GARAN'],
  ['BANCA', 'Transacciones desde el WS de la Banca'],
];

export interface GammaData {
  sistemas: SistemaResponse[];
  homologaciones: HomologacionProductoResponse[];
}

export function createSeed(): GammaData {
  const sistemas: SistemaResponse[] = SISTEMAS.map(([codigo, descripcion]) => ({
    id: codigo,
    codigo,
    descripcion,
  }));

  return { sistemas, homologaciones: createHomologaciones() };
}

const MUESTRA_ZSMART: Array<[string, string, string, string, string]> = [
  ['13:37:55', '1', 'CELULARES', '99100', 'Otros productos o servicios alcanzados por el IVA'],
  ['13:38:58', '10', 'MANUALES', '99100', 'Otros productos o servicios alcanzados por el IVA'],
  ['13:39:06', '9', 'ANTENAS', '99100', 'Otros productos o servicios alcanzados por el IVA'],
  ['13:39:13', '8', 'BATERÍAS', '99100', 'Otros productos o servicios alcanzados por el IVA'],
  ['13:40:12', '7', 'CARGADORES', '99100', 'Otros productos o servicios alcanzados por el IVA'],
  ['13:40:26', '67', 'IPTV', '84190', 'Otros servicios de telecomunicaciones'],
  ['13:40:38', '66', 'EQUIPOS INTERNET', '99100', 'Otros productos o servicios alcanzados por el IVA'],
  ['13:40:46', '65', 'MATERIAL PAPELBOL', '99100', 'Otros productos o servicios alcanzados por el IVA'],
  ['13:40:55', '64', 'EQUIPOS QUIPUS', '99100', 'Otros productos o servicios alcanzados por el IVA'],
  ['13:41:03', '63', 'SIM CARD ÚNICO', '99100', 'Otros productos o servicios alcanzados por el IVA'],
];

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
];

function createHomologaciones(): HomologacionProductoResponse[] {
  const rows: HomologacionProductoResponse[] = MUESTRA_ZSMART.map((item, index) =>
    homologacion('ZSMART', index, '08/03/2022', item[0], item[1], item[2], item[3], item[4]),
  );

  for (let index = 0; index < 84; index += 1) {
    const producto = PRODUCTOS_EXTRA[index % PRODUCTOS_EXTRA.length];
    const day = String(9 + Math.floor(index / 20)).padStart(2, '0');
    const minute = String(index % 60).padStart(2, '0');
    const second = String((index * 3) % 60).padStart(2, '0');
    rows.push(
      homologacion(
        'ZSMART',
        MUESTRA_ZSMART.length + index,
        `${day}/03/2022`,
        `14:${minute}:${second}`,
        String(120 + index),
        producto,
        index % 7 === 0 ? '84190' : '99100',
        index % 7 === 0
          ? 'Otros servicios de telecomunicaciones'
          : 'Otros productos o servicios alcanzados por el IVA',
      ),
    );
  }

  return rows;
}

function homologacion(
  sistemaId: string,
  index: number,
  fecha: string,
  hora: string,
  codigoEntel: string,
  productoEntel: string,
  codigoSin: string,
  productoSin: string,
): HomologacionProductoResponse {
  return {
    id: `${sistemaId}-homo-${index + 1}`,
    sistemaId,
    fecha,
    hora,
    codigoEntel,
    productoEntel,
    actividadCodigo: '610000',
    actividadNombre: 'Telecomunicaciones',
    codigoSin,
    productoSin,
  };
}
