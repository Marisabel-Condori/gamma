import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { GammaDataService } from '../../../core/data/gamma-data.service';
import { SistemaResponse } from '../../../core/models/gamma.models';
import { countLabel } from '../../../shared/utils/labels';
import { EmptyStateComponent } from '../../../shared/ui/empty-state.component';
import { IconButtonComponent } from '../../../shared/ui/icon-button.component';
import { ModalComponent } from '../../../shared/ui/modal.component';
import { PageHeaderComponent, Crumb } from '../../../shared/ui/page-header.component';
import { SearchFieldComponent } from '../../../shared/ui/search-field.component';
import { ToastService } from '../../../shared/ui/toast.service';

type SistemaDialog =
  | { kind: 'form'; id: string | null }
  | { kind: 'delete'; id: string }
  | { kind: 'homologar' };

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

  readonly subtitle = 'Gestiona los sistemas de ENTEL y su homologación por sucursal.';
  readonly query = signal('');
  readonly dialog = signal<SistemaDialog | null>(null);
  readonly formError = signal<string | null>(null);
  readonly form = signal({ codigo: '', descripcion: '' });

  readonly crumbs = computed<Crumb[]>(() => [{ label: 'Sistemas Facturadores', link: '/sistemasFacturadores' }]);

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

  readonly registeredLabel = computed(() => {
    const total = this.filtered().length;
    return `${countLabel(total, 'sistema', 'sistemas')} registrado${total === 1 ? '' : 's'}`;
  });

  readonly emptyMessage = computed(() => {
    if (this.query().trim()) {
      return 'No hay resultados para la búsqueda.';
    }
    return 'Todavía no hay sistemas internos.';
  });

  readonly active = computed(() => {
    const dialog = this.dialog();
    if (!dialog || dialog.kind === 'homologar' || !dialog.id) {
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

  openHomologar(): void {
    this.dialog.set({ kind: 'homologar' });
  }

  openProductos(sistema: SistemaResponse): void {
    void this.router.navigate(['/sistemasFacturadores', sistema.id, 'productos']);
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
