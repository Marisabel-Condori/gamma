import { CuentaCliente } from '../../../core/models/cliente.model';

// TODO: reemplazar por la llamada al servicio de búsqueda de cuentas.
const CUENTAS_PRUEBA: CuentaCliente[] = [
  {
    codigoCliente: '123123',
    codigoCuenta: '123123',
    razonSocial: 'HERRERA',
    numeroDocumento: '13679995',
    complemento: '',
    tipoDocumento: 'CI',
  },
  {
    codigoCliente: '123123',
    codigoCuenta: '123124',
    razonSocial: 'HERRERA',
    numeroDocumento: '13679995',
    complemento: '1A',
    tipoDocumento: 'CI',
  },
  {
    codigoCliente: '123123',
    codigoCuenta: '123125',
    razonSocial: 'HERRERA',
    numeroDocumento: '13679995',
    complemento: '',
    tipoDocumento: 'NIT',
  },
  {
    codigoCliente: '554433',
    codigoCuenta: '998877',
    razonSocial: 'HERRERA',
    numeroDocumento: '1020304025',
    complemento: '',
    tipoDocumento: 'NIT',
  },
];

export async function buscarCuentas(tipo: string, valor: string): Promise<CuentaCliente[]> {
  const buscado = valor.trim();
  return CUENTAS_PRUEBA.filter((c) =>
    tipo === 'DOCUMENTO' ? c.numeroDocumento === buscado : c.codigoCuenta === buscado,
  );
}
