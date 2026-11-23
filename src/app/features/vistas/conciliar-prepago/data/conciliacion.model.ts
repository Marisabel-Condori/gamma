export interface ConciliacionOrigen {
  cantidadSfe: number;
  cantidadLpt: number;
  montoSfe: number;
  montoLpt: number;
}

export interface ConciliacionDia {
  dia: number;
  origenes: Partial<Record<string, ConciliacionOrigen>>;
}
