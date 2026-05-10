import { Component, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RecetaService } from '../../../services/data/receta.service';
import { Receta, RecetaIngredientes } from '../../../models/receta.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AddIngredienteDialogComponent } from '../add-ingrediente-dialog/add-ingrediente-dialog.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { NavService } from '../../../services/navegate/nav.service';
import { Router } from '@angular/router';
import { ConfirmDialogComponent } from '../../../share/confirm-dialog/confirm-dialog.component';
import { FormArray, FormControl } from '@angular/forms';
import { NavConfig } from '../../../models/navegation/navElemet.model';

@Component({
  selector: 'app-add-receta',
  standalone: true,
  imports: [ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    CommonModule,
  ],
  templateUrl: './add-receta.component.html',
  styleUrl: './add-receta.component.scss'
})
export class AddRecetaComponent {

  private dialog = inject(MatDialog);
  private recetaService = inject(RecetaService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  isMenuOpen = signal(false);
  isFavoriteView: boolean = false;
  // private dialogRef = inject(MatDialogRef);
  private navService = inject(NavService);


  recetaForm: FormGroup = this.fb.group({
    Name: ['', Validators.required],
    Lista_ingredientes: [[] as RecetaIngredientes[]],
    CostoTotal: [0],
    instrucciones: [''],
    Notes: this.fb.array([])
  });


  constructor() {
    this.setNav();
  }

  agregarIngrediente() {
    this.dialog.open(AddIngredienteDialogComponent, {
      width: '90%',
      maxWidth: '400px',
      panelClass: 'ios-dialog-panel'
    }).afterClosed().subscribe(res => {
      if (res) {
        // 1. Creas la nueva lista (Correcto, mantiene inmutabilidad)
        const lista = [...this.recetaForm.value.Lista_ingredientes!, res];
        // 2. Calculas el nuevo costo
        const nuevoCosto = lista.reduce((acc, curr) => acc + (curr.Cost || 0), 0);
        // 3. Actualizas todo el formulario de un solo golpe
        this.recetaForm.patchValue({
          Lista_ingredientes: lista,
          CostoTotal: nuevoCosto
        });
      }
    });
  }


  borrarIngrediente(index: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        // 1. Obtenemos la lista actual
        const lista = [...this.recetaForm.value.Lista_ingredientes!];
        // 2. Eliminamos el ingrediente
        lista.splice(index, 1);
        // 3. Calculamos el nuevo total ANTES de pasarlo al formulario
        const nuevoTotal = lista.reduce((acc, curr) => acc + (curr.Cost || 0), 0);
        // 4. Actualizamos el formulario con los valores calculados
        this.recetaForm.patchValue({ Lista_ingredientes: lista, CostoTotal: nuevoTotal });
      }
    });
  }


  async guardar() {
    const nuevaReceta: Receta = {
      ...this.recetaForm.value,
    };
    nuevaReceta.Date = new Date();
    await this.recetaService.guardar(nuevaReceta);
    this.router.navigate(['/app/receta/list']);
  }




  // Método para agregar una nota vacía
  agregarNota() {
    const notesArray = this.recetaForm.get('Notes') as FormArray;
    notesArray.push(this.fb.control(''));
  }

  // Opcional: Método para quitar una nota si te equivocas
  quitarNota(index: number) {
    const notesArray = this.recetaForm.get('Notes') as FormArray;
    notesArray.removeAt(index);
  }


  getNotesControls() {
    return (this.recetaForm.get('Notes') as FormArray).controls;
  }



  setNav() {
    // this.checkFavorites();
    let navConfig: NavConfig = new NavConfig();
    navConfig.title = 'Nueva Receta';
    navConfig.ico.menu = false;
    navConfig.ico.favorite = false;
    navConfig.ico.logut = false;
    navConfig.ico.back = true;
    navConfig.ico.cart = false;
    navConfig.goto = '/app/receta/list';
    if (this.isFavoriteView) {
      navConfig.favorite.active = this.isFavoriteView;
    }
    // navConfig.favorite.url = 'favorites';
    this.navService.setNavConfig(navConfig);
  }


}