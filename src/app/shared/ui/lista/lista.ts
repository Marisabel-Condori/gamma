import { CdkListbox, CdkOption, ListboxValueChangeEvent } from '@angular/cdk/listbox';
import { CdkConnectedOverlay, CdkOverlayOrigin, ConnectedPosition } from '@angular/cdk/overlay';
import { Component, ElementRef, booleanAttribute, computed, input, model, signal, viewChild } from '@angular/core';
import { GmIcono } from '../icono/icono';

export interface GmOpcionLista {
  valor: string;
  etiqueta: string;
}

const POSICIONES: ConnectedPosition[] = [
  { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 6 },
  { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -6 },
];

let siguienteId = 0;

/**  <gm-lista etiqueta="Actividad" placeholder="Selecciona una actividad"
 *             [opciones]="actividades" [(valor)]="actividad" />
 * `buscable`: para listas largas
 */
@Component({
  selector: 'gm-lista',
  imports: [CdkConnectedOverlay, CdkOverlayOrigin, CdkListbox, CdkOption, GmIcono],
  template: `
    <div class="gm-campo">
      <span [id]="id + '-etiqueta'">{{ etiqueta() }}</span>
      <button
        #boton
        type="button"
        class="control"
        cdkOverlayOrigin
        #origen="cdkOverlayOrigin"
        aria-haspopup="listbox"
        [attr.aria-labelledby]="id + '-etiqueta'"
        [attr.aria-expanded]="abierta()"
        [class.vacia]="!seleccionada()"
        [disabled]="deshabilitado()"
        (click)="alternar()"
      >
        <span class="texto">{{ seleccionada()?.etiqueta ?? placeholder() }}</span>
        <gm-icono nombre="desplegar" />
      </button>
    </div>

    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="origen"
      [cdkConnectedOverlayOpen]="abierta()"
      [cdkConnectedOverlayPositions]="posiciones"
      cdkConnectedOverlayHasBackdrop
      cdkConnectedOverlayBackdropClass="cdk-overlay-transparent-backdrop"
      (backdropClick)="cerrar()"
      (overlayKeydown)="$event.key === 'Escape' && cerrar(true)"
      (detach)="abierta.set(false)"
      (attach)="enfocarLista()"
    >
      <div class="panel" [style.width.px]="ancho()">
        @if (buscable()) {
          <label class="buscador">
            <gm-icono nombre="buscar" />
            <input
              #buscador
              type="search"
              placeholder="Buscar..."
              [attr.aria-label]="'Buscar ' + etiqueta()"
              [value]="filtro()"
              (input)="filtro.set($any($event.target).value)"
              (keydown.arrowdown)="$event.preventDefault(); lista.focus()"
              (keydown.enter)="$event.preventDefault(); elegirPrimera()"
            />
          </label>
        }
        <ul
          #lista
          class="opciones"
          cdkListbox
          [attr.aria-labelledby]="id + '-etiqueta'"
          [cdkListboxValue]="seleccionadaVisible() ? [valor()] : []"
          (cdkListboxValueChange)="elegir($event)"
        >
          @for (opcion of visibles(); track opcion.valor) {
            <li class="opcion" [cdkOption]="opcion.valor">{{ opcion.etiqueta }}</li>
          } @empty {
            <li class="sin-opciones">{{ filtro() ? 'Sin resultados.' : 'No hay opciones.' }}</li>
          }
        </ul>
      </div>
    </ng-template>
  `,
  styleUrl: './lista.scss',
})
export class GmLista {
  readonly etiqueta = input.required<string>();
  readonly opciones = input.required<readonly GmOpcionLista[]>();
  readonly valor = model('');
  readonly placeholder = input('Selecciona una opción');
  readonly deshabilitado = input(false, { transform: booleanAttribute });
  readonly buscable = input(false, { transform: booleanAttribute });

  protected readonly id = `gm-lista-${siguienteId++}`;
  protected readonly posiciones = POSICIONES;
  protected readonly abierta = signal(false);
  protected readonly ancho = signal(0);
  /** La opción elegida, solo si existe en la lista */
  protected readonly seleccionada = computed(() => this.opciones().find((o) => o.valor === this.valor()));

  // ── Buscador ──
  protected readonly filtro = signal('');
  /** Opciones que coinciden con lo escrito (sin distinguir mayúsculas ni tildes). */
  protected readonly visibles = computed(() => {
    const texto = normalizar(this.filtro());
    return texto ? this.opciones().filter((o) => normalizar(o.etiqueta).includes(texto)) : this.opciones();
  });
  /** El listbox falla si recibe un valor que no está entre las opciones visibles. */
  protected readonly seleccionadaVisible = computed(() => this.visibles().some((o) => o.valor === this.valor()));

  private readonly boton = viewChild.required<ElementRef<HTMLButtonElement>>('boton');
  private readonly lista = viewChild<ElementRef<HTMLElement>>('lista');
  private readonly buscador = viewChild<ElementRef<HTMLInputElement>>('buscador');

  protected alternar(): void {
    if (this.abierta()) {
      this.cerrar();
      return;
    }
    //menú mide lo mismo que el campo.
    this.ancho.set(this.boton().nativeElement.getBoundingClientRect().width);
    this.filtro.set('');
    this.abierta.set(true);
  }

  protected elegir(evento: ListboxValueChangeEvent<string>): void {
    this.valor.set(evento.value[0] ?? '');
    this.cerrar(true);
  }

  protected cerrar(volverAlCampo = false): void {
    this.abierta.set(false);
    if (volverAlCampo) this.boton().nativeElement.focus();
  }

  /** Enter en el buscador elige la primera coincidencia. */
  protected elegirPrimera(): void {
    const primera = this.visibles()[0];
    if (!primera) return;
    this.valor.set(primera.valor);
    this.cerrar(true);
  }

  protected enfocarLista(): void {
    setTimeout(() => (this.buscador() ?? this.lista())?.nativeElement.focus());
  }
}

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}
