import { Directive, TemplateRef, inject, input } from '@angular/core';

/**  <ng-template gmCelda="acciones" let-fila> ... </ng-template> */
@Directive({ selector: 'ng-template[gmCelda]' })
export class GmCelda {
  readonly columna = input.required<string>({ alias: 'gmCelda' });
  readonly plantilla = inject(TemplateRef);
}
