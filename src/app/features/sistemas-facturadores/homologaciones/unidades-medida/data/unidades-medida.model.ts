export interface HomologacionUnidadMedida {
  id: string;
  sistemaId: string;
  fecha: string;
  hora: string;
  codigoEntel: string;
  unidadEntel: string;
  codigoSin: string;
  unidadSin: string;
}

export type HomologacionUnidadMedidaRequest = Omit<HomologacionUnidadMedida, 'id'>;
