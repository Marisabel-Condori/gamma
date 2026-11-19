import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { GammaState } from '../../../core/state/gamma-state';
import { Crumb, PageHeaderComponent } from '../../../shared/ui/page-header.component';
import { SearchFieldComponent } from '../../../shared/ui/search-field.component';
import { IconButtonComponent } from '../../../shared/ui/icon-button.component';
import { ModalComponent } from '../../../shared/ui/modal.component';

interface SucursalHomologada {
  id: string;
  fecha: string;
  codigo: string;
  descripcion: string;
  codigoSin: string;
  descripcionSin: string;
  puntoCodigo: string;
  puntoDescripcion: string;
}

type PageToken = number | '…';
type BranchDialog = 'form' | 'delete' | null;
type BranchForm = Omit<SucursalHomologada, 'id' | 'fecha'>;

const EMPTY_FORM: BranchForm = {
  codigo: '', descripcion: '', codigoSin: '', descripcionSin: '', puntoCodigo: '', puntoDescripcion: '',
};

@Component({
  selector: 'app-sucursales-homologadas-page',
  imports: [RouterLink, PageHeaderComponent, SearchFieldComponent, IconButtonComponent, ModalComponent],
  templateUrl: './sucursales-homologadas.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SucursalesHomologadasPage {
  private readonly state = inject(GammaState);
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });

  readonly rows = signal<SucursalHomologada[]>([]);
  readonly query = signal('');
  readonly page = signal(1);
  readonly pageSize = signal(10);
  readonly dialog = signal<BranchDialog>(null);
  readonly selected = signal<SucursalHomologada | null>(null);
  readonly form = signal<BranchForm>({ ...EMPTY_FORM });
  readonly formError = signal<string | null>(null);
  readonly empresa = computed(() => this.state.empresas().find(row => row.id === this.params().get('empresaId')) ?? null);
  readonly sistema = computed(() => this.state.sistemas().find(row => row.id === this.params().get('sistemaId')) ?? null);
  readonly backLink = computed(() => `/sistemasFacturadores/${this.empresa()?.id ?? ''}`);
  readonly crumbs = computed<Crumb[]>(() => [
    { label: 'Sistemas Facturadores', link: '/sistemasFacturadores' },
    { label: 'Sistemas internos', link: this.backLink() },
    { label: this.sistema()?.codigo ?? 'Sistema' },
  ]);

  readonly filtered = computed(() => {
    const query = normalize(this.query());
    return this.rows().filter(row => !query || Object.values(row).some(value => normalize(value).includes(query)));
  });
  readonly total = computed(() => this.filtered().length);
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));
  readonly safePage = computed(() => Math.min(this.page(), this.totalPages()));
  readonly pageRows = computed(() => this.filtered().slice((this.safePage() - 1) * this.pageSize(), this.safePage() * this.pageSize()));
  readonly rangeLabel = computed(() => {
    if (!this.total()) return 'Mostrando 0 de 0 registros';
    const from = (this.safePage() - 1) * this.pageSize() + 1;
    return `Mostrando ${from}–${Math.min(this.total(), this.safePage() * this.pageSize())} de ${this.total()} registros`;
  });
  readonly pageList = computed<PageToken[]>(() => {
    const total = this.totalPages();
    const current = this.safePage();
    if (total <= 6) return Array.from({ length: total }, (_, index) => index + 1);
    if (current <= 3) return [1, 2, 3, '…', total];
    if (current >= total - 2) return [1, '…', total - 2, total - 1, total];
    return [1, '…', current - 1, current, current + 1, '…', total];
  });

  onQuery(value: string): void { this.query.set(value); this.page.set(1); }
  onPageSize(event: Event): void { this.pageSize.set(Number((event.target as HTMLSelectElement).value)); this.page.set(1); }
  goTo(page: number): void { this.page.set(page); }
  previous(): void { this.page.set(Math.max(1, this.safePage() - 1)); }
  next(): void { this.page.set(Math.min(this.totalPages(), this.safePage() + 1)); }

  openCreate(): void {
    this.selected.set(null);
    this.form.set({ ...EMPTY_FORM });
    this.formError.set(null);
    this.dialog.set('form');
  }

  openEdit(row: SucursalHomologada): void {
    this.selected.set(row);
    this.form.set({ codigo: row.codigo, descripcion: row.descripcion, codigoSin: row.codigoSin, descripcionSin: row.descripcionSin, puntoCodigo: row.puntoCodigo, puntoDescripcion: row.puntoDescripcion });
    this.formError.set(null);
    this.dialog.set('form');
  }

  openDelete(row: SucursalHomologada): void { this.selected.set(row); this.dialog.set('delete'); }
  close(): void { this.dialog.set(null); this.formError.set(null); }
  onField(field: keyof BranchForm, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.form.update(current => ({ ...current, [field]: value }));
  }

  save(event: Event): void {
    event.preventDefault();
    const form = this.form();
    if (!form.codigo.trim() || !form.descripcion.trim() || !form.codigoSin.trim() || !form.descripcionSin.trim()) {
      this.formError.set('Completa los códigos y descripciones de ambas sucursales.');
      return;
    }
    const selected = this.selected();
    if (selected) {
      this.rows.update(rows => rows.map(row => row.id === selected.id ? { ...selected, ...form } : row));
    } else {
      const now = new Date();
      const fecha = `${now.toLocaleDateString('es-BO')} ${now.toLocaleTimeString('es-BO')}`;
      this.rows.update(rows => [{ id: `local-${Date.now()}`, fecha, ...form }, ...rows]);
      this.page.set(1);
    }
    this.close();
  }

  confirmDelete(): void {
    const selected = this.selected();
    if (!selected) return;
    this.rows.update(rows => rows.filter(row => row.id !== selected.id));
    this.page.set(Math.min(this.page(), Math.max(1, Math.ceil((this.total() - 1) / this.pageSize()))));
    this.close();
  }
}

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
