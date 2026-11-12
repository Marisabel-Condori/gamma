import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { GammaState } from '../../../core/state/gamma-state';
import { PageHeaderComponent, Crumb } from '../../../shared/ui/page-header.component';
import { SearchFieldComponent } from '../../../shared/ui/search-field.component';

interface PuntoVenta {
  codigo: string;
  descripcion: string;
  cuis: string;
  vigenciaCuis: string;
  cufd: string;
  vigenciaCufd: string;
  tipo: string;
  sincroniza: string;
}

const PUNTOS_VENTA: PuntoVenta[] = [
  { codigo: '9', descripcion: 'BANCO ECOFUTURO', cuis: '97D9DD6B', vigenciaCuis: '01/06/2027 10:00:16', cufd: 'CUFD-2026-11-09', vigenciaCufd: '13/11/2026 09:06:11', tipo: 'PUNTO VENTA VENTANILLA DE COBRANZA', sincroniza: 'No' },
  { codigo: '8', descripcion: 'BANCO SOL', cuis: '793D66E3', vigenciaCuis: '01/06/2027 10:00:15', cufd: 'CUFD-2026-11-08', vigenciaCufd: '13/11/2026 09:06:10', tipo: 'PUNTO VENTA VENTANILLA DE COBRANZA', sincroniza: 'No' },
  { codigo: '7', descripcion: 'BANCO GANADERO', cuis: '784FE0AF', vigenciaCuis: '01/06/2027 10:00:13', cufd: 'CUFD-2026-11-07', vigenciaCufd: '13/11/2026 09:06:09', tipo: 'PUNTO VENTA VENTANILLA DE COBRANZA', sincroniza: 'No' },
  { codigo: '6', descripcion: 'BANCO DE CREDITO BCP', cuis: '64185D2B', vigenciaCuis: '01/06/2027 10:00:11', cufd: 'CUFD-2026-11-06', vigenciaCufd: '13/11/2026 09:06:08', tipo: 'PUNTO VENTA VENTANILLA DE COBRANZA', sincroniza: 'No' },
  { codigo: '58', descripcion: 'TODOTIX S.R.L.', cuis: 'F12E592F', vigenciaCuis: '16/06/2027 14:29:01', cufd: 'CUFD-2026-11-58', vigenciaCufd: '13/11/2026 09:06:49', tipo: 'PUNTO VENTA VENTANILLA DE COBRANZA', sincroniza: 'No' },
  { codigo: '57', descripcion: 'CRECER I.F.D.', cuis: '656372E0', vigenciaCuis: '22/12/2026 15:26:33', cufd: 'CUFD-2026-11-57', vigenciaCufd: '13/11/2026 09:06:48', tipo: 'PUNTO VENTA VENTANILLA DE COBRANZA', sincroniza: 'No' },
  { codigo: '56', descripcion: 'VPAY', cuis: 'BE287D39', vigenciaCuis: '22/12/2026 15:07:35', cufd: 'CUFD-2026-11-56', vigenciaCufd: '13/11/2026 09:06:47', tipo: 'PUNTO VENTA VENTANILLA DE COBRANZA', sincroniza: 'No' },
  { codigo: '55', descripcion: 'KITEXPERIENCE PAQUETES VARIOS', cuis: 'AFCDCC3F', vigenciaCuis: '26/03/2027 10:00:07', cufd: 'CUFD-2026-11-55', vigenciaCufd: '13/11/2026 09:06:46', tipo: 'PUNTO VENTA VENTANILLA DE COBRANZA', sincroniza: 'No' },
];

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
  readonly puntosVenta = computed(() => {
    const query = normalize(this.query());
    return PUNTOS_VENTA.filter((point) => !query || Object.values(point).some((value) => normalize(value).includes(query)));
  });
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

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
