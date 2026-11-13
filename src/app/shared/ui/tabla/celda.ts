import { Directive, TemplateRef, inject, input } from '@angular/core';

/**
 * Contenido personalizado de una columna (botones, menús, formato especial).
 *   <ng-template gmCelda="acciones" let-fila> ... </ng-template>
 * Se usa igual en la tabla de escritorio y en la tarjeta móvil.
 */
@Directive({ selector: 'ng-template[gmCelda]' })
export class GmCelda {
  readonly columna = input.required<string>({ alias: 'gmCelda' });
  readonly plantilla = inject(TemplateRef);
}
