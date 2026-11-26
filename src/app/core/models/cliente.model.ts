export interface Cliente {
  razonSocial: string;
  codigoCliente: string;
  codigoCuenta: string;
}

/** Cuenta devuelta por la búsqueda de cuenta / documento. */
export interface CuentaCliente extends Cliente {
  numeroDocumento: string;
  complemento: string;
  tipoDocumento: string;
}
