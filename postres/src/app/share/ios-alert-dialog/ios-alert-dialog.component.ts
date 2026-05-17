import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

// Interfaz para tipar los datos que recibe el diálogo
export interface IosDialogData {
  title?: string;
  message: string;
  btnLeft: {
    label: string;
    value: any; // Puede ser un booleano (true/false) o cualquier otra respuesta
  };
  btnRight: {
    label: string;
    value: any; // Puede ser un booleano (true/false) o cualquier otra respuesta
  };
}
@Component({
  selector: 'app-ios-alert-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './ios-alert-dialog.component.html',
  styleUrl: './ios-alert-dialog.component.scss'
})
export class IosAlertDialogComponent {
  constructor(
    // Ref para poder cerrar este diálogo y devolver la respuesta
    private dialogRef: MatDialogRef<IosAlertDialogComponent>,
    // Inyección de los datos enviados desde el componente que lo invoca
    @Inject(MAT_DIALOG_DATA) public data: IosDialogData
  ) {

    if (data.btnLeft.value === "none") {
      this.showLeft = false;
    }

    if (data.btnRight.value === "none") {
      this.showRight = false;
    }
  }

  showRight = true;
  showLeft = true;



  cerrar(value: any) {
    // Al hacer clic, enviamos al componente padre la respuesta exacta definida
    this.dialogRef.close(value);
  }
}
