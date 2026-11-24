const CANTIDAD = new Intl.NumberFormat('en-US');
const MONTO = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const cantidad = (valor: number | null | undefined) => (valor == null ? '' : CANTIDAD.format(valor));
export const monto = (valor: number | null | undefined) => (valor == null ? '' : MONTO.format(valor));

export const redondear = (valor: number) => Math.round(valor * 100) / 100;
