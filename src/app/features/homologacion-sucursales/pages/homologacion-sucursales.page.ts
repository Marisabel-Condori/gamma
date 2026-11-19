import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { GammaState } from '../../../core/state/gamma-state';
import { PageHeaderComponent, Crumb } from '../../../shared/ui/page-header.component';
import { SearchFieldComponent } from '../../../shared/ui/search-field.component';

@Component({
  selector: 'app-homologacion-sucursales-page',
  imports: [RouterLink, PageHeaderComponent, SearchFieldComponent],
  templateUrl: './homologacion-sucursales.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host { display: block; }
    .branch-card {
      padding: 16px 18px;
      margin: 4px 0 16px;
      color: white;
      background: #176caf;
      border: 1px solid #d7e3ef;
      border-radius: 10px;
    }
    .branch-card h2 { margin: 0 0 10px; font-size: 19px; }
    .branch-card p { margin: 0; padding: 6px 0; border-top: 1px solid rgba(255,255,255,.42); font-weight: 600; }
    .branch-card .address { font-size: 13.5px; }
    .branch-company { font-size: 14px; }
    .toolbar { margin: 0 0 12px; }
    .toolbar .search { margin-left: auto; }
    .results { color: var(--ink-soft); font-size: 13px; }
    .table-wrap { overflow: auto; background: white; border: 1px solid var(--line); border-radius: 10px; }
    .sales-table { width: 100%; min-width: 1530px; border-collapse: collapse; table-layout: fixed; }
    .sales-table th, .sales-table td { padding: 10px 12px; border-right: 1px solid #e0e5eb; border-bottom: 1px solid #e0e5eb; text-align: center; vertical-align: middle; }
    .sales-table th { height: 66px; color: #26354a; background: #f8fafc; font-size: 12px; line-height: 1.35; font-weight: 700; }
    .sales-table td { min-height: 56px; color: #22334b; font-size: 12px; }
    .sales-table tr:last-child td { border-bottom: 0; }
    .sales-table th:last-child, .sales-table td:last-child { border-right: 0; }
    .sales-table td.description, .sales-table td.type { text-align: left; }
    .sales-table th:nth-child(1) { width: 95px; }
    .sales-table th:nth-child(2) { width: 175px; }
    .sales-table th:nth-child(3) { width: 115px; }
    .sales-table th:nth-child(4), .sales-table th:nth-child(7) { width: 105px; }
    .sales-table th:nth-child(5), .sales-table th:nth-child(8) { width: 145px; }
    .sales-table th:nth-child(6) { width: 190px; }
    .sales-table th:nth-child(9) { width: 190px; }
    .sales-table th:nth-child(10) { width: 100px; }
    .status-no { color: #63738a; }
    .empty-row { padding: 30px !important; color: var(--ink-soft) !important; }
    @media (max-width: 800px) {
      .branch-card { padding: 14px; }
      .toolbar { align-items: stretch; }
      .toolbar .search { margin-left: 0; width: 100%; }
      .table-wrap { border-radius: 8px; }
    }
  `,
})
export class HomologacionSucursalesPage {
  private readonly state = inject(GammaState);
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });

  readonly query = signal('');
  readonly empresa = computed(() => {
    const empresaId = this.params().get('empresaId');
    return this.state.empresas().find((item) => item.id === empresaId) ?? null;
  });
  readonly sistema = computed(() => {
    const sistemaId = this.params().get('sistemaId');
    return this.state.sistemas().find((item) => item.id === sistemaId) ?? null;
  });
  readonly puntosVenta = computed(() => []);
  readonly crumbs = computed<Crumb[]>(() => [
    { label: 'Sistemas Facturadores', link: '/sistemasFacturadores' },
    {
      label: this.empresa()?.codigo ?? 'Empresa',
      link: `/sistemasFacturadores/${this.empresa()?.id ?? ''}`,
    },
    { label: this.sistema()?.codigo ?? 'Sistema' },
    { label: 'Puntos de venta SIN' },
  ]);

  onQuery(value: string): void {
    this.query.set(value);
  }
}

}
