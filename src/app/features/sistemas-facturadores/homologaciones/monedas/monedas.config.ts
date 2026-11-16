import { ConfigHomologacion } from '../comun/homologacion-catalogo.model';

export const MONEDAS: ConfigHomologacion = {
  tipo: 'monedas',
  titulo: 'Tipos de moneda homologados',
  tituloMovil: 'Monedas',
  concepto: 'Tipo de moneda',
  conceptoPlural: 'tipos de moneda',
  vacio: 'Este sistema todavía no tiene tipos de moneda homologados.',
  placeholderEntel: 'Ingresa el tipo de moneda',
  placeholderSin: 'Selecciona un tipo de moneda',
  endpointCatalogo: 'moneda',
  ejemplo: [
    {
      id: 'ZSMART-monedas-1',
      sistemaId: 'ZSMART',
      fecha: '07/03/2022',
      hora: '16:39:27',
      codigoEntel: '1',
      descripcionEntel: 'BOLIVIANO',
      codigoSin: '1',
      descripcionSin: 'BOLIVIANO',
    },
    {
      id: 'ZSMART-monedas-2',
      sistemaId: 'ZSMART',
      fecha: '08/03/2022',
      hora: '02:25:02',
      codigoEntel: '2',
      descripcionEntel: 'DOLARES',
      codigoSin: '2',
      descripcionSin: 'DOLAR',
    },
  ],
};
