import { Component, input } from '@angular/core';

@Component({
  selector: 'app-gamma-toolbar',
  host: {
    '[class.gamma-toolbar--beside]': 'meta() === "beside"',
  },
  template: `
    <div class="gamma-toolbar__lead">
      <div class="gamma-toolbar__title">
        <ng-content select="[gammaTitle]" />
      </div>
      <div class="gamma-toolbar__meta">
        <ng-content select="[gammaMeta]" />
      </div>
    </div>
    <div class="gamma-toolbar__tools">
      <div class="gamma-toolbar__search">
        <ng-content select="[gammaSearch]" />
      </div>
      <div class="gamma-toolbar__action">
        <ng-content select="[gammaAction]" />
      </div>
    </div>
  `,
  styleUrl: './gamma-toolbar.component.scss',
})
export class GammaToolbarComponent {
  readonly meta = input<'below' | 'beside'>('below');
}
