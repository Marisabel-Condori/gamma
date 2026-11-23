import { CdkConnectedOverlay, CdkOverlayOrigin, ConnectedPosition } from '@angular/cdk/overlay';
import { Component, ElementRef, computed, input, model, signal, viewChild } from '@angular/core';
import { GmIcono } from '../icono/icono';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const DIAS_SEMANA = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

const POSICIONES: ConnectedPosition[] = [
  { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 6 },
  { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -6 },
];

let siguienteId = 0;

/** <gm-fecha etiqueta="Periodo" [(valor)]="periodo" />  ej. "20261025". */
@Component({
  selector: 'gm-fecha',
  imports: [CdkConnectedOverlay, CdkOverlayOrigin, GmIcono],
  template: `
    <div class="gm-campo">
      <span [id]="id + '-etiqueta'">{{ etiqueta() }}</span>
      <button
        #boton
        type="button"
        class="control"
        cdkOverlayOrigin
        #origen="cdkOverlayOrigin"
        aria-haspopup="dialog"
        [attr.aria-labelledby]="id + '-etiqueta'"
        [attr.aria-expanded]="abierto()"
        [class.vacia]="!valor()"
        (click)="alternar()"
      >
        <span class="texto">{{ valor() || placeholder() }}</span>
        <gm-icono nombre="calendario" />
      </button>
    </div>

    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="origen"
      [cdkConnectedOverlayOpen]="abierto()"
      [cdkConnectedOverlayPositions]="posiciones"
      cdkConnectedOverlayHasBackdrop
      cdkConnectedOverlayBackdropClass="cdk-overlay-transparent-backdrop"
      (backdropClick)="cerrar()"
      (overlayKeydown)="$event.key === 'Escape' && cerrar(true)"
      (detach)="abierto.set(false)"
    >
      <div class="panel" role="dialog" [attr.aria-labelledby]="id + '-etiqueta'">
        <div class="cabecera">
          <button type="button" class="flecha" aria-label="Mes anterior" (click)="moverMes(-1)">
            <gm-icono nombre="anterior" />
          </button>
          <strong>{{ nombreMes() }} {{ anio() }}</strong>
          <button type="button" class="flecha" aria-label="Mes siguiente" (click)="moverMes(1)">
            <gm-icono nombre="siguiente" />
          </button>
        </div>
        <div class="dias">
          @for (dia of diasSemana; track $index) {
            <span class="dia-semana">{{ dia }}</span>
          }
          @for (dia of dias(); track $index) {
            @if (dia) {
              <button
                type="button"
                class="dia"
                [class.elegido]="esElegido(dia)"
                [class.hoy]="esHoy(dia)"
                (click)="elegir(dia)"
              >
                {{ dia }}
              </button>
            } @else {
              <span></span>
            }
          }
        </div>
      </div>
    </ng-template>
  `,
  styleUrl: './fecha.scss',
})
export class GmFecha {
  readonly etiqueta = input.required<string>();
  readonly valor = model('');
  readonly placeholder = input('AAAAMMDD');

  protected readonly id = `gm-fecha-${siguienteId++}`;
  protected readonly posiciones = POSICIONES;
  protected readonly diasSemana = DIAS_SEMANA;
  protected readonly abierto = signal(false);
  protected readonly anio = signal(new Date().getFullYear());
  /** 0 = enero. */
  protected readonly mes = signal(new Date().getMonth());

  protected readonly nombreMes = computed(() => MESES[this.mes()]);

  /** Días del mes en la cuadrícula, con huecos (null) para empezar en lunes. */
  protected readonly dias = computed(() => {
    const primero = new Date(this.anio(), this.mes(), 1).getDay();
    const huecos = (primero + 6) % 7;
    const total = new Date(this.anio(), this.mes() + 1, 0).getDate();
    return [...Array(huecos).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)] as (number | null)[];
  });

  private readonly boton = viewChild.required<ElementRef<HTMLButtonElement>>('boton');

  protected alternar(): void {
    if (this.abierto()) {
      this.cerrar();
      return;
    }
    const valor = this.valor();
    const hoy = new Date();
    this.anio.set(/^\d{8}$/.test(valor) ? Number(valor.slice(0, 4)) : hoy.getFullYear());
    this.mes.set(/^\d{8}$/.test(valor) ? Number(valor.slice(4, 6)) - 1 : hoy.getMonth());
    this.abierto.set(true);
  }

  protected moverMes(paso: number): void {
    const fecha = new Date(this.anio(), this.mes() + paso, 1);
    this.anio.set(fecha.getFullYear());
    this.mes.set(fecha.getMonth());
  }

  protected esElegido(dia: number): boolean {
    return this.valor() === this.formato(dia);
  }

  protected esHoy(dia: number): boolean {
    const hoy = new Date();
    return this.anio() === hoy.getFullYear() && this.mes() === hoy.getMonth() && dia === hoy.getDate();
  }

  protected elegir(dia: number): void {
    this.valor.set(this.formato(dia));
    this.cerrar(true);
  }

  protected cerrar(volverAlCampo = false): void {
    this.abierto.set(false);
    if (volverAlCampo) this.boton().nativeElement.focus();
  }

  private formato(dia: number): string {
    const dos = (n: number) => String(n).padStart(2, '0');
    return `${this.anio()}${dos(this.mes() + 1)}${dos(dia)}`;
  }
}
