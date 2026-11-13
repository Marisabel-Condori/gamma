import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';

@Injectable()
export class GammaPaginatorIntl extends MatPaginatorIntl {
  override itemsPerPageLabel = 'Por página';
  override nextPageLabel = 'Siguiente';
  override previousPageLabel = 'Anterior';
  override firstPageLabel = 'Primera página';
  override lastPageLabel = 'Última página';

  override getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0 || pageSize === 0) {
      return '0 de 0';
    }
    const start = page * pageSize;
    const end = Math.min(start + pageSize, length);
    return `${start + 1}–${end} de ${length}`;
  };
}
