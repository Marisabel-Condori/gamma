import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/** Layout sin barra ni menú, para login y pantallas de acceso. */
@Component({
  selector: 'gm-layout-acceso',
  imports: [RouterOutlet],
  template: '<router-outlet />',
  styles: ':host { display: block; min-height: 100%; }',
})
export class LayoutAcceso {}
