import { Empresa, Sistema } from '../models/gamma.models';

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

  return { empresas, sistemas };
}
