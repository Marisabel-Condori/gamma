import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { GmBoton, GmColumna, GmEncabezado, GmRutaNavegacion, GmTabla, Toast } from '../../../shared/ui';
import { cantidad, monto } from '../../../shared/utils/numeros';
import { PeriodoLibroIvaResponse } from './data/libro-iva.model';

const COLUMNAS: GmColumna<PeriodoLibroIvaResponse>[] = [
  { id: 'periodo', titulo: 'Mes', destacar: true, movil: 'titulo' },
  { id: 'cantidad', titulo: 'Cantidad', alinear: 'fin', valor: (p) => cantidad(p.cantidad), etiquetaMovil: 'Cantidad' },
  { id: 'monto', titulo: 'Monto', alinear: 'fin', valor: (p) => monto(p.monto), etiquetaMovil: 'Monto' },
];

const EJEMPLO: PeriodoLibroIvaResponse[] = [
  { periodo: '2026-10', cantidad: 16837141, monto: 338248901.17 },
  { periodo: '2026-09', cantidad: 15769601, monto: 393035635.12 },
  { periodo: '2026-08', cantidad: 15786576, monto: 328310359.29 },
  { periodo: '2026-07', cantidad: 16772475, monto: 318883314.25 },
  { periodo: '2026-06', cantidad: 15361853, monto: 303871119.02 },
  { periodo: '2026-05', cantidad: 14652542, monto: 313757267.98 },
];

const MEGABYTE = 1024 * 1024;

@Component({
  selector: 'gm-libro-iva-page',
  imports: [GmEncabezado, GmBoton, GmTabla],
  templateUrl: './libro-iva.page.html',
  styleUrl: './libro-iva.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'gm-pagina' },
})
export class LibroIvaPage {
  private readonly toast = inject(Toast);

  readonly columnas = COLUMNAS;
  readonly rutanavegacion: GmRutaNavegacion[] = [{ etiqueta: 'Admin' }, { etiqueta: 'Libro IVA' }];

  readonly periodos = signal<PeriodoLibroIvaResponse[]>(EJEMPLO);
  readonly arrastrando = signal(false);

  elegirArchivo(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];
    input.value = '';
    if (archivo) this.cargar(archivo);
  }

  arrastrar(event: DragEvent): void {
    event.preventDefault();
    this.arrastrando.set(true);
  }

  salirArrastre(event: DragEvent): void {
    const zona = event.currentTarget as HTMLElement;
    if (!zona.contains(event.relatedTarget as Node | null)) this.arrastrando.set(false);
  }

  soltar(event: DragEvent): void {
    event.preventDefault();
    this.arrastrando.set(false);
    const archivo = event.dataTransfer?.files[0];
    if (archivo) this.cargar(archivo);
  }

  private cargar(archivo: File): void {
    if (!archivo.name.toLowerCase().endsWith('.csv')) {
      this.toast.mostrar('El archivo debe ser .csv.');
      return;
    }
    this.toast.mostrar(`Pendiente cargar ${archivo.name} (${(archivo.size / MEGABYTE).toFixed(1)} MB).`);
  }
}
