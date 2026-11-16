import { BreakpointObserver } from '@angular/cdk/layout';
import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

export const GM_MOVIL = '(max-width: 800px)';

@Injectable({ providedIn: 'root' })
export class Pantalla {
  readonly esMovil = toSignal(
    inject(BreakpointObserver)
      .observe(GM_MOVIL)
      .pipe(map((estado) => estado.matches)),
    { initialValue: false },
  );
}
