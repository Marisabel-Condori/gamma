import { Injectable, signal } from '@angular/core';
import { PuntoVenta } from '../models/punto-venta.model';

const SAMPLE: Array<[string, string, string, string, string, string]> = [
  ['9', 'BANCO ECOFUTURO', '97D9DD6B', '01/06/2027 10:00:16', 'BQWBDRehDQkE=NkDAyNDg2RDk4Qj0c=QnwwTEdGTkxV', '13/11/2026 09:06:11'],
  ['8', 'BANCO SOL', '793D66E3', '01/06/2027 10:00:15', 'BQWBDRehDQkE=NkDAyNDg2RDk4Qj0c=QkF9S0dGTkxV', '13/11/2026 09:06:10'],
  ['7', 'BANCO GANADERO', '784FE0AF', '01/06/2027 10:00:13', 'BQWBDRehDQkE=NkDAyNDg2RDk4Qj0c=QkF5S0dGTkxV', '13/11/2026 09:06:09'],
  ['6', 'BANCO DE CRÉDITO BCP', '64185D2B', '01/06/2027 10:00:11', 'HQUFIQ0RIQ0JBNkDAyNDg2RDk4Qj0c=QsKhdUUHRk5MYVVC', '13/11/2026 09:06:08'],
  ['58', 'TODOTIX S.R.L.', 'F12E592F', '16/06/2027 14:29:01', 'BQWBDRehDQkE=NkDAyNDg2RDk4Qj0c=Qk5eEdGTkxV', '13/11/2026 09:06:49'],
  ['57', 'CRECER I.F.D', '656372E0', '22/12/2026 15:26:33', 'BQWBDRehDQkE=NkDAyNDg2RDk4Qj0c=QIVsd0dGTkxV', '13/11/2026 09:06:48'],
  ['56', 'VPAY', 'BE287D39', '22/12/2026 15:07:35', 'BQWBDRehDQkE=NkDAyNDg2RDk4Qj0c=Qk4dKdgGTkxV', '13/11/2026 09:06:47'],
  ['55', 'KITEXPERIENCE PAQUETES VARIOS', 'AFCDCC3F', '26/03/2027 10:00:07', 'BQWBDRehDQkE=NkDAyNDg2RDk4Qj0c=QIVxdUdGTkxV', '13/11/2026 09:06:46'],
];

@Injectable({ providedIn: 'root' })
export class PuntosVentaState {
  readonly rows = signal<PuntoVenta[]>(SAMPLE.map(([codigo, descripcion, cuis, fechaCuis, cufd, fechaCufd], index) => ({
    id: `entel-ZSMART-sucursal-1-pv-${index + 1}`,
    sucursalId: 'entel-ZSMART-sucursal-1',
    codigo,
    descripcion,
    cuis,
    fechaCuis,
    cufd,
    fechaCufd,
    tipo: 'PUNTO VENTA VENTANILLA DE COBRANZA',
    sincroniza: false,
  })));

  forSucursal(sucursalId: string): PuntoVenta[] {
    return this.rows().filter((row) => row.sucursalId === sucursalId);
  }
}
