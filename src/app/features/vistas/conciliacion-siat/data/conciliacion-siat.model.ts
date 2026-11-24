export interface ConciliacionSiatFila {
  sistema: string;
  cantidad: number;
  monto: number;
  descuento: number;
  dias: Partial<Record<number, number>>;
}

export interface ConciliacionSiatResponse {
  sistemas: ConciliacionSiatFila[];
  siat: ConciliacionSiatFila;
}
