export function cambiaFormatoFecha(iso: string): string {
  const [dia, hora = ''] = iso.split('T');
  const [anio, mes, d] = dia.split('-');
  return `${d}/${mes}/${anio} · ${hora.slice(0, 8)}`;
}
