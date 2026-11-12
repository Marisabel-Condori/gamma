import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GammaState } from '../../../core/state/gamma-state';
import { EmptyStateComponent } from '../../../shared/ui/empty-state.component';
import { IconButtonComponent } from '../../../shared/ui/icon-button.component';
import { ModalComponent } from '../../../shared/ui/modal.component';
import { PageHeaderComponent, Crumb } from '../../../shared/ui/page-header.component';
import { SearchFieldComponent } from '../../../shared/ui/search-field.component';
import { ToastService } from '../../../shared/ui/toast.service';
import { PuntoVenta } from '../models/punto-venta.model';
import { SucursalesState } from '../state/sucursales.state';
import { PuntosVentaState } from '../state/puntos-venta.state';

@Component({
  selector: 'app-puntos-venta-page',
  imports: [RouterLink, PageHeaderComponent, SearchFieldComponent, EmptyStateComponent, IconButtonComponent, ModalComponent],
  template: `
    <section class="page homo-page points-page">
      @if (sucursal(); as sucursal) {
        <a class="back homo-mobile-back" [routerLink]="backLink()"><span class="material-icons">chevron_left</span>Sucursales homologadas</a>
        <app-page-header title="Puntos de venta" [crumbs]="crumbs()" [backLink]="backLink()" backLabel="Volver a sucursales" />
        <button type="button" class="btn-primary homo-create" (click)="sync()"><span class="material-icons">sync</span>Sincronizar puntos de venta</button>
        <div class="toolbar homo-toolbar">
          <div class="system-chip"><span>Sistema:</span><strong>{{ sistema()?.codigo }}</strong><span>· {{ empresa()?.codigo }}</span></div>
          <div class="branch-context"><strong>Sucursal {{ sucursal.codigo }}</strong><span>{{ sucursal.descripcion }}</span></div>
          <app-search-field placeholder="Buscar por código, punto de venta o CUIS..." [value]="query()" (valueChange)="onQuery($event)" />
        </div>
        @if (filtered().length === 0) {
          <app-empty-state [message]="query() ? 'No hay resultados para la búsqueda.' : 'Esta sucursal todavía no tiene puntos de venta asignados.'" />
        } @else {
          <div class="table-wrap"><div class="homo-sheet points-sheet"><table class="homo-table points-table">
            <thead>
              <tr><th>Código punto venta SIN</th><th>Descripción</th><th>CUIS</th><th>Reprocesar CUIS</th><th>Fecha vigencia CUIS</th><th>CUFD</th><th>Reprocesar CUFD</th><th>Fecha vigencia CUFD</th><th>Tipo punto venta</th><th>Sincroniza</th><th>Acciones</th></tr>
            </thead>
            <tbody>@for (row of pageRows(); track row.id) {
              <tr><td>{{ row.codigo }}</td><td class="point-name">{{ row.descripcion }}</td><td>{{ row.cuis }}</td><td class="reprocess-action"><button type="button" class="icon-btn" title="Reprocesar CUIS" aria-label="Reprocesar CUIS" (click)="openReprocess(row, 'CUIS')"><span class="material-icons">sync</span></button></td><td>{{ row.fechaCuis }}</td><td class="token">{{ row.cufd }}</td><td class="reprocess-action"><button type="button" class="icon-btn" title="Reprocesar CUFD" aria-label="Reprocesar CUFD" (click)="openReprocess(row, 'CUFD')"><span class="material-icons">sync</span></button></td><td>{{ row.fechaCufd }}</td><td>{{ row.tipo }}</td><td>{{ row.sincroniza ? 'Sí' : 'No' }}</td><td><div class="actions inline"><app-icon-button icon="edit" label="Editar punto de venta" (pressed)="notify('Edición de punto de venta')" /><app-icon-button icon="delete" label="Eliminar punto de venta" tone="danger" (pressed)="notify('Eliminación de punto de venta')" /></div></td></tr>
            }</tbody>
          </table></div></div>
          <div class="homo-cards point-cards">
            <p class="homo-range">{{ rangeLabel() }}</p>
            @for (row of pageRows(); track row.id) {
              <article class="homo-card">
                <p class="homo-kicker">Punto de venta SIN</p>
                <h3>{{ row.descripcion }}</h3>
                <p>Código: {{ row.codigo }} · Sincroniza: {{ row.sincroniza ? 'Sí' : 'No' }}</p>
                <p>CUIS: {{ row.cuis }} · Vigencia: {{ row.fechaCuis }}</p>
                <p class="point-token">CUFD: {{ row.cufd }}</p>
                <p>Vigencia CUFD: {{ row.fechaCufd }}</p>
                <p>Tipo: {{ row.tipo }}</p>
                <div class="point-card-reprocess">
                  <button type="button" class="proc" (click)="openReprocess(row, 'CUIS')"><span class="material-icons">sync</span>Reprocesar CUIS</button>
                  <button type="button" class="proc" (click)="openReprocess(row, 'CUFD')"><span class="material-icons">sync</span>Reprocesar CUFD</button>
                </div>
                <div class="homo-card-foot"><p>Acciones</p><div class="actions inline"><app-icon-button icon="edit" label="Editar punto de venta" (pressed)="notify('Edición de punto de venta')" /><app-icon-button icon="delete" label="Eliminar punto de venta" tone="danger" (pressed)="notify('Eliminación de punto de venta')" /></div></div>
              </article>
            }
          </div>
          <div class="pager"><span>{{ rangeLabel() }}</span><div class="pager-pages"><button type="button" class="pager-btn" [disabled]="page() === 1" (click)="go(page()-1)"><span class="material-icons">chevron_left</span></button>@for (item of pageList(); track $index) { @if (item === '…') { <span class="pager-gap">…</span> } @else { <button type="button" class="pager-btn" [class.current]="item === page()" (click)="go(item)">{{ item }}</button> } }<button type="button" class="pager-btn" [disabled]="page() === totalPages()" (click)="go(page()+1)"><span class="material-icons">chevron_right</span></button></div><label class="pager-size">Por página:<select [value]="pageSize()" (change)="pageSize.set(+$any($event.target).value); page.set(1)"><option>10</option><option>20</option><option>50</option></select></label></div>
        }
      } @else {
        <app-page-header title="Puntos de venta" subtitle="No se encontró la sucursal seleccionada." [backLink]="backLink()" backLabel="Volver a sucursales" />
      }
      @if (reprocessTarget(); as target) {
        <app-modal class="points-reprocess-modal" [title]="'Reproceso ' + reprocessKind()" (closed)="closeReprocess()">
          <div class="system-chip reprocess-system"><strong>Sistemas SIN</strong></div>
          <app-search-field class="reprocess-search" placeholder="Buscar sistema SIN, código, CUIS o CUFD..." [value]="reprocessQuery()" (valueChange)="onReprocessQuery($event)" />
          @if (showReprocessRow()) {
          <div class="table-wrap reprocess-table-wrap"><table class="homo-table reprocess-table">
            <thead><tr><th>Sistema SIN</th><th>Código sistema SIN</th><th>CUIS</th>@if (reprocessKind() === 'CUIS') { <th>Reproceso</th> } @else { <th>CUFD</th> }</tr></thead>
            <tbody><tr><td>GWSFE</td><td>6D32BF2BE623402486D98B7</td><td>{{ target.cuis }}</td>@if (reprocessKind() === 'CUIS') { <td><app-icon-button icon="sync" label="Reprocesar CUIS" (pressed)="reprocess()" /></td> } @else { <td><span class="reprocess-value">{{ target.cufd }}</span></td> }</tr></tbody>
          </table></div>
          <div class="pager reprocess-pager"><span>Mostrando 1–1 de 1 registros</span><div class="pager-pages"><button type="button" class="pager-btn current">1</button></div><label class="pager-size">Por página:<select><option>5</option></select></label></div>
          } @else {
            <app-empty-state message="No hay resultados para la búsqueda." />
          }
        </app-modal>
      }
    </section>
  `,
  styles: `
    :host{display:block}.points-page .homo-toolbar{align-items:flex-start}.branch-context{display:grid;gap:3px;min-width:260px;max-width:520px;padding:8px 12px;border:1px solid var(--line);border-radius:12px;background:#fff;font-size:13px}.branch-context span{color:var(--ink-soft);font-size:12px;line-height:1.4}.points-sheet{min-width:1550px}.points-table th{text-align:center;vertical-align:middle;min-width:88px}.points-table td{font-size:12.5px}.points-table .point-name{font-weight:700;min-width:180px}.points-table .token{max-width:230px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.points-table td:nth-child(5),.points-table td:nth-child(8){min-width:116px;white-space:nowrap}.points-table .reprocess-action{text-align:center;min-width:76px}.points-table td:nth-child(10){text-align:center}.points-table td:last-child{min-width:110px}.points-page .homo-create{display:inline-flex;align-items:center;gap:7px}.points-page .reprocess-table-wrap{display:block;overflow-x:auto}.points-page .reprocess-pager>span:first-child{display:inline}.reprocess-table td:nth-child(2),.reprocess-value{overflow-wrap:anywhere;word-break:break-word}.reprocess-pager{margin-top:8px;font-size:12px}.reprocess-pager .pager-pages{margin:auto}.point-token{overflow-wrap:anywhere;word-break:break-word}.point-card-reprocess{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}.point-card-reprocess .proc{padding:6px 8px;border-radius:8px;background:var(--brand-soft);font-size:12px}@media(max-width:760px){.points-page .homo-toolbar{align-items:stretch}.points-page .branch-context{order:4;max-width:none;width:100%;box-sizing:border-box}.points-page .homo-create{order:5}.points-page .search{order:6}.points-page .homo-cards{order:7}.points-page .pager{order:8}.points-sheet{min-width:1450px}}
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PuntosVentaPage {
  private readonly gamma = inject(GammaState);
  private readonly sucursales = inject(SucursalesState);
  private readonly puntosVenta = inject(PuntosVentaState);
  private readonly toast = inject(ToastService);
  readonly empresaId = input.required<string>();
  readonly sistemaId = input.required<string>();
  readonly sucursalId = input.required<string>();
  readonly query = signal('');
  readonly reprocessTarget = signal<PuntoVenta | null>(null);
  readonly reprocessKind = signal<'CUIS' | 'CUFD'>('CUFD');
  readonly reprocessQuery = signal('');
  readonly showReprocessRow = computed(() => {
    const target = this.reprocessTarget();
    const query = this.reprocessQuery().trim().toLowerCase();
    return !!target && (!query || `gwsfe 6d32bf2be623402486d98b7 ${target.cuis} ${target.cufd}`.toLowerCase().includes(query));
  });
  readonly page = signal(1);
  readonly pageSize = signal(10);
  readonly sistema = computed(() => this.gamma.sistemas().find(item => item.id === this.sistemaId()) ?? null);
  readonly empresa = computed(() => this.gamma.empresas().find(item => item.id === this.empresaId()) ?? null);
  readonly sucursal = computed(() => this.sucursales.rows().find(item => item.id === this.sucursalId()) ?? null);
  readonly backLink = computed(() => `/sistemasFacturadores/${this.empresaId()}/${this.sistemaId()}/sucursales`);
  readonly rows = computed(() => this.puntosVenta.forSucursal(this.sucursalId()));
  readonly crumbs = computed<Crumb[]>(() => [
    { label: 'Sistemas Facturadores', link: '/sistemasFacturadores' },
    { label: 'Sistemas internos', link: `/sistemasFacturadores/${this.empresaId()}` },
    { label: this.sistema()?.codigo ?? 'Sistema', link: this.backLink() },
    { label: 'Sucursales', link: this.backLink() },
    { label: `Sucursal ${this.sucursal()?.codigo ?? ''}` },
  ]);
  readonly filtered = computed(() => {
    const query = this.query().trim().toLowerCase();
    return this.rows().filter(row => !query || `${row.codigo} ${row.descripcion} ${row.cuis} ${row.cufd} ${row.tipo}`.toLowerCase().includes(query));
  });
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize())));
  readonly pageRows = computed(() => this.filtered().slice((this.page() - 1) * this.pageSize(), this.page() * this.pageSize()));
  readonly pageList = computed(() => {
    const total = this.totalPages(); const current = this.page();
    if (total <= 6) return Array.from({ length: total }, (_, index) => index + 1) as Array<number | '…'>;
    if (current <= 3) return [1, 2, 3, '…', total] as Array<number | '…'>;
    if (current >= total - 2) return [1, '…', total - 2, total - 1, total] as Array<number | '…'>;
    return [1, '…', current - 1, current, current + 1, '…', total] as Array<number | '…'>;
  });
  readonly rangeLabel = computed(() => this.filtered().length ? `Mostrando ${(this.page()-1)*this.pageSize()+1}–${Math.min(this.page()*this.pageSize(),this.filtered().length)} de ${this.filtered().length} registros` : 'Mostrando 0 de 0 registros');

  constructor() { effect(() => { this.sucursalId(); this.query.set(''); this.page.set(1); }); }
  onQuery(value: string): void { this.query.set(value); this.page.set(1); }
  go(page: number): void { this.page.set(Math.max(1, Math.min(page, this.totalPages()))); }
  sync(): void { this.toast.show('Puntos de venta sincronizados.'); }
  notify(action: string): void { this.toast.show(`${action} seleccionada.`); }
  openReprocess(row: PuntoVenta, kind: 'CUIS' | 'CUFD'): void { this.reprocessKind.set(kind); this.reprocessQuery.set(''); this.reprocessTarget.set(row); }
  onReprocessQuery(value: string): void { this.reprocessQuery.set(value); }
  closeReprocess(): void { this.reprocessTarget.set(null); this.reprocessQuery.set(''); }
  reprocess(): void { this.toast.show(`Solicitud de reproceso ${this.reprocessKind()} enviada.`); this.closeReprocess(); }
}
