import { BreakpointObserver } from '@angular/cdk/layout';
import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

/** Mismo valor que $movil en styles/_breakpoint.scss. */
export const GM_MOVIL = '(max-width: 800px)';

/** Dice si la pantalla está en vista móvil, para componentes que cambian de estructura (no solo de estilo). */
@Injectable({ providedIn: 'root' })
export class Pantalla {
  readonly esMovil = toSignal(
    inject(BreakpointObserver)
      .observe(GM_MOVIL)
      .pipe(map((estado) => estado.matches)),
    { initialValue: false },
  );
}
