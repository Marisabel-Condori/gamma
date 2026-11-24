import { ConciliacionSiatFila, ConciliacionSiatResponse } from './conciliacion-siat.model';

const porDia = (montos: number[]): Partial<Record<number, number>> =>
  Object.fromEntries(montos.map((monto, i) => [i + 1, monto]));

const SISTEMAS: ConciliacionSiatFila[] = [
  {
    sistema: 'MASIVO',
    cantidad: 825120,
    monto: 148290363.06,
    descuento: 2216884.44,
    dias: { 2: 46016043.2, 3: 101122102.27, 4: 643648.77, 5: 21406.77, 6: 139200, 7: 489, 9: 4783.56, 13: 33600, 22: 31700 },
  },
  {
    sistema: 'RECINT',
    cantidad: 10,
    monto: 316283.56,
    descuento: 0,
    dias: { 6: 47880, 9: 47400, 12: 58650, 14: 17550, 16: 11680, 19: 15197, 21: 105570, 28: 12356.56 },
  },
  {
    sistema: 'SICO',
    cantidad: 74656,
    monto: 13774636.58,
    descuento: 629683.69,
    dias: porDia([
      224536.07, 335077, 243738.03, 3829.05, 393555, 294410, 349043.1, 398469, 431763, 287878.1, 33472, 362844.09,
      374091.6, 266331.85, 480829.11, 526964.02, 429646, 10963, 442625.16, 278367.9, 698193, 821772.09, 1544572,
      252391, 11402, 262441, 233856.65, 278729, 561298.07, 1187040.55, 1754508.14,
    ]),
  },
  {
    sistema: 'BANCA',
    cantidad: 15926951,
    monto: 150360215.85,
    descuento: 756738.71,
    dias: porDia([
      5428316.26, 5276589.76, 4985155.56, 4358380.87, 5269681.5, 5052157.17, 4983761.36, 4782823.32, 4855515.81,
      4362958.1, 4208775.21, 5044309.24, 4740413.83, 4595420.95, 4720668.73, 4917773.04, 4737084.22, 4210395.58,
      4993321.37, 4657875.96, 4526273.7, 4789754.61, 5406711.47, 4555951.66, 3918512.23, 4807206.14, 4541388.82,
      4517037.02, 4858228.69, 5433106.12, 6824667.55,
    ]),
  },
  { sistema: 'SEES', cantidad: 1809, monto: 7259878.74, descuento: 0, dias: { 1: 7234663.74, 5: 1250, 26: 23965 } },
  { sistema: 'ALQUILER', cantidad: 1, monto: 1400, descuento: 0, dias: { 6: 1400 } },
  { sistema: 'GAMMA', cantidad: 22, monto: 1764000, descuento: 0, dias: { 22: 1764000 } },
  {
    sistema: 'SIADIN',
    cantidad: 151,
    monto: 13813606.66,
    descuento: 0,
    dias: { 3: 2151233.11, 5: 8377880.32, 6: 116512.41, 9: 1909655.96, 21: 1105199.31, 22: 150527.41, 31: 2598.14 },
  },
  { sistema: 'TTBVENTAS', cantidad: 12, monto: 1288, descuento: 0, dias: { 8: 99, 12: 99, 14: 99, 17: 99, 20: 198 } },
  {
    sistema: 'ZSMART',
    cantidad: 8086,
    monto: 2660693.85,
    descuento: 0,
    dias: porDia([
      41806.77, 642851.87, 257716.5, 120, 391745.33, 18505, 37175.5, 21774, 27883.01, 14080.5, 159, 94826.3, 161008.81,
      18746.59, 14528, 23969.27, 12079, 170, 57890.5, 240984.5, 5590, 14922.5, 36845.7,
    ]),
  },
  { sistema: 'AXS', cantidad: 9, monto: 265.51, descuento: 0, dias: { 3: 265.51 } },
  { sistema: 'NUEVATEL', cantidad: 1, monto: 0.48, descuento: 0, dias: { 3: 0.48 } },
  { sistema: 'TELECEL', cantidad: 67, monto: 1902.17, descuento: 0, dias: { 2: 1902.17 } },
  { sistema: 'CHEZBRANC S.R.L.', cantidad: 65, monto: 1626, descuento: 0, dias: { 1: 1596, 2: 30 } },
  {
    sistema: 'SENTINEL LTDA',
    cantidad: 171,
    monto: 2811.71,
    descuento: 0,
    dias: porDia([
      60, 100, 20, 35, 118, 158, 71, 256, 125, 85, 37, 145.58, 65, 230, 70, 60, 230, 65, 113, 30, 25, 101, 40,
    ]),
  },
];

const sumar = (valores: number[]) => Math.round(valores.reduce((total, valor) => total + valor, 0) * 100) / 100;

const DIFERENCIAS = { cantidad: -8, monto: -71, descuento: -500, dias: { 6: -11, 12: -10 } as Record<number, number> };

const SIAT: ConciliacionSiatFila = {
  sistema: 'SIAT',
  cantidad: sumar(SISTEMAS.map((s) => s.cantidad)) + DIFERENCIAS.cantidad,
  monto: sumar(SISTEMAS.map((s) => s.monto)) + DIFERENCIAS.monto,
  descuento: sumar(SISTEMAS.map((s) => s.descuento)) + DIFERENCIAS.descuento,
  dias: Object.fromEntries(
    Array.from({ length: 31 }, (_, i) => i + 1).map((dia) => [
      dia,
      sumar(SISTEMAS.map((s) => s.dias[dia] ?? 0)) + (DIFERENCIAS.dias[dia] ?? 0),
    ]),
  ),
};

export const CONCILIACION_SIAT: ConciliacionSiatResponse = { sistemas: SISTEMAS, siat: SIAT };
