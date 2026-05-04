import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../../../services/data/firebase.service';
import { Ingrediente } from '../../../models/ingrediente.model';
import { A11yModule } from '@angular/cdk/a11y'; 

@Component({
  selector: 'app-add-stock',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatInputModule, FormsModule, A11yModule],
  templateUrl: './add-stock-dialog.component.html',
  styleUrl: './add-stock-dialog.component.scss'
})
export class AddStockDialogComponent {
  quantityToAdd = 1;

  constructor(
    private fbService: FirebaseService,
    public dialogRef: MatDialogRef<AddStockDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Ingrediente
  ) { }

  async addStock() {
    let id = '';
    const updated = { ...this.data, cantidad: this.data.cantidad + this.quantityToAdd };
    if (this.data.id != null && this.data.id != undefined) {
      id = this.data.id;
    }
    await this.fbService.editar(id,updated);
    this.dialogRef.close(true);
  }
}
