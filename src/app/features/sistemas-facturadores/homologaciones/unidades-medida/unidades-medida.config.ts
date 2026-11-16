import { ConfigHomologacion } from '../comun/homologacion-catalogo.model';

export const UNIDADES_MEDIDA: ConfigHomologacion = {
  tipo: 'unidades-medida',
  titulo: 'Unidades de medida homologadas',
  tituloMovil: 'Unidades',
  concepto: 'Unidad de medida',
  conceptoPlural: 'unidades de medida',
  vacio: 'Este sistema todavía no tiene unidades de medida homologadas.',
  placeholderEntel: 'Ingresa la unidad de medida',
  placeholderSin: 'Selecciona una unidad de medida',
  endpointCatalogo: 'unidadDeMedida',
  ejemplo: [
    {
      id: 'ZSMART-unidades-medida-1',
      sistemaId: 'ZSMART',
      fecha: '01/05/2022',
      hora: '05:43:28',
      codigoEntel: '58',
      descripcionEntel: 'SERVICIOS',
      codigoSin: '58',
      descripcionSin: 'UNIDAD (SERVICIOS)',
    },
    {
      id: 'ZSMART-unidades-medida-2',
      sistemaId: 'ZSMART',
      fecha: '01/05/2022',
      hora: '05:43:50',
      codigoEntel: '57',
      descripcionEntel: 'BIENES',
      codigoSin: '57',
      descripcionSin: 'UNIDAD (BIENES)',
    },
  ],
};
