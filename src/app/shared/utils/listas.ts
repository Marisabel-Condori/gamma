/** Elimina los elementos repetidos, el backend a veces los devuelve dos veces. */
export function sinRepetidos<T>(lista: readonly T[], clave: (item: T) => string): T[] {
  const vistos = new Set<string>();
  return lista.filter((item) => {
    const k = clave(item);
    if (vistos.has(k)) return false;
    vistos.add(k);
    return true;
  });
}
