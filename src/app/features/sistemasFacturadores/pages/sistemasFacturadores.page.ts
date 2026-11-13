import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import { ConnectedPosition } from '@angular/cdk/overlay';
import { Router } from '@angular/router';
import { GammaDataService } from '../../../core/data/gamma-data.service';
import { SistemaResponse } from '../../../core/models/gamma.models';
import { countLabel } from '../../../shared/utils/labels';
import { EmptyStateComponent } from '../../../shared/ui/empty-state.component';
import { CajaBuscar, GammaIcon } from '../../../shared/ui/controles-globales';
import { GammaToolbarComponent } from '../../../shared/ui/gamma-toolbar.component';
import { ModalComponent } from '../../../shared/ui/modal.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header.component';
import { ToastService } from '../../../shared/ui/toast.service';

type SistemaDialog = { kind: 'form'; id: string | null } | { kind: 'delete'; id: string };

@Component({
  selector: 'app-sistemasFacturadores-page',
  imports: [
    PageHeaderComponent,
    GammaToolbarComponent,
    CajaBuscar,
    GammaIcon,
    CdkMenu,
    CdkMenuItem,
    CdkMenuTrigger,
    EmptyStateComponent,
    ModalComponent,
  ],
  templateUrl: './sistemasFacturadores.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './sistemasFacturadores.page.scss',
})
export class SistemasFacturadoresPage {
  private readonly state = inject(GammaDataService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly query = signal('');
  readonly dialog = signal<SistemaDialog | null>(null);
  readonly formError = signal<string | null>(null);
  readonly form = signal({ codigo: '', descripcion: '' });
  readonly menuPosition: ConnectedPosition[] = [
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 6 },
    { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -6 },
  ];
  readonly homologarMenu = [
    { id: 'productos', label: 'Productos' },
    { id: 'sucursales', label: 'Sucursales' },
    { id: 'unidades', label: 'Unidades de medida' },
    { id: 'moneda', label: 'Tipos de moneda' },
    { id: 'pago', label: 'Tipo de método de pago' },
    { id: 'anulacion', label: 'Motivo de anulación' },
  ] as const;

  readonly filtered = computed(() => {
    const query = this.query().trim().toLowerCase();
    return this.state
      .sistemas()
      .filter(
        (sistema) =>
          !query ||
          sistema.codigo.toLowerCase().includes(query) ||
          sistema.descripcion.toLowerCase().includes(query),
      );
  });

  readonly countText = computed(() => countLabel(this.filtered().length, 'sistema', 'sistemas'));

  readonly emptyMessage = computed(() => {
    if (this.query().trim()) {
      return 'No hay resultados para la búsqueda.';
    }
    return 'Todavía no hay sistemas facturadores.';
  });

  readonly active = computed(() => {
    const dialog = this.dialog();
    if (!dialog || !dialog.id) {
      return null;
    }
    return this.state.sistemas().find((sistema) => sistema.id === dialog.id) ?? null;
  });

  onQuery(value: string): void {
    this.query.set(value);
  }

  openCreate(): void {
    this.form.set({ codigo: '', descripcion: '' });
    this.formError.set(null);
    this.dialog.set({ kind: 'form', id: null });
  }

  openEdit(sistema: SistemaResponse): void {
    this.form.set({ codigo: sistema.codigo, descripcion: sistema.descripcion });
    this.formError.set(null);
    this.dialog.set({ kind: 'form', id: sistema.id });
  }

  openDelete(sistema: SistemaResponse): void {
    this.dialog.set({ kind: 'delete', id: sistema.id });
  }

  chooseHomologar(sistemaId: string, option: string): void {
    if (option === 'productos') {
      void this.router.navigate(['/sistemas-facturadores', sistemaId, 'productos']);
      return;
    }
    this.toast.show('Esta opción todavía no está disponible.');
  }

  close(): void {
    this.dialog.set(null);
    this.formError.set(null);
  }

  onField(field: 'codigo' | 'descripcion', event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.form.update((form) => ({ ...form, [field]: value }));
  }

  save(event: Event): void {
    event.preventDefault();
    const dialog = this.dialog();
    if (!dialog || dialog.kind !== 'form') {
      return;
    }
    const payload = this.form();
    const error = dialog.id
      ? this.state.updateSistema(dialog.id, payload)
      : this.state.createSistema(payload);
    if (error) {
      this.formError.set(error);
      return;
    }
    this.toast.show(dialog.id ? 'Sistema actualizado.' : 'Sistema creado.');
    this.close();
  }

  confirmDelete(): void {
    const sistema = this.active();
    if (!sistema) {
      return;
    }
    this.state.deleteSistema(sistema.id);
    this.toast.show(`${sistema.codigo} eliminado.`);
    this.close();
  }
}
