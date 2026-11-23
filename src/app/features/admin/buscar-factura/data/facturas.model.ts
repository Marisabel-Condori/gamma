export interface FacturaResponse {
  idFactura: number;
  origen: string;
  recepcion: string;
  numeroFactura: string;
  razonSocial: string;
  numeroDocumento: string;
  tipoDocumento: string;
  fecha: string;
  cuf: string;
  montoTotal: number;
  estado: string;
  tipoEmision: string;
  usuario: string;
}

export interface FiltroFacturas {
  origen: string;
  recepcion: string;
  numeroFactura: string;
  razonSocial: string;
  numeroDocumento: string;
  periodo: string;
  cuf: string;
}
