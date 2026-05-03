import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Receta } from '../../../../models/receta.model';
import { RecetaService } from '../../../../services/data/receta.service';

@Component({
  selector: 'app-edit-pedido-receta-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    AsyncPipe, ],
  templateUrl: './edit-pedido-receta-dialog.component.html',
  styleUrl: './edit-pedido-receta-dialog.component.scss'
})
export class EditPedidoRecetaDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef);
  private recetaService = inject(RecetaService);

  public listOfRecetas = this.recetaService.recetas();
  filteredRecetas!: Observable<Receta[]>;

  form: FormGroup = this.fb.group({
    // Aplicamos el validador estricto aquí
    receta: [null, [Validators.required, this.autocompleteObjectValidator]]
  });

  ngOnInit() {
    this.filteredRecetas = this.form.get('receta')!.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : value?.Name;
        return name ? this._filter(name) : this.listOfRecetas.slice();
      })
    );
  }

  // Validador: comprueba que el valor sea un objeto (seleccionado de la lista) y no un string
  autocompleteObjectValidator(control: AbstractControl): ValidationErrors | null {
    if (control.value && typeof control.value === 'string') {
      return { invalidAutocompleteString: true };
    }
    return null;
  }

  displayFn(receta: Receta): string {
    return receta && receta.Name ? receta.Name : '';
  }

  private _filter(name: string): Receta[] {
    const filterValue = name.toLowerCase();
    return this.listOfRecetas.filter(r => r.Name.toLowerCase().includes(filterValue));
  }

  onSelected(event: MatAutocompleteSelectedEvent) {
    const recetaSeleccionada: Receta = event.option.value;
    // Cerramos el diálogo enviando la receta directamente
    this.dialogRef.close(recetaSeleccionada);
  }

  // Si tienes un botón "Guardar" manual, usa esto:
  save() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.get('receta')?.value);
    }
  }
}
