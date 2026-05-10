
import { Component, inject, signal } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirebaseService } from '../../../services/data/firebase.service';
import { UnitsService } from '../../../services/convert/units.service';
import { Ingrediente } from '../../../models/ingrediente.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-add-ingrediente-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule,MatInputModule, MatSelectModule, CurrencyPipe ],
  templateUrl: './add-ingrediente-dialog.component.html',
  styleUrl: './add-ingrediente-dialog.component.scss'
})
export class AddIngredienteDialogComponent {

  private fb = inject(FormBuilder);
  private fbService = inject(FirebaseService);
  private unitsService = inject(UnitsService);
  private dialogRef = inject(MatDialogRef);

  ingredientes = this.fbService.ingredientesSignal;
  unidades = ['g', 'kg', 'oz', 'lb', 'ml', 'l', 'unit', 'cup', 'tablespoon', 'teaspoon'];
  
  selectedIngrediente: Ingrediente | null = null;
  form: FormGroup = this.fb.group({ 
      nombre: [''], 
      cantidad: [0], 
      unidadSeleccionada: ['']
    });

  costoCalculado = signal(0);

  constructor() {
    this.form.valueChanges.subscribe(() => this.calcular());
  }

  onSelect(ing: Ingrediente) { 
    this.selectedIngrediente = ing; this.calcular(); 
  }

  calcular() {
    if (!this.selectedIngrediente) return;
    const { cantidad, unidadSeleccionada } = this.form.value;
    
    // Conversión a unidad base
    const cantidadEnBase = this.unitsService.convertUnits(cantidad, unidadSeleccionada, this.selectedIngrediente.unidadBase, this.selectedIngrediente.presentacion );
    this.costoCalculado.set(cantidadEnBase * this.selectedIngrediente.precioPorUnidad);
  }

  guardar() {
    this.dialogRef.close({
      idIngrediente: this.selectedIngrediente?.id,
      Name: this.selectedIngrediente?.nombre,
      Cantidad: this.form.value.cantidad,
      presentacion: this.form.value.unidadSeleccionada,
      Cost: this.costoCalculado()
    });
  }
}