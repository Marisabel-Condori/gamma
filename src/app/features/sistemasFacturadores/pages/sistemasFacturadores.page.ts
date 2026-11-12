import { ChangeDetectionStrategy, Component, computed, HostListener, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { GammaDataService } from '../../../core/data/gamma-data.service';
import { SistemaResponse } from '../../../core/models/gamma.models';
import { countLabel } from '../../../shared/utils/labels';
import { EmptyStateComponent } from '../../../shared/ui/empty-state.component';
import { IconButtonComponent } from '../../../shared/ui/icon-button.component';
import { ModalComponent } from '../../../shared/ui/modal.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header.component';
import { SearchFieldComponent } from '../../../shared/ui/search-field.component';
import { ToastService } from '../../../shared/ui/toast.service';

type SistemaDialog = { kind: 'form'; id: string | null } | { kind: 'delete'; id: string };

interface OpenMenu {
  id: string;
  top: number;
  left: number;
}

@Component({
  selector: 'app-sistemasFacturadores-page',
  imports: [
    PageHeaderComponent,
    SearchFieldComponent,
    IconButtonComponent,
    EmptyStateComponent,
    ModalComponent,
  ],
  templateUrl: './sistemasFacturadores.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: ':host { display: block; }',
})
export class SistemasFacturadoresPage {
  private readonly state = inject(GammaDataService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly query = signal('');
  readonly dialog = signal<SistemaDialog | null>(null);
  readonly menu = signal<OpenMenu | null>(null);
  readonly formError = signal<string | null>(null);
  readonly form = signal({ codigo: '', descripcion: '' });
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

  toggleMenu(sistema: SistemaResponse, event: Event): void {
    if (this.menu()?.id === sistema.id) {
      this.menu.set(null);
      return;
    }
    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    const width = 240;
    const height = 248;
    const left = Math.max(12, Math.min(rect.right - width, window.innerWidth - width - 12));
    const top =
      rect.bottom + 6 + height > window.innerHeight
        ? Math.max(8, rect.top - 6 - height)
        : rect.bottom + 6;
    this.menu.set({ id: sistema.id, top, left });
  }

  chooseHomologar(sistemaId: string, option: string): void {
    this.menu.set(null);
    if (option === 'productos') {
      void this.router.navigate(['/sistemas-facturadores', sistemaId, 'productos']);
      return;
    }
    this.toast.show('Esta opción todavía no está disponible.');
  }

  closeMenu(): void {
    this.menu.set(null);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.menu.set(null);
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
