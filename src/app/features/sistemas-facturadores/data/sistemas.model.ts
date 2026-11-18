export interface SistemaFacturadorResponse {
  idSistema: number;
  sistema: string;
  descripcion: string;
  fechaAlta?: string;
  usuarioAlta: string;
  fechaModificacion?: string;
  usuarioModificacion?: string;
}

export interface SistemaResponse {
  id: string;
  idSistema: number;
  codigo: string;
  descripcion: string;
}

export interface SistemaRequest {
  sistema: string;
  descripcion: string;
  usuarioAlta: string;
}
