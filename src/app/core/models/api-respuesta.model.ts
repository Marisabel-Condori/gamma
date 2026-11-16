export interface ApiRespuesta<T> {
  data: T;
  exito: boolean;
  mensaje: string;
}
