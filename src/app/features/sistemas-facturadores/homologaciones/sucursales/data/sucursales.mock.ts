import { HomologacionSucursal, PuntoVenta, SistemaSin } from './sucursales.models';

const SUCURSALES: [string, string][] = [
  ['0', 'CALLE FEDERICO ZUAZO Nro. 1771 Edif.: TOWER Piso: 10 Depto.: - Zona/Barrio: CENTRAL La Paz'],
  ['1', 'ZONA: CENTRAL, CALLE: FEDERICO SUAZO, TIPO DE ESTABLECIMIENTO: EDIFICIO TOWER, NRO.: 1771'],
  ['2', 'CALLE GENERAL ACHA ESQ. AYACUCHO Nro. 113 Zona/Barrio: CENTRAL Cochabamba'],
  ['3', 'CALLE COCHABAMBA ESQ. PLAZA ARZE S/N Nro. 0 Zona/Barrio: CENTRAL Potosí'],
  ['4', 'CALLE BOLIVAR ESQ. SORIA GALVARRO S/N Nro. 0 Zona/Barrio: CENTRAL Oruro'],
  ['5', 'CALLE ESPAÑA Nro. 271 Zona/Barrio: CENTRAL Sucre'],
  ['6', 'CALLE VIRGINIO LEMA #231 Nro. 0 Zona/Barrio: CENTRAL Tarija'],
  ['7', 'CALLE WARNES Nro. 50 Zona/Barrio: ZONA CENTRAL - CASCO VIEJO Santa Cruz'],
  ['8', 'CALLE CIPRIANO BARACE Nro. 0 Zona/Barrio: CENTRAL Trinidad'],
  ['9', 'CALLE COCHABAMBA Nro. 0 Zona/Barrio: CENTRAL Yacuiba'],
  ['10', 'AVENIDA 6 DE AGOSTO Nro. 2455 Zona/Barrio: SOPOCACHI La Paz'],
  ['11', 'AVENIDA BLANCO GALINDO Km. 4 Zona/Barrio: SARCO Cochabamba'],
  ['12', 'CALLE JUNIN Nro. 78 Zona/Barrio: CENTRAL Cobija'],
  ['13', 'AVENIDA BALLIVIAN Nro. 120 Zona/Barrio: CENTRAL Cochabamba'],
  ['14', 'CALLE AYACUCHO Nro. 44 Zona/Barrio: CENTRAL Oruro'],
  ['15', 'AVENIDA BUSCH Nro. 890 Zona/Barrio: MIRAFLORES La Paz'],
  ['16', 'CALLE BALLIVIAN Nro. 53 Zona/Barrio: CENTRAL Sucre'],
  ['17', 'AVENIDA MELCHOR PEREZ Nro. 135 Zona/Barrio: SARCO Cochabamba'],
  ['18', 'CALLE COMERCIO Nro. 21 Zona/Barrio: CENTRAL Potosí'],
  ['19', 'AVENIDA BANZER Nro. 3100 Zona/Barrio: NORTE Santa Cruz'],
];

const PUNTOS_VENTA: [string, string, string, string, string, string][] = [
  ['9', 'BANCO ECOFUTURO', '97D9DD6B', '01/06/2027 10:00:16', 'BQWBDRehDQkE=NkDAyNDg2RDk4Qj0c=QnwwTEdGTkxV', '13/11/2026 09:06:11'],
  ['8', 'BANCO SOL', '793D66E3', '01/06/2027 10:00:15', 'BQWBDRehDQkE=NkDAyNDg2RDk4Qj0c=QkF9S0dGTkxV', '13/11/2026 09:06:10'],
  ['7', 'BANCO GANADERO', '784FE0AF', '01/06/2027 10:00:13', 'BQWBDRehDQkE=NkDAyNDg2RDk4Qj0c=QkF5S0dGTkxV', '13/11/2026 09:06:09'],
  ['6', 'BANCO DE CRÉDITO BCP', '64185D2B', '01/06/2027 10:00:11', 'HQUFIQ0RIQ0JBNkDAyNDg2RDk4Qj0c=QsKhdUUHRk5MYVVC', '13/11/2026 09:06:08'],
  ['58', 'TODOTIX S.R.L.', 'F12E592F', '16/06/2027 14:29:01', 'BQWBDRehDQkE=NkDAyNDg2RDk4Qj0c=Qk5eEdGTkxV', '13/11/2026 09:06:49'],
  ['57', 'CRECER I.F.D', '656372E0', '22/12/2026 15:26:33', 'BQWBDRehDQkE=NkDAyNDg2RDk4Qj0c=QIVsd0dGTkxV', '13/11/2026 09:06:48'],
  ['56', 'VPAY', 'BE287D39', '22/12/2026 15:07:35', 'BQWBDRehDQkE=NkDAyNDg2RDk4Qj0c=Qk4dKdgGTkxV', '13/11/2026 09:06:47'],
  ['55', 'KITEXPERIENCE PAQUETES VARIOS', 'AFCDCC3F', '26/03/2027 10:00:07', 'BQWBDRehDQkE=NkDAyNDg2RDk4Qj0c=QIVxdUdGTkxV', '13/11/2026 09:06:46'],
];

export const SISTEMAS_SIN: SistemaSin[] = [{ id: 'GWSFE', nombre: 'GWSFE', codigo: '6D32BF2BE623402486D98B7' }];

export function crearSucursales(): HomologacionSucursal[] {
  return SUCURSALES.map(([codigo, descripcion], i) => ({
    id: `ZSMART-sucursal-${i + 1}`,
    sistemaId: 'ZSMART',
    codigo,
    descripcion,
  }));
}

export function crearPuntosVenta(): PuntoVenta[] {
  return PUNTOS_VENTA.map(([codigo, descripcion, cuis, fechaCuis, cufd, fechaCufd], i) => ({
    id: `ZSMART-sucursal-1-pv-${i + 1}`,
    sucursalId: 'ZSMART-sucursal-1',
    codigo,
    descripcion,
    cuis,
    fechaCuis,
    cufd,
    fechaCufd,
    tipo: 'PUNTO VENTA VENTANILLA DE COBRANZA',
    sincroniza: false,
  }));
}
