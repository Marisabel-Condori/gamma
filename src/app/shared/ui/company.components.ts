import { Component, input } from '@angular/core';

@Component({
  selector: 'app-company-context',
  template: `
    <div class="context">
      <span>Empresa:</span>
      <strong>{{ codigo() }}</strong>
    </div>
  `,
  styles: ':host { display: block; }',
})
export class CompanyContextComponent {
  readonly codigo = input.required<string>();
}
