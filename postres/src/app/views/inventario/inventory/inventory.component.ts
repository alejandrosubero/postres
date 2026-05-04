import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { FirebaseService } from '../../../services/data/firebase.service';
import { Ingrediente } from '../../../models/ingrediente.model';
import { AddStockDialogComponent } from '../add-stock-dialog/add-stock-dialog.component';
import { ShoppingListDialogComponent } from '../shopping-list-dialog/shopping-list-dialog.component';
import { NavConfig } from '../../../models/navegation/navElemet.model';
import { NavService } from '../../../services/navegate/nav.service';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule
  ],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss'
})
export class InventoryComponent {

  private fbService = inject(FirebaseService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private navService = inject(NavService);

  ingredientes = this.fbService.ingredientesSignal;

  totalProducts = computed(() => this.ingredientes().length);
  lowStockCount = computed(() => this.ingredientes().filter(i => i.cantidad <= i.cantidadMinima).length);


  constructor() {
    this.setNav();
  }

  isCritical(ing: Ingrediente): boolean {
    return ing.cantidad <= ing.cantidadMinima;
  }

  getStockPercentage(ing: Ingrediente): number {
    if (ing.cantidadMinima === 0) return 100;
    const percent = (ing.cantidad / (ing.cantidadMinima * 2)) * 100;
    return Math.min(100, Math.max(0, percent));
  }



  openAddStock(ingrediente: Ingrediente): void {
    // 1. Forzamos a quitar el foco del elemento activo (el botón)
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    this.dialog.open(AddStockDialogComponent, {
      data: ingrediente,
      width: '90%',
      maxWidth: '400px',
      panelClass: 'ios-dialog',
      autoFocus: 'first-tabbable',
      restoreFocus: false
    }).afterClosed().subscribe(result => {
      if (result) this.snackBar.open('Stock actualizado', 'Cerrar', { duration: 2000 });
    });
  }



  printRestockList(): void {

    const productsToRestock = this.ingredientes().filter(i => i.cantidad <= i.cantidadMinima);

    if (productsToRestock.length === 0) {
      this.snackBar.open('No hay productos que necesiten reabastecimiento', 'OK', { duration: 2000 });
      return;
    }

    // Ventana de impresión simple
    const printWindow = window.open('', '_blank');
    printWindow?.document.write(`
      <html>
        <head><title>Lista de reabastecimiento</title>
        <style>
          body { font-family: -apple-system, sans-serif; padding: 20px; }
          h1 { color: #ff3b30; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ccc; }
          th { background: #f2f2f6; }
        </style>
        </head>
        <body>
          <h1>📋 Productos por reabastecer</h1>
          <table>
            <thead><tr><th>Nombre</th><th>Cantidad actual</th><th>Mínimo</th><th>Presentación</th></tr></thead>
            <tbody>
              ${productsToRestock.map(p => `
                <tr>
                  <td>${p.nombre}</td>
                  <td>${p.cantidad}</td>
                  <td>${p.cantidadMinima}</td>
                  <td>${p.presentacion}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow?.print();
  }

  openShoppingList(): void {
    this.dialog.open(ShoppingListDialogComponent, {
      width: '95%',
      maxWidth: '500px',
      panelClass: 'ios-dialog'
    });
  }


  setNav() {
    // this.checkFavorites();
    let navConfig: NavConfig = new NavConfig();
    navConfig.title = 'Inventario';
    navConfig.ico.menu = true;
    navConfig.ico.favorite = false;
    navConfig.ico.logut = false;
    navConfig.ico.home = true;
    navConfig.ico.cart = false;
    navConfig.goto = "/app/dashboard";

    // navConfig.favorite.url = 'favorites';
    this.navService.setNavConfig(navConfig);
  }
}