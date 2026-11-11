import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface Crumb {
  label: string;
  link?: string;
}

@Component({
  selector: 'app-page-header',
  imports: [RouterLink],
  template: `
    <header class="page-head">
      <div>
        @if (crumbs().length) {
          <p class="crumbs">
            @for (crumb of crumbs(); track crumb.label; let last = $last) {
              @if (crumb.link && !last) {
                <a [routerLink]="crumb.link">{{ crumb.label }}</a>
              } @else {
                <span>{{ crumb.label }}</span>
              }
              @if (!last) {
                <span>/</span>
              }
            }
          </p>
        }
        @if (backLink()) {
          <a class="back" [routerLink]="backLink()">
            <span class="material-icons">arrow_back</span>
            {{ backLabel() }}
          </a>
        }
        <h1>{{ title() }}</h1>
        @if (subtitle()) {
          <p class="subtitle">{{ subtitle() }}</p>
        }
      </div>
      @if (actionLabel()) {
        <button type="button" class="btn-primary" (click)="action.emit()">
          <span class="material-icons">add</span>
          {{ actionLabel() }}
        </button>
      }
    </header>
  `,
  styles: ':host { display: block; }',
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly subtitle = input('');
  readonly crumbs = input<Crumb[]>([]);
  readonly backLink = input<string | null>(null);
  readonly backLabel = input('Volver');
  readonly actionLabel = input<string | null>(null);
  readonly action = output<void>();
}
