import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'gm-layout-acceso',
  imports: [RouterOutlet],
  template: '<router-outlet />',
  styles: ':host { display: block; min-height: 100%; }',
})
export class LayoutAcceso {}
