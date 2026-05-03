import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

// ... otros imports de Material
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Receta } from '../../../../models/receta.model';
import { RecetaService } from '../../../../services/data/receta.service';

@Component({
  selector: 'app-add-pedido-receta-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule, 
    AsyncPipe,             
  ],
  templateUrl: './add-pedido-receta-dialog.component.html',
  styleUrl: './add-pedido-receta-dialog.component.scss'
})
export class AddPedidoRecetaDialogComponent implements OnInit {
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



// import { Component, inject, Input } from '@angular/core';
// import { CommonModule, DecimalPipe, CurrencyPipe } from '@angular/common';
// import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
// import { Router } from '@angular/router';

// import { Receta } from '../../../../models/receta.model';
// import { RecetaService } from '../../../../services/data/receta.service';
// import { NavService } from '../../../../services/navegate/nav.service';
// import { PedidoService } from '../../../../services/data/pedido.service';

// import { MatCardModule } from '@angular/material/card';
// import { MatButtonModule } from '@angular/material/button';
// import { MatIconModule } from '@angular/material/icon';
// import { MatDialogRef } from '@angular/material/dialog';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatSelectModule } from '@angular/material/select';


// @Component({
//   selector: 'app-add-pedido-receta-dialog',
//   standalone: true,
//   imports: [
//     MatIconModule,
//     MatButtonModule,
//     MatCardModule,
//     CommonModule,
//     ReactiveFormsModule,
//     MatFormFieldModule,
//     MatInputModule,
//     MatSelectModule,
//   ],
//   templateUrl: './add-pedido-receta-dialog.component.html',
//   styleUrl: './add-pedido-receta-dialog.component.scss'
// })
// export class AddPedidoRecetaDialogComponent {

//   private navService = inject(NavService);
//   private pedidoService = inject(PedidoService);
//   private fb = inject(FormBuilder);
//   private dialogRef = inject(MatDialogRef);

//   private recetaService = inject(RecetaService);
//   private router = inject(Router);
//   public listOfRecetas = this.recetaService.recetas();

//   isFavoriteView: boolean = false;
//   isFabOpen = false;
//   receta!: Receta;
//   recetaExist = false;

//   form: FormGroup = this.fb.group({
//     receta: [null],
//   });


//   onSelect(ing: Receta) {
//     this.receta = ing;
//     if (this.receta != undefined && this.receta != null && this.receta.Name != '') {
//       this.recetaExist = true;
//       this.save();
//     }
//   }

//   save() {
//     this.dialogRef.close(this.receta);
//   }


// }

