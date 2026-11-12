import { Empresa, HomologacionProducto, Sistema } from '../models/gamma.models';

interface EmpresaSeed {
  id: string;
  codigo: string;
  razonSocial: string;
  internos: ReadonlyArray<readonly [string, string]>;
}

const EMPRESAS: EmpresaSeed[] = [
  {
    id: 'axs',
    codigo: 'AXS',
    razonSocial: 'AXS BOLIVIA S.A.',
    internos: [
      ['PORTAL', 'Portal de proveedores'],
      ['RECAUDO', 'Recaudo en línea'],
    ],
  },
  {
    id: 'comteco',
    codigo: 'COMTECO',
    razonSocial: 'COOPERATIVA DE TELECOMUNICACIONES COCHABAMBA R.L. - COMTECO R.L.',
    internos: [
      ['SIGC', 'Sistema de gestión comercial'],
      ['FACTCB', 'Facturación Cochabamba'],
    ],
  },
  {
    id: 'cotas',
    codigo: 'COTAS',
    razonSocial: 'COOPERATIVA DE TELECOMUNICACIONES SANTA CRUZ R.L.',
    internos: [
      ['SIGS', 'Sistema de gestión Santa Cruz'],
      ['COBSC', 'Cobranzas Santa Cruz'],
    ],
  },
  {
    id: 'entel',
    codigo: 'ENTEL',
    razonSocial: 'EMPRESA NACIONAL DE TELECOMUNICACIONES S. A.',
    internos: [
      ['ZSMART', 'ZSMART'],
      ['TTVENTAS', 'TTVENTAS'],
      ['SICO', 'Sistema de Cobranza Entel'],
      ['SIADIN', 'SIADIN'],
      ['SEES', 'Servicios Especiales'],
      ['RECINT', 'Recarga Internacional'],
      ['MASIVO', 'Proceso Masivo de Facturas Postpago'],
      ['GARAN', 'GARAN'],
      ['BANCA', 'Transacciones desde el WS de la Banca'],
    ],
  },
  {
    id: 'cotel',
    codigo: 'COTEL',
    razonSocial: 'COOPERATIVA DE TELECOMUNICACIONES LA PAZ R.L.',
    internos: [['SIGLP', 'Gestión La Paz']],
  },
  {
    id: 'viva',
    codigo: 'VIVA',
    razonSocial: 'NUEVATEL PCS DE BOLIVIA S.A.',
    internos: [
      ['PREPAGO', 'Plataforma prepago'],
      ['POSTPAGO', 'Plataforma postpago'],
    ],
  },
  {
    id: 'tigo',
    codigo: 'TIGO',
    razonSocial: 'TELECEL BOLIVIA S.A.',
    internos: [
      ['TGFACT', 'Facturación Tigo'],
      ['TGREC', 'Recargas Tigo'],
    ],
  },
];

export interface GammaData {
  empresas: Empresa[];
  sistemas: Sistema[];
  homologaciones: HomologacionProducto[];
}

export function createSeed(): GammaData {
  const empresas: Empresa[] = [];
  const sistemas: Sistema[] = [];

  for (const empresa of EMPRESAS) {
    empresas.push({
      id: empresa.id,
      codigo: empresa.codigo,
      razonSocial: empresa.razonSocial,
    });
    sistemas.push(
      ...empresa.internos.map(([codigo, descripcion]) => ({
        id: `${empresa.id}-${codigo}`,
        empresaId: empresa.id,
        codigo,
        descripcion,
      })),
    );
  }

  return { empresas, sistemas, homologaciones: createHomologaciones() };
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

function createHomologaciones(): HomologacionProducto[] {
  const rows: HomologacionProducto[] = MUESTRA_ZSMART.map((item, index) =>
    homologacion('entel-ZSMART', index, '08/03/2022', item[0], item[1], item[2], item[3], item[4]),
  );

  for (let index = 0; index < 84; index += 1) {
    const producto = PRODUCTOS_EXTRA[index % PRODUCTOS_EXTRA.length];
    const day = String(9 + Math.floor(index / 20)).padStart(2, '0');
    const minute = String(index % 60).padStart(2, '0');
    const second = String((index * 3) % 60).padStart(2, '0');
    rows.push(
      homologacion(
        'entel-ZSMART',
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
): HomologacionProducto {
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
