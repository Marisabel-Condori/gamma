import { Component, computed, ElementRef, inject, input, viewChild } from '@angular/core';
import { ESTILOS_CONTROL, GmControl } from '../control/control';

const RELLENO = '_';
const MEDIO = '00000000';
const LARGO_TOTAL = 4 + MEDIO.length + 4;

/** Número de tarjeta enmascarado: 4 primeros + 8 fijos + 4 últimos.
 *  <gm-tarjeta-control etiqueta="Número tarjeta" formControlName="numeroTarjeta" />
 */
@Component({
  selector: 'gm-tarjeta-control',
  host: {
    '[class.invalido]': 'error() !== null',
    '(focusout)': 'alSalir($event)',
  },
  template: `
    <label class="gm-campo">
      @if (etiqueta()) {
        {{ conAsterisco(etiqueta()) }}
      }
      <div class="caja" (mousedown)="enfocarCaja($event)">
        <input
          #campoInicio
          inputmode="numeric"
          autocomplete="off"
          maxlength="4"
          placeholder="0000"
          aria-label="Primeros 4 dígitos"
          [value]="inicio()"
          (input)="alEscribir('inicio', campoInicio)"
          (keydown)="alTeclearInicio($event, campoInicio)"
          (paste)="alPegar($event)"
        />
        <span class="fija" aria-hidden="true"></span>
        <input
          #campoFin
          inputmode="numeric"
          autocomplete="off"
          maxlength="4"
          placeholder="0000"
          aria-label="Últimos 4 dígitos"
          [value]="fin()"
          (input)="alEscribir('fin', campoFin)"
          (keydown)="alTeclearFin($event, campoFin)"
          (paste)="alPegar($event)"
        />
      </div>
    </label>
    @if (error(); as mensaje) {
      <span class="error" role="alert" [attr.title]="mensaje">{{ mensaje }}</span>
    }
  `,
  styles: `
    ${ESTILOS_CONTROL}

    .gm-campo {
      min-width: 0;
    }

    .caja {
      display: flex;
      align-items: center;
      gap: 1ch;
      min-width: 0;
      height: var(--control-lg);
      padding: 0 12px;
      overflow: hidden;
      border: 1px solid var(--linea-fuerte);
      border-radius: var(--radio-md);
      background: var(--superficie);
      font-weight: var(--peso-normal);
      font-variant-numeric: tabular-nums;
      letter-spacing: 0.08em;
      cursor: text;
    }
    .caja:focus-within {
      color: var(--marca);
      outline: none;
      outline-style: auto;
    }
    :host(.invalido) .caja {
      border-color: var(--peligro);
    }

    .caja input {
      flex: none;
      width: 4.6ch;
      height: auto;
      padding: 0;
      border: 0;
      border-radius: 0;
      outline: 0;
      background: transparent;
      font: inherit;
      letter-spacing: inherit;
      text-align: center;
    }
    .caja input::placeholder {
      color: var(--tinta-3);
    }
    .fija {
      flex: 0 1 auto;
      min-width: 0;
      overflow: hidden;
      color: var(--tinta-3);
      text-overflow: ellipsis;
      white-space: nowrap;
      user-select: none;
    }
    .fija::before {
      content: '0000 0000';
    }
  `,
})
export class GmTarjetaControl extends GmControl<string> {
  readonly etiqueta = input('');

  protected readonly vacio = '';

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly inputInicio = viewChild.required<ElementRef<HTMLInputElement>>('campoInicio');
  private readonly inputFin = viewChild.required<ElementRef<HTMLInputElement>>('campoFin');

  private readonly completo = computed(() => {
    const v = this.valor() ?? '';
    return v.length === LARGO_TOTAL ? v : '';
  });
  protected readonly inicio = computed(() => this.completo().slice(0, 4).replace(/\D/g, ''));
  protected readonly fin = computed(() => this.completo().slice(-4).replace(/\D/g, ''));

  protected alEscribir(parte: 'inicio' | 'fin', el: HTMLInputElement) {
    const limpio = el.value.replace(/\D/g, '').slice(0, 4);
    el.value = limpio;
    this.emitir(parte === 'inicio' ? limpio : this.inicio(), parte === 'fin' ? limpio : this.fin());

    if (parte === 'inicio' && limpio.length === 4) {
      this.inputFin().nativeElement.focus();
    }
  }

  protected alTeclearInicio(e: KeyboardEvent, el: HTMLInputElement) {
    const alFinal = el.selectionStart === el.value.length;
    if (e.key === 'ArrowRight' && alFinal) {
      e.preventDefault();
      this.irA(this.inputFin().nativeElement, 'inicio');
    }
  }

  protected alTeclearFin(e: KeyboardEvent, el: HTMLInputElement) {
    const alInicio = el.selectionStart === 0 && el.selectionEnd === 0;
    if ((e.key === 'Backspace' || e.key === 'ArrowLeft') && alInicio) {
      e.preventDefault();
      this.irA(this.inputInicio().nativeElement, 'final');
    }
  }

  protected alPegar(e: ClipboardEvent) {
    const digitos = (e.clipboardData?.getData('text') ?? '').replace(/\D/g, '');
    if (digitos.length < 8) return;
    e.preventDefault();
    this.emitir(digitos.slice(0, 4), digitos.slice(-4));
    this.irA(this.inputFin().nativeElement, 'final');
  }

  protected enfocarCaja(e: MouseEvent) {
    if (e.target instanceof HTMLInputElement) return;
    e.preventDefault();
    const destino = this.inicio().length < 4 ? this.inputInicio() : this.inputFin();
    this.irA(destino.nativeElement, 'final');
  }

  protected alSalir(e: FocusEvent) {
    const siguiente = e.relatedTarget as Node | null;
    if (!siguiente || !this.host.nativeElement.contains(siguiente)) {
      this.tocar();
    }
  }

  private emitir(inicio: string, fin: string) {
    this.cambiar(
      !inicio && !fin
        ? this.vacio
        : `${inicio.padEnd(4, RELLENO)}${MEDIO}${fin.padStart(4, RELLENO)}`,
    );
  }

  private irA(el: HTMLInputElement, cursor: 'inicio' | 'final') {
    el.focus();
    const pos = cursor === 'inicio' ? 0 : el.value.length;
    el.setSelectionRange(pos, pos);
  }
}
