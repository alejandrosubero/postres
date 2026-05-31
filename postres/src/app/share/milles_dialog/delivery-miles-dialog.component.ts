import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Angular Material Imports
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

export interface DeliveryMilesDialogData {
  /** Valor inicial opcional para prellenar el input */
  initialMiles?: number;
}

export interface DeliveryMilesDialogResult {
  miles: number;
}

@Component({
  selector: 'app-delivery-miles-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
  ],
  templateUrl: './delivery-miles-dialog.component.html',
  styleUrls: ['./delivery-miles-dialog.component.scss'],
})
export class DeliveryMilesDialogComponent {
  /** Valor vinculado al input de millas */
  miles: number | null = null;

  constructor(
    public dialogRef: MatDialogRef<DeliveryMilesDialogComponent, DeliveryMilesDialogResult | null>,
    @Inject(MAT_DIALOG_DATA) public data: DeliveryMilesDialogData
  ) {
    // Si se pasa un valor inicial, se preestablece
    if (data?.initialMiles != null) {
      this.miles = data.initialMiles;
    }
  }

  /** Valida que el valor sea un número positivo mayor a 0 */
  get isValid(): boolean {
    return this.miles !== null && this.miles > 0 && Number.isFinite(this.miles);
  }

  /**
   * Previene la escritura de caracteres no numéricos en el input.
   * Permite: dígitos, backspace, delete, flechas, tab, punto decimal.
   */
  onKeyDown(event: KeyboardEvent): void {
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight',
      'Home', 'End', 'Enter', '.', 'Decimal',
    ];

    const isDigit = /^[0-9]$/.test(event.key);
    const isAllowed = allowedKeys.includes(event.key);

    // Bloquear punto duplicado
    const inputEl = event.target as HTMLInputElement;
    if (event.key === '.' && inputEl.value.includes('.')) {
      event.preventDefault();
      return;
    }

    if (!isDigit && !isAllowed) {
      event.preventDefault();
    }
  }

  /** Sanitiza el paste para que solo ingresen números */
  onPaste(event: ClipboardEvent): void {
    const paste = event.clipboardData?.getData('text') ?? '';
    if (!/^\d*\.?\d*$/.test(paste)) {
      event.preventDefault();
    }
  }

  /** Cierra devolviendo null (cancelar) */
  onCancel(): void {
    this.miles =0;
    this.dialogRef.close({ miles: this.miles as number });
  }

  /** Cierra devolviendo el valor si es válido */
  onAccept(): void {
    if (!this.isValid) return;
    this.dialogRef.close({ miles: this.miles as number });
  }
}
