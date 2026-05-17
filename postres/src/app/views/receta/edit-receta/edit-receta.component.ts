import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NavConfig } from '../../../models/navegation/navElemet.model';
import { Receta, RecetaIngredientes } from '../../../models/receta.model';
import { RecetaService } from '../../../services/data/receta.service';
import { NavService } from '../../../services/navegate/nav.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AddIngredienteDialogComponent } from '../add-ingrediente-dialog/add-ingrediente-dialog.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ConfirmDialogComponent } from '../../../share/confirm-dialog/confirm-dialog.component';
import { FormArray, FormControl } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-edit-receta',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    CommonModule,
    MatButtonModule,
    MatCardModule,
    CommonModule,
  ],
  templateUrl: './edit-receta.component.html',
  styleUrl: './edit-receta.component.scss'
})
export class EditRecetaComponent {

  private recetaService = inject(RecetaService);
  private navService = inject(NavService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  isMenuOpen = signal(false);
  isFavoriteView: boolean = false;
  isFabOpen = false;
  receta!: Receta;
  recetaForm: FormGroup;
  recetaId: string = "";

  constructor() {
    this.setNav();
    this.recetaForm = this.fb.group({
      Name: ['', Validators.required],
      Lista_ingredientes: [[] as RecetaIngredientes[]],
      CostoTotal: [0],
      instrucciones: [''],
      Notes: this.fb.array([])
    });

    const navigation = this.router.getCurrentNavigation();
    this.receta = navigation?.extras.state?.['receta'];

    if (!this.receta) {
      this.router.navigate(['/app/receta/list']);

    } else {
      // 1. Limpiamos el array por si acaso
      const notesArray = this.recetaForm.get('Notes') as FormArray;
      notesArray.clear();

      // 2. Si la receta tiene notas, creamos los controles necesarios
      if (this.receta.Notes && Array.isArray(this.receta.Notes)) {
        this.receta.Notes.forEach(nota => {
          notesArray.push(this.fb.control(nota));
        });
      }

      // 3. Ahora sí, hacemos el patchValue (llenará el resto de campos)
      this.recetaForm.patchValue(this.receta);

      this.recetaId = this.receta.id!;
      // console.log("EDIT: ", this.receta);
    }
    // } else {
    //   this.recetaForm.patchValue(this.receta);
    //   this.recetaId = this.receta.id!;
    //   console.log("EDIT: ", this.receta);
    // }
  }

  agregarIngrediente() {
    this.dialog.open(AddIngredienteDialogComponent, {
      width: '90%',
      maxWidth: '400px',
      panelClass: 'ios-dialog-panel'
    }).afterClosed().subscribe(res => {
      if (res) {
        const lista = [...this.recetaForm.value.Lista_ingredientes!, res];
        const nuevoCosto = lista.reduce((acc, curr) => acc + (curr.Cost || 0), 0);
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
        const lista = [...this.recetaForm.value.Lista_ingredientes!];
        lista.splice(index, 1);
        const nuevoTotal = lista.reduce((acc, curr) => acc + (curr.Cost || 0), 0);
        this.recetaForm.patchValue({ Lista_ingredientes: lista, CostoTotal: nuevoTotal });
      }
    });
  }


  async guardar() {
    if (this.recetaForm.valid) {
      const nuevaReceta: Receta = { ...this.recetaForm.value, };
      nuevaReceta.Date = new Date();
      await this.recetaService.editar(this.recetaId, nuevaReceta);
      this.router.navigate(['/app/receta/list']);
    }
  }


  agregarNota() {
    const notesArray = this.recetaForm.get('Notes') as FormArray;
    notesArray.push(this.fb.control(''));
  }


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
    navConfig.title = 'Edit Receta';
    navConfig.ico.menu = false;
    navConfig.ico.favorite = false;
    navConfig.ico.logut = false;
    navConfig.ico.back = true;
    navConfig.ico.cart = false;
    navConfig.goto = "/app/receta/list";
    if (this.isFavoriteView) {
      navConfig.favorite.active = this.isFavoriteView;
    }
    // navConfig.favorite.url = 'favorites';
    this.navService.setNavConfig(navConfig);
  }

  // En el .ts agrega este getter para mayor limpieza
  get notas() {
    return this.recetaForm.get('Notes') as FormArray;
  }

}
