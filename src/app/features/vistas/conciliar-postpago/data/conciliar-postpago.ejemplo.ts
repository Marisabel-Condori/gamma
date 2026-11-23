// Temporal: datos de octubre 2026 hasta conectar el endpoint de conciliación.
import { ConciliacionSistema, FacturaConciliacion } from './conciliacion-postpago.model';

export const SISTEMAS_POSTPAGO: ConciliacionSistema[] = [
  { sistema: 'AXS', cantidadSfe: 4, cantidadLpt: null, montoSfe: 74.89, montoLpt: null },
  { sistema: 'COTAS', cantidadSfe: 12, cantidadLpt: null, montoSfe: 316.08, montoLpt: null },
  { sistema: 'NUEVATEL', cantidadSfe: 25, cantidadLpt: null, montoSfe: 193.52, montoLpt: null },
  { sistema: 'TELECEL', cantidadSfe: 30, cantidadLpt: null, montoSfe: 740.3, montoLpt: null },
  { sistema: 'MASIVO', cantidadSfe: 825120, cantidadLpt: 825116, montoSfe: 148290363.06, montoLpt: 148307502.21 },
];

const sfe = (id: number, cuf: string, numero: string, fecha: string, monto: number): FacturaConciliacion => ({
  id,
  cuf,
  sistemaSfe: 'MASIVO',
  numeroFacturaSfe: numero,
  fechaSfe: fecha,
  montoSfe: monto,
});

export const FACTURAS_POSTPAGO: FacturaConciliacion[] = [
  sfe(1, '45D6DEA712797E442792A8D1588FD60E459FC1C8879FA0C506264BF74', '6385076', '2026-10-02', 180),
  sfe(2, '45D6DEA712797E442CA6D43BF31FA4056DD95C52609FA0C506264BF74', '6386855', '2026-10-02', 187),
  sfe(3, '45D6DEA712797E4432A5F4EA80687B3655FDFC6C079FA0C506264BF74', '6404576', '2026-10-02', 623.57),
  sfe(4, '45D6DEA712797E44A464CC62238A27828CA2FC6C029FA0C506264BF74', '6404576', '2026-10-02', 623.57),
  sfe(5, '45D6DEA712797E713A62DE9BA3D8CEC29CB7B315E2708838BF0F5BF74', '6372819', '2026-10-03', 97.84),
  {
    id: 6,
    cuf: '45D6DEA712797E713A62DE9BA3D8CEC29CB7B315E230F380A1664BF74',
    sistemaPost: 'MASIVO',
    numeroFacturaPost: '06372819',
    fechaPost: '2026-10-03',
    montoPost: 97.84,
  },
];
