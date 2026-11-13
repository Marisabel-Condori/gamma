import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { GammaDataService } from '../../../core/data/gamma-data.service';
import { HomologacionProductoResponse } from '../../../core/models/gamma.models';
import { EmptyStateComponent } from '../../../shared/ui/empty-state.component';
import { CajaBuscar, GammaIcon } from '../../../shared/ui/controles-globales';
import { GammaToolbarComponent } from '../../../shared/ui/gamma-toolbar.component';
import { ModalComponent } from '../../../shared/ui/modal.component';
import { PageHeaderComponent, Crumb } from '../../../shared/ui/page-header.component';
import { ToastService } from '../../../shared/ui/toast.service';

type HomoDialog = { kind: 'form'; id: string | null } | { kind: 'delete'; id: string };
type PageToken = number | '…';

interface HomoForm {
  fecha: string;
  hora: string;
  codigoEntel: string;
  productoEntel: string;
  actividadCodigo: string;
  actividadNombre: string;
  codigoSin: string;
  productoSin: string;
}

const EMPTY_FORM: HomoForm = {
  fecha: '',
  hora: '',
  codigoEntel: '',
  productoEntel: '',
  actividadCodigo: '610000',
  actividadNombre: 'Telecomunicaciones',
  codigoSin: '',
  productoSin: '',
};

@Component({
  selector: 'app-productos-homologados-page',
  imports: [
    RouterLink,
    PageHeaderComponent,
    GammaToolbarComponent,
    CajaBuscar,
    GammaIcon,
    EmptyStateComponent,
    ModalComponent,
  ],
  templateUrl: './productosHomologados.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './productosHomologados.page.scss',
})
export class ProductosHomologadosPage {
  private readonly state = inject(GammaDataService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly sistemaId = input.required<string>();

  readonly query = signal('');
  readonly page = signal(1);
  readonly pageSize = signal(10);
  readonly dialog = signal<HomoDialog | null>(null);
  readonly formError = signal<string | null>(null);
  readonly form = signal<HomoForm>({ ...EMPTY_FORM });

  readonly sistema = computed(() => {
    const requested = this.sistemaId();
    const canonical = requested.replace(/^entel-/, '');
    return this.state.sistemas().find((item) => item.id === requested || item.id === canonical) ?? null;
  });

  readonly backLink = computed(() => '/sistemas-facturadores');

  readonly crumbs = computed<Crumb[]>(() => [
    { label: 'Sistemas Facturadores', link: '/sistemas-facturadores' },
    { label: `Homologación de productos de ${this.sistema()?.codigo ?? 'sistema'}` },
  ]);

  readonly filtered = computed(() => {
    const query = this.query().trim().toLowerCase();
    const sistemaId = this.sistema()?.id;
    return this.state.homologaciones().filter((item) => {
      if (!sistemaId || item.sistemaId !== sistemaId) {
        return false;
      }
      if (!query) {
        return true;
      }
      return [item.codigoEntel, item.productoEntel, item.actividadCodigo, item.actividadNombre, item.codigoSin, item.productoSin]
        .join(' ')
        .toLowerCase()
        .includes(query);
    });
  });

  readonly total = computed(() => this.filtered().length);
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));
  readonly safePage = computed(() => Math.min(this.page(), this.totalPages()));

  readonly pageItems = computed(() => {
    const start = (this.safePage() - 1) * this.pageSize();
    return this.filtered().slice(start, start + this.pageSize());
  });

  readonly rangeLabel = computed(() => {
    const total = this.total();
    if (total === 0) {
      return 'Mostrando 0 de 0 registros';
    }
    const from = (this.safePage() - 1) * this.pageSize() + 1;
    const to = Math.min(total, this.safePage() * this.pageSize());
    return `Mostrando ${from}–${to} de ${total} registros`;
  });

  readonly pageList = computed<PageToken[]>(() => {
    const total = this.totalPages();
    const current = this.safePage();
    if (total <= 6) {
      return Array.from({ length: total }, (_, index) => index + 1);
    }
    if (current <= 3) {
      return [1, 2, 3, '…', total];
    }
    if (current >= total - 2) {
      return [1, '…', total - 2, total - 1, total];
    }
    return [1, '…', current - 1, current, current + 1, '…', total];
  });

  readonly active = computed(() => {
    const dialog = this.dialog();
    if (!dialog || dialog.kind !== 'delete') {
      return null;
    }
    return this.state.homologaciones().find((item) => item.id === dialog.id) ?? null;
  });

  constructor() {
    effect(() => {
      const sistema = this.sistema();
      const requested = this.sistemaId();
      if (sistema && sistema.id !== requested) {
        void this.router.navigate(['/sistemas-facturadores', sistema.id, 'productos'], { replaceUrl: true });
      }
      this.query.set('');
      this.page.set(1);
      this.dialog.set(null);
    });
  }

  onQuery(value: string): void {
    this.query.set(value);
    this.page.set(1);
  }

  onPageSize(event: Event): void {
    this.pageSize.set(Number((event.target as HTMLSelectElement).value));
    this.page.set(1);
  }

  goTo(page: number): void {
    this.page.set(page);
  }

  previous(): void {
    this.page.set(Math.max(1, this.safePage() - 1));
  }

  next(): void {
    this.page.set(Math.min(this.totalPages(), this.safePage() + 1));
  }

  sentence(value: string): string {
    const text = value.toLowerCase();
    return text.charAt(0).toUpperCase() + text.slice(1).replace(/\biva\b/g, 'IVA');
  }

  openCreate(): void {
    this.form.set({ ...EMPTY_FORM });
    this.formError.set(null);
    this.dialog.set({ kind: 'form', id: null });
  }

  openEdit(item: HomologacionProductoResponse): void {
    this.form.set({
      fecha: item.fecha,
      hora: item.hora,
      codigoEntel: item.codigoEntel,
      productoEntel: item.productoEntel,
      actividadCodigo: item.actividadCodigo,
      actividadNombre: item.actividadNombre,
      codigoSin: item.codigoSin,
      productoSin: item.productoSin,
    });
    this.formError.set(null);
    this.dialog.set({ kind: 'form', id: item.id });
  }

  openDelete(item: HomologacionProductoResponse): void {
    this.dialog.set({ kind: 'delete', id: item.id });
  }

  close(): void {
    this.dialog.set(null);
    this.formError.set(null);
  }

  onField(field: keyof HomoForm, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.form.update((form) => ({ ...form, [field]: value }));
  }

  save(event: Event): void {
    event.preventDefault();
    const dialog = this.dialog();
    const sistema = this.sistema();
    if (!dialog || dialog.kind !== 'form' || !sistema) {
      return;
    }
    const payload = { ...this.form(), sistemaId: sistema.id };
    const error = dialog.id
      ? this.state.updateHomologacion(dialog.id, payload)
      : this.state.createHomologacion(payload);
    if (error) {
      this.formError.set(error);
      return;
    }
    this.toast.show(dialog.id ? 'Homologación actualizada.' : 'Homologación creada.');
    this.close();
  }

  confirmDelete(): void {
    const item = this.active();
    if (!item) {
      return;
    }
    this.state.deleteHomologacion(item.id);
    this.toast.show('Homologación eliminada.');
    this.close();
  }
}
