export interface Empresa {
  id: string;
  codigo: string;
  razonSocial: string;
}

export interface Sistema {
  id: string;
  empresaId: string;
  codigo: string;
  descripcion: string;
}

export interface SistemaInput {
  empresaId: string;
  codigo: string;
  descripcion: string;
}
