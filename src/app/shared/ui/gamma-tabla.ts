import { Component } from '@angular/core';

@Component({
  selector: 'gamma-tabla',
  template: '<ng-content />',
  styles: ':host { display: block; overflow: auto; }',
})
export class GammaTabla {}
