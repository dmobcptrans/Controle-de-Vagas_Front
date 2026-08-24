export interface Paginacao<T> {
  content: T[];
  totalElementos: number;
  totalPaginas: number;
  tamanhoPagina: number;
  pagina: number;
}