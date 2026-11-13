import { MatButton, MatIconButton } from '@angular/material/button';
import { MatChip, MatChipSet } from '@angular/material/chips';
import { MatDialogActions, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatMenu, MatMenuContent, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator } from '@angular/material/paginator';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
} from '@angular/material/table';

/** Piezas de Angular Material que una pantalla puede importar de una vez. */
export const GAMMA_MATERIAL = [
  MatButton,
  MatIconButton,
  MatIcon,
  MatFormField,
  MatLabel,
  MatInput,
  MatChipSet,
  MatChip,
  MatMenu,
  MatMenuItem,
  MatMenuTrigger,
  MatMenuContent,
  MatTable,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatCell,
  MatCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatPaginator,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
];
