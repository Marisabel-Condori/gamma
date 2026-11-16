/** "1 sistema" / "9 sistemas" */
export function conteo(total: number, singular: string, plural: string): string {
  return `${total} ${total === 1 ? singular : plural}`;
}

/** "OTROS PRODUCTOS ... POR EL IVA" → "Otros productos ... por el IVA" */
export function oracion(valor: string): string {
  const texto = valor.toLowerCase();
  return texto.charAt(0).toUpperCase() + texto.slice(1).replace(/\biva\b/g, 'IVA');
}
