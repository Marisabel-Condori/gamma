/**
 * Dónde aparece la columna cuando la tabla se convierte en tarjeta (móvil):
 *
 *   ┌───────────────────────────────┐
 *   │ GRUPO (si la columna tiene)   │
 *   │ titulo              esquina   │
 *   │ subtitulo                     │
 *   │ detalle                       │
 *   ├───────────────────────────────┤
 *   │ pie                 pie-fin   │
 *   └───────────────────────────────┘
 */
export type GmLugarMovil = 'titulo' | 'subtitulo' | 'detalle' | 'esquina' | 'pie' | 'pie-fin' | 'oculto';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface GmColumna<T = any> {
  /** Identificador; también es la propiedad que se muestra si no hay `valor` ni plantilla. */
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

  /** Lugar en la tarjeta móvil. Por defecto: 'detalle'. */
  movil?: GmLugarMovil;
  /** Rótulo en móvil: "Código SIN: 99100" en detalle, o el texto pequeño encima del valor en el pie. */
  etiquetaMovil?: string;
  /** Texto distinto para móvil, ej. en minúsculas. */
  valorMovil?: (fila: T) => string;
  /** Para cambiar el orden dentro de la tarjeta sin cambiar el de la tabla. */
  ordenMovil?: number;
}
