
export type GmLugarMovil = 'titulo' | 'subtitulo' | 'detalle' | 'esquina' | 'pie' | 'pie-fin' | 'oculto';

export interface GmColumna<T = any> {
  id: string;
  titulo: string;
  /** Columnas consecutivas con el mismo grupo comparten una cabecera arriba (ENTEL / SIN). */
  grupo?: string;
  /** Texto calculado, ej. (h) => `${h.fecha} · ${h.hora}`. */
  valor?: (fila: T) => string | number;
  /** Ancho fijo en escritorio, ej. '120px' o '15%'. */
  ancho?: string;
  alinear?: 'inicio' | 'centro' | 'fin';
  /** Texto en negrita y color principal. */
  destacar?: boolean;
  /** Evita que el texto salte de línea. */
  sinSalto?: boolean;
  /** Textos largos (tokens, direcciones): se cortan con "…" y se ven completos al pasar el mouse. */
  recortar?: boolean;

  /** Lugar en la tarjeta móvil. Por defecto: 'detalle'. */
  movil?: GmLugarMovil;
  /** Rótulo en móvil: "Código SIN: 99100" en detalle, o el texto pequeño encima del valor en el pie. */
  etiquetaMovil?: string;
  /** Texto distinto para móvil, ej. en minúsculas. */
  valorMovil?: (fila: T) => string;
  /** Para cambiar el orden dentro de la tarjeta sin cambiar el de la tabla. */
  ordenMovil?: number;
}
