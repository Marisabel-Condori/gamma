export interface FacturaResponse {
  idFactura: number;
  origen: string;
  recepcion: string;
  numeroFactura: string;
  razonSocial: string;
  numeroDocumento: string;
  tipoDocumento: string;
  fecha: string;
  cuf: string;
  montoTotal: number;
  estado: string;
  tipoEmision: string;
  usuario: string;
}

export interface FiltroFacturas {
  origen: string;
  recepcion: string;
  numeroFactura: string;
  razonSocial: string;
  numeroDocumento: string;
  periodo: string;
  cuf: string;
}

export interface ItemFactura {
  codigo: string;
  descripcion: string;
  cantidad: number;
  precio: number;
  subtotal: number;
}

export interface ContactoFactura {
  tipo: string;
  valor: string;
}

export interface MensajeFactura {
  codigo: string;
  descripcion: string;
}

export interface DetalleFacturaResponse {
  idFactura: number;
  fecha: string;
  numeroFactura: string;
  razonSocial: string;
  tipoDocumento: string;
  numeroDocumento: string;
  complemento: string;
  descuento: number;
  montoTotal: number;
  montoSujetoIva: number;
  sistema: string;
  transaccion: string;
  sucursal: string;
  puntoVenta: string;
  items: ItemFactura[];
  contactos: ContactoFactura[];
  mensajes: MensajeFactura[];
}
