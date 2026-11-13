import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { GammaState } from '../../../core/state/gamma-state';
import { HomologacionSucursal } from '../models/homologacion-sucursal.model';
import { SucursalesState } from '../state/sucursales.state';
import { PageHeaderComponent } from '../../../shared/ui/page-header.component';
import { Crumb } from '../../../shared/ui/page-header.component';
import { SearchFieldComponent } from '../../../shared/ui/search-field.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state.component';
import { ModalComponent } from '../../../shared/ui/modal.component';
import { ToastService } from '../../../shared/ui/toast.service';

type PageToken = number | '…';

@Component({
  selector: 'app-homologar-sucursales-page',
  imports: [RouterLink, PageHeaderComponent, SearchFieldComponent, EmptyStateComponent, ModalComponent],
  template: `
    <section class="page homo-page branches-page">
      <a class="back homo-mobile-back" [routerLink]="backLink()"><span class="material-icons">chevron_left</span>Sistemas internos</a>
      <app-page-header title="Sucursales homologadas" [crumbs]="crumbs()" [backLink]="backLink()" backLabel="Volver a sistemas internos" />
      <button type="button" class="btn-primary homo-create" (click)="openCreate()"><span class="material-icons">add</span>Nueva homologación</button>
      @if (sistema(); as sistema) {
      <div class="toolbar homo-toolbar">
        <div class="system-chip"><span>Sistema:</span><strong>{{ sistema.codigo }}</strong><span>· {{ empresa()?.codigo }}</span></div>
        <app-search-field placeholder="Buscar por código o descripción..." [value]="searchQuery()" (valueChange)="onSearch($event)" />
      </div>
      }
      @if (filtered().length === 0) {
        <app-empty-state [message]="sistema() ? (searchQuery() ? 'No hay resultados para la búsqueda.' : 'Este sistema todavía no tiene sucursales homologadas.') : 'Ese sistema no fue encontrado.'" />
      } @else {
      <div class="table-wrap"><div class="homo-sheet">
        <table class="homo-table">
          <thead>
            <tr><th class="group" colspan="2">SIN</th><th rowspan="2">Asignación puntos de venta</th><th rowspan="2">Acciones</th></tr>
            <tr><th>Código sucursal</th><th>Descripción</th></tr>
          </thead>
          <tbody>
            @for (row of pageRows(); track row.id) {
              <tr><td>{{ row.codigo }}</td><td>{{ row.descripcion }}</td><td><button class="icon-btn" type="button" aria-label="Ver puntos de venta" title="Asignación puntos de venta" (click)="showPoints(row)"><span class="material-icons">store</span></button></td><td><div class="actions inline"><button class="icon-btn" title="Ver puntos de venta" aria-label="Ver puntos de venta" (click)="showPoints(row)"><span class="material-icons">list</span></button><button class="icon-btn" title="Editar" aria-label="Editar sucursal" (click)="openEdit(row)"><span class="material-icons">edit</span></button><button class="icon-btn danger" title="Eliminar" aria-label="Eliminar sucursal" (click)="remove(row)"><span class="material-icons">delete</span></button></div></td></tr>
            }
          </tbody>
        </table>
      </div></div>
      <div class="homo-cards">
        <p class="homo-range">{{ rangeLabel() }}</p>
        @for (row of pageRows(); track row.id) {
          <article class="homo-card">
            <p class="homo-kicker">Sucursal SIN</p>
            <h3>Código {{ row.codigo }}</h3>
            <p>{{ row.descripcion }}</p>
            <button type="button" class="proc" (click)="showPoints(row)">
              <span class="material-icons">store</span>
              Asignación puntos de venta
            </button>
            <div class="homo-card-foot">
              <p>{{ row.puntosVenta.length }} puntos de venta asignados</p>
              <div class="actions inline">
                <button class="icon-btn" title="Editar" aria-label="Editar sucursal" (click)="openEdit(row)"><span class="material-icons">edit</span></button>
                <button class="icon-btn danger" title="Eliminar" aria-label="Eliminar sucursal" (click)="remove(row)"><span class="material-icons">delete</span></button>
              </div>
            </div>
          </article>
        }
      </div>
      <div class="pager"><span>{{ rangeLabel() }}</span><div class="pager-pages"><button type="button" class="pager-btn" [disabled]="page() === 1" (click)="go(page()-1)"><span class="material-icons">chevron_left</span></button>@for (item of pageList(); track $index) { @if (item === '…') { <span class="pager-gap">…</span> } @else { <button type="button" class="pager-btn" [class.current]="item === page()" (click)="go(item)">{{ item }}</button> } }<button type="button" class="pager-btn" [disabled]="page() === totalPages()" (click)="go(page()+1)"><span class="material-icons">chevron_right</span></button></div><label class="pager-size">Por página:<select [value]="pageSize()" (change)="pageSize.set(+$any($event.target).value); page.set(1)"><option>10</option><option>20</option><option>50</option></select></label></div>
      }
      @if (dialog()) {
        @if (dialog() === 'form') {
          <app-modal [title]="selected() ? 'Editar sucursal' : 'Nueva homologación'" (closed)="close()">
            <form (submit)="save($event)" novalidate>
              <div class="fields">
                <label class="field">Código sucursal SIN<input [value]="formCodigo()" (input)="formCodigo.set(inputValue($event))" /></label>
                <label class="field">Descripción<input [value]="formDescription()" (input)="formDescription.set(inputValue($event))" /></label>
              </div>
              @if (formError()) { <p class="form-error">{{ formError() }}</p> }
              <div class="modal-actions"><button type="button" class="btn-ghost" (click)="close()">Cancelar</button><button type="submit" class="btn-primary">Guardar</button></div>
            </form>
          </app-modal>
        }
        @if (dialog() === 'delete' && selected(); as row) {
          <app-modal title="Eliminar sucursal" (closed)="close()">
            <p class="muted">¿Deseas eliminar la sucursal {{ row.codigo }}?</p>
            <div class="modal-actions"><button type="button" class="btn-ghost" (click)="close()">Cancelar</button><button type="button" class="btn-danger" (click)="confirmDelete()">Eliminar</button></div>
          </app-modal>
        }
      }
    </section>
  `,
  styles: ':host { display: block; }',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomologarSucursalesPage {
  private readonly state = inject(GammaState);
  private readonly sucursalesState = inject(SucursalesState);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  readonly empresaId = input.required<string>();
  readonly sistemaId = input.required<string>();
  readonly sistema = computed(() => this.state.sistemas().find(item => item.id === this.sistemaId()) ?? null);
  readonly empresa = computed(() => this.state.empresas().find(item => item.id === this.empresaId()) ?? null);
  readonly backLink = computed(() => `/sistemasFacturadores/${this.empresaId()}`);
  readonly rows = computed(() => this.sucursalesState.rows().filter(item => item.sistemaId === this.sistemaId()));
  readonly searchQuery = signal('');
  readonly page = signal(1);
  readonly pageSize = signal(10);
  readonly dialog = signal<'form' | 'delete' | null>(null);
  readonly selected = signal<HomologacionSucursal | null>(null);
  readonly formCodigo = signal('');
  readonly formDescription = signal('');
  readonly formError = signal<string | null>(null);
  readonly crumbs = computed<Crumb[]>(() => [
    { label: 'Sistemas Facturadores', link: '/sistemasFacturadores' },
    { label: 'Sistemas internos', link: this.backLink() },
    { label: this.sistema()?.codigo ?? 'Sistema' },
  ]);
  readonly filtered = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    return this.rows().filter(row => !query || `${row.codigo} ${row.descripcion} ${row.puntosVenta.join(' ')}`.toLowerCase().includes(query));
  });
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize())));
  readonly pageList = computed<PageToken[]>(() => {
    const total = this.totalPages();
    const current = this.page();
    if (total <= 6) return Array.from({ length: total }, (_, index) => index + 1);
    if (current <= 3) return [1, 2, 3, '…', total];
    if (current >= total - 2) return [1, '…', total - 2, total - 1, total];
    return [1, '…', current - 1, current, current + 1, '…', total];
  });
  readonly pageRows = computed(() => this.filtered().slice((this.page() - 1) * this.pageSize(), this.page() * this.pageSize()));
  readonly rangeLabel = computed(() => this.filtered().length ? `${(this.page() - 1) * this.pageSize() + 1}–${Math.min(this.page() * this.pageSize(), this.filtered().length)} de ${this.filtered().length} registros` : '0 de 0 registros');

  constructor() {
    effect(() => {
      this.sistemaId();
      this.searchQuery.set('');
      this.page.set(1);
      this.dialog.set(null);
    });
  }

  inputValue(event: Event): string { return (event.target as HTMLInputElement).value; }
  onSearch(value: string): void { this.searchQuery.set(value); this.page.set(1); }
  go(page: number): void { this.page.set(Math.max(1, Math.min(page, this.totalPages()))); }
  openCreate(): void { this.selected.set(null); this.formCodigo.set(''); this.formDescription.set(''); this.formError.set(null); this.dialog.set('form'); }
  openEdit(row: HomologacionSucursal): void { this.selected.set(row); this.formCodigo.set(row.codigo); this.formDescription.set(row.descripcion); this.formError.set(null); this.dialog.set('form'); }
  showPoints(row: HomologacionSucursal): void {
    void this.router.navigate([
      '/sistemasFacturadores', this.empresaId(), this.sistemaId(), 'sucursales', row.id, 'puntos-venta',
    ]);
  }
  close(): void { this.dialog.set(null); this.formError.set(null); }
  save(event: Event): void {
    event.preventDefault();
    const codigo = this.formCodigo().trim(); const descripcion = this.formDescription().trim();
    if (!codigo || !descripcion) { this.formError.set('Completa el código y la descripción de la sucursal.'); return; }
    const existing = this.selected();
    const input = { sistemaId: this.sistemaId(), codigo, descripcion, puntosVenta: existing?.puntosVenta ?? [] };
    const error = existing ? this.sucursalesState.update(existing.id, input) : this.sucursalesState.create(input);
    if (error) { this.formError.set(error); return; }
    this.toast.show(existing ? 'Sucursal actualizada.' : 'Sucursal creada.'); this.close();
  }
  remove(row: HomologacionSucursal): void { this.selected.set(row); this.dialog.set('delete'); }
  confirmDelete(): void {
    const row = this.selected();
    if (!row) return;
    this.sucursalesState.delete(row.id);
    this.go(this.page());
    this.toast.show('Sucursal eliminada.');
    this.close();
  }
}
