export interface ConciliacionSistema {
  sistema: string;
  cantidadSfe: number;
  cantidadLpt: number | null;
  montoSfe: number;
  montoLpt: number | null;
}

export interface FacturaConciliacion {
  id: number;
  cuf: string;
  sistemaSfe?: string;
  numeroFacturaSfe?: string;
  fechaSfe?: string;
  montoSfe?: number;
  sistemaPost?: string;
  numeroFacturaPost?: string;
  fechaPost?: string;
  montoPost?: number;
}
