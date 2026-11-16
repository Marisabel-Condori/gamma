
export interface HomologacionCatalogo {
  id: string;
  sistemaId: string;
  fecha: string;
  hora: string;
  codigoEntel: string;
  descripcionEntel: string;
  codigoSin: string;
  descripcionSin: string;
}

export type HomologacionCatalogoRequest = Omit<HomologacionCatalogo, 'id'>;

export interface ConfigHomologacion {
  tipo: string;
  titulo: string;
  tituloMovil: string;
  concepto: string;
  conceptoPlural: string;
  vacio: string;
  placeholderEntel: string;
  placeholderSin: string;
  endpointCatalogo: string;
  ejemplo: HomologacionCatalogo[];
}
