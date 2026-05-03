import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../../../services/data/firebase.service';
import { Ingrediente } from '../../../models/ingrediente.model';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-shopping-list',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatInputModule, MatIconModule, FormsModule],
  templateUrl: './shopping-list-dialog.component.html',
  styleUrl: './shopping-list-dialog.component.scss'
})
export class ShoppingListDialogComponent {
  
  private fbService = inject(FirebaseService);
  private dialogRef = inject(MatDialogRef<ShoppingListDialogComponent>);

  // Obtener productos críticos y añadir campo orderQuantity
  private criticalProducts = computed(() =>
    this.fbService.ingredientesSignal().filter(i => i.cantidad <= i.cantidadMinima)
  );

  shoppingItems = computed(() =>
    this.criticalProducts().map(p => ({
      ...p,
      orderQuantity: p.cantidadMinima - p.cantidad > 0 ? p.cantidadMinima - p.cantidad : 1
    }))
  );

  generatePDF() {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Lista de compras - Inventario', 14, 20);
    doc.setFontSize(11);
    doc.text(`Generado: ${new Date().toLocaleString()}`, 14, 30);

    const tableData = this.shoppingItems().map(item => [
      item.nombre,
      item.cantidad,
      item.cantidadMinima,
      item.orderQuantity,
      item.presentacion
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['Producto', 'Stock actual', 'Mínimo', 'Cantidad a pedir', 'Presentación']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [255, 59, 48] },
      margin: { left: 14, right: 14 }
    });

    doc.save(`lista_compras_${new Date().toISOString().slice(0, 10)}.pdf`);
    this.dialogRef.close();
  }
}
