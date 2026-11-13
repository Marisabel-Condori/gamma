import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { GammaState } from '../../../core/state/gamma-state';
import { Crumb, PageHeaderComponent } from '../../../shared/ui/page-header.component';
import { SearchFieldComponent } from '../../../shared/ui/search-field.component';

interface SucursalHomologada {
  fecha: string;
  codigo: string;
  descripcion: string;
  codigoSin: string;
  descripcionSin: string;
  puntoCodigo: string;
  puntoDescripcion: string;
}

const SUCURSALES: SucursalHomologada[] = [
  { fecha: '11/07/2025 20:29:15', codigo: '6571', descripcion: 'Multicentro Entel Center', codigoSin: '129', descripcionSin: 'ZONA: CASCO VIEJO, CALLE: MERCADO, NRO.: S/N, TELEFONO: 72059053', puntoCodigo: '0', puntoDescripcion: 'punto de venta default' },
  { fecha: '04/07/2025 21:21:31', codigo: '159', descripcion: 'Multicentro Cobija', codigoSin: '126', descripcionSin: 'ZONA: CENTRAL, AVENIDA: TCNL. ENRIQUE FERNANDEZ CORNEJO, NRO.: 129, TELEFONO: 72039064', puntoCodigo: '0', puntoDescripcion: 'punto de venta default' },
  { fecha: '23/04/2025 15:10:04', codigo: '6511', descripcion: 'Multicentro Magdalena', codigoSin: '128', descripcionSin: 'CALLE: NATANIEL GARCIA NRO SN ZONA 27 DE MAYO ESQUINA 6 DE AGOSTO', puntoCodigo: '0', puntoDescripcion: 'punto de venta default' },
  { fecha: '15/10/2024 10:10:10', codigo: '6512', descripcion: 'Multicentro Mi Tren', codigoSin: '127', descripcionSin: 'CALLE: TARATA NRO. S/N ZONA/BARRIO: SUR', puntoCodigo: '0', puntoDescripcion: 'punto de venta default' },
  { fecha: '31/05/2024 13:15:08', codigo: '6451', descripcion: 'Multicentro Bello Horizonte', codigoSin: '125', descripcionSin: 'Urbanización Los Tocos, Distrito 7, Manzano M2, Lote N°10, Av. J. C. Equina Av. Esteban Ribera', puntoCodigo: '0', puntoDescripcion: 'punto de venta default' },
  { fecha: '15/12/2023 15:08:12', codigo: '6071', descripcion: 'Multicentro Cielo Mall', codigoSin: '123', descripcionSin: 'CALLE JORGE CARRASCO NRO. 200 EDIF.: CIELO MALL PISO: PB. DEPTO.: 1 ZONA/BARRIO: 12 DE OCTUBRE', puntoCodigo: '0', puntoDescripcion: 'punto de venta default' },
  { fecha: '10/09/2023 20:00:20', codigo: '4436', descripcion: 'PRUEBAS ZSMART', codigoSin: '1', descripcionSin: 'ZONA: CENTRAL, CALLE: FEDERICO ZUAZO, TIPO DE ESTABLECIMIENTO: EDIFICIO TOWER, NRO.: 1771', puntoCodigo: '0', puntoDescripcion: 'punto de venta default' },
  { fecha: '28/04/2022 19:50:21', codigo: '5331', descripcion: 'AGENCIA VIRTUAL CONO SUR CBBA', codigoSin: '1', descripcionSin: 'ZONA: CENTRAL, CALLE: FEDERICO ZUAZO, TIPO DE ESTABLECIMIENTO: EDIFICIO TOWER, NRO.: 1771', puntoCodigo: '0', puntoDescripcion: 'punto de venta default' },
  { fecha: '28/04/2022 19:50:21', codigo: '5190', descripcion: 'OFICINA REGIONAL TDE BENI', codigoSin: '1', descripcionSin: 'ZONA: CENTRAL, CALLE: FEDERICO ZUAZO, TIPO DE ESTABLECIMIENTO: EDIFICIO TOWER, NRO.: 1771', puntoCodigo: '0', puntoDescripcion: 'punto de venta default' },
  { fecha: '28/04/2022 19:50:21', codigo: '5188', descripcion: 'OFICINA REGIONAL TDE PANDO', codigoSin: '1', descripcionSin: 'ZONA: CENTRAL, CALLE: FEDERICO ZUAZO, TIPO DE ESTABLECIMIENTO: EDIFICIO TOWER, NRO.: 1771', puntoCodigo: '0', puntoDescripcion: 'punto de venta default' },
];

type PageToken = number | '…';

@Component({
  selector: 'app-sucursales-homologadas-page',
  imports: [RouterLink, PageHeaderComponent, SearchFieldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page branch-map-page">
      <app-page-header title="Homologación de sucursales" [crumbs]="crumbs()" [backLink]="backLink()" backLabel="Volver a sistemas" actionLabel="Sucursal" (action)="addBranch()" />
      @if (empresa() && sistema()) {
        <section class="context" aria-label="Contexto de homologación">
          <strong>HOMOLOGACIÓN DE SUCURSALES</strong>
          <span>EMPRESA: {{ empresa()?.codigo }}</span>
          <span>SISTEMA INTERNO: {{ sistema()?.codigo }}</span>
        </section>
        <div class="toolbar">
          <span class="count">{{ rangeLabel() }}</span>
          <app-search-field placeholder="Buscar código, sucursal o descripción..." [value]="query()" (valueChange)="onQuery($event)" />
        </div>
        <div class="table-wrap">
          <table class="mapping-table">
            <thead>
              <tr>
                <th rowspan="2">Fecha<br>Homologación</th>
                <th colspan="2">Sucursales Entel</th>
                <th colspan="4">Sucursales SIN</th>
                <th rowspan="2">Acciones</th>
              </tr>
              <tr><th>Cod. Sucursal</th><th>Descripción</th><th>Cod. Sucursal SIN</th><th>Descripción SIN</th><th>Cod. Punto Venta SIN</th><th>Punto Venta SIN</th></tr>
            </thead>
            <tbody>
              @for (row of pageRows(); track row.codigo) {
                <tr>
                  <td class="date">{{ row.fecha }}</td><td>{{ row.codigo }}</td><td class="branch-name">{{ row.descripcion }}</td>
                  <td>{{ row.codigoSin }}</td><td class="sin-description">{{ row.descripcionSin }}</td><td>{{ row.puntoCodigo }}</td><td>{{ row.puntoDescripcion }}</td>
                  <td><div class="actions"><button type="button" class="icon-btn" aria-label="Editar homologación" title="Editar"><span class="material-icons">edit</span></button><button type="button" class="icon-btn delete" aria-label="Eliminar homologación" title="Eliminar"><span class="material-icons">delete</span></button></div></td>
                </tr>
              } @empty {
                <tr><td class="empty" colspan="8">No hay homologaciones que coincidan con la búsqueda.</td></tr>
              }
            </tbody>
          </table>
        </div>
        <div class="mobile-list">
          @for (row of pageRows(); track row.codigo) {
            <article class="mobile-card">
              <div class="card-top"><strong>{{ row.descripcion }}</strong><span>{{ row.fecha }}</span></div>
              <div class="pair"><span>Código sucursal</span><b>{{ row.codigo }}</b></div>
              <div class="sin-block"><b>Sucursal SIN · {{ row.codigoSin }}</b><p>{{ row.descripcionSin }}</p></div>
              <div class="pair"><span>Punto de venta SIN · {{ row.puntoCodigo }}</span><b>{{ row.puntoDescripcion }}</b></div>
              <div class="card-actions"><span>Acciones</span><div class="actions"><button type="button" class="icon-btn" aria-label="Editar homologación"><span class="material-icons">edit</span></button><button type="button" class="icon-btn delete" aria-label="Eliminar homologación"><span class="material-icons">delete</span></button></div></div>
            </article>
          }
        </div>
        <nav class="pager" aria-label="Paginación"><span>{{ rangeLabel() }}</span><div class="pages"><button type="button" [disabled]="page() === 1" (click)="go(page()-1)">‹</button>@for (item of pageList(); track $index) { @if (item === '…') { <span>…</span> } @else { <button type="button" [class.current]="item === page()" (click)="go(item)">{{ item }}</button> } }<button type="button" [disabled]="page() === totalPages()" (click)="go(page()+1)">›</button></div><label>Por página <select [value]="pageSize()" (change)="pageSize.set(+$any($event.target).value); page.set(1)"><option>10</option><option>20</option><option>50</option></select></label></nav>
      } @else {
        <div class="empty-context">No se encontró el sistema seleccionado. <a routerLink="/sistemasFacturadores">Volver a sistemas</a></div>
      }
    </section>
  `,
  styles: `
    :host{display:block}.context{display:grid;gap:0;padding:10px 14px;margin:4px 0 18px;color:#fff;background:#6b26dc;border-radius:10px;overflow:hidden}.context strong,.context span{padding:7px 10px;border-bottom:1px solid #ffffff55;font-size:12px}.context strong{font-size:14px}.context span:last-child{border:0}.toolbar{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:12px}.count{font-size:13px;color:var(--ink-soft)}.table-wrap{overflow:auto;border:1px solid var(--line);border-radius:10px;background:#fff}.mapping-table{width:100%;min-width:1140px;border-collapse:collapse;table-layout:fixed}.mapping-table th,.mapping-table td{padding:8px 9px;border-right:1px solid var(--line);border-bottom:1px solid var(--line);text-align:center;vertical-align:middle;font-size:11px}.mapping-table th{height:42px;background:#6b26dc;color:#fff;font-weight:700}.mapping-table td{line-height:1.4}.mapping-table tbody tr:nth-child(even){background:#faf9fc}.mapping-table th:first-child{width:92px}.mapping-table th:nth-child(2){width:90px}.mapping-table th:nth-child(3){width:170px}.mapping-table th:nth-child(4){width:105px}.mapping-table th:nth-child(5){width:285px}.mapping-table th:nth-child(6){width:112px}.mapping-table th:nth-child(7){width:150px}.mapping-table th:last-child{width:90px}.date,.sin-description{text-align:left!important}.branch-name{font-weight:700}.actions{display:flex;justify-content:center;gap:6px}.icon-btn{width:30px;height:30px;border:0;border-radius:50%;background:#f0f3f8;color:#55718f;display:grid;place-items:center;cursor:pointer}.icon-btn .material-icons{font-size:17px}.icon-btn.delete{color:#db5966;background:#fdebed}.empty{text-align:center!important;padding:25px!important;color:var(--ink-soft)}.mobile-list{display:none}.pager{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 4px;color:var(--ink-soft);font-size:13px}.pages{display:flex;align-items:center;gap:6px}.pages button{min-width:30px;height:30px;border:0;border-radius:8px;background:transparent;color:inherit;cursor:pointer}.pages button.current{background:#6b26dc;color:#fff}.pages button:disabled{opacity:.4}.pager label{display:flex;align-items:center;gap:8px}.pager select{padding:6px;border:1px solid var(--line);border-radius:8px;background:white;color:inherit}.empty-context{padding:24px;background:#fff;border:1px solid var(--line);border-radius:10px}.empty-context a{margin-left:8px;color:#6b26dc}
    @media(max-width:760px){.context{margin-top:0}.toolbar{align-items:stretch;flex-direction:column}.table-wrap{display:none}.mobile-list{display:grid;gap:12px}.mobile-card{padding:14px;border:1px solid var(--line);border-radius:14px;background:#fff;box-shadow:0 4px 14px #12223a0b}.card-top{display:flex;justify-content:space-between;gap:10px;align-items:start;margin-bottom:12px}.card-top strong{font-size:14px}.card-top span{color:var(--ink-soft);font-size:11px}.pair{display:flex;justify-content:space-between;gap:10px;padding:7px 0;border-top:1px solid var(--line);font-size:12px}.pair span{color:var(--ink-soft)}.pair b{text-align:right}.sin-block{margin:8px 0;padding:10px;border-radius:10px;background:#f6f2fc;color:#2c2540;font-size:12px}.sin-block p{margin:5px 0 0;line-height:1.45}.card-actions{display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--line);padding-top:10px;color:var(--ink-soft);font-size:12px}.pager{flex-wrap:wrap}.pager>span{width:100%}.pager label{margin-left:auto}}
  `,
})
export class SucursalesHomologadasPage {
  private readonly state = inject(GammaState);
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });
  readonly query = signal('');
  readonly page = signal(1);
  readonly pageSize = signal(10);
  readonly empresa = computed(() => this.state.empresas().find(row => row.id === this.params().get('empresaId')) ?? null);
  readonly sistema = computed(() => this.state.sistemas().find(row => row.id === this.params().get('sistemaId')) ?? null);
  readonly backLink = computed(() => `/sistemasFacturadores/${this.empresa()?.id ?? ''}`);
  readonly crumbs = computed<Crumb[]>(() => [
    { label: 'Sistemas Facturadores', link: '/sistemasFacturadores' },
    { label: 'Sistemas internos', link: this.backLink() },
    { label: this.sistema()?.codigo ?? 'Sistema' },
    { label: 'Homologación de sucursales' },
  ]);
  readonly filtered = computed(() => {
    const q = normalize(this.query());
    return SUCURSALES.filter(row => !q || Object.values(row).some(value => normalize(value).includes(q)));
  });
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize())));
  readonly pageRows = computed(() => this.filtered().slice((this.page() - 1) * this.pageSize(), this.page() * this.pageSize()));
  readonly rangeLabel = computed(() => this.filtered().length ? `${(this.page()-1)*this.pageSize()+1}–${Math.min(this.page()*this.pageSize(),this.filtered().length)} de ${this.filtered().length} registros` : '0 de 0 registros');
  readonly pageList = computed<PageToken[]>(() => Array.from({length:this.totalPages()},(_,i)=>i+1));
  onQuery(value: string): void { this.query.set(value); this.page.set(1); }
  go(value: number): void { this.page.set(Math.max(1,Math.min(value,this.totalPages()))); }
  addBranch(): void { /* Datos de demostración: el botón conserva la acción visual de la pantalla original. */ }
}

function normalize(value: string): string { return value.trim().toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
