import { Component, computed, input } from '@angular/core';

const GLYPHS = {
  edit: 'edit',
  delete: 'delete',
  more: 'more_vert',
  add: 'add',
  search: 'search',
} as const;

export type GammaIconName = keyof typeof GLYPHS;

@Component({
  selector: 'app-icon',
  template: `<span class="material-icons" aria-hidden="true">{{ glyph() }}</span>`,
  styles: `
    :host {
      display: inline-grid;
      place-items: center;
      font-size: inherit;
      line-height: 1;
    }

    .material-icons {
      font-size: inherit;
    }
  `,
})
export class GammaIcon {
  readonly name = input.required<GammaIconName>();
  readonly glyph = computed(() => GLYPHS[this.name()]);
}
