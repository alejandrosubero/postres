
import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FirebaseService } from '../../../services/data/firebase.service';
import { Ingrediente } from '../../../models/ingrediente.model';
import { Router } from '@angular/router';
import { NavConfig } from '../../../models/navegation/navElemet.model';
import { NavService } from '../../../services/navegate/nav.service';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';

@Component({
  selector: 'app-edit-ingrediente',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatSlideToggleModule],
  templateUrl: './edit-ingrediente.component.html',
  styleUrl: './edit-ingrediente.component.scss'
})


export class EditIngredienteComponent {
  private fb = inject(FormBuilder);
  private fbService = inject(FirebaseService);
  private router = inject(Router);
  ingrediente: Ingrediente;
  private navService = inject(NavService);
  isMenuOpen = signal(false);
  isFavoriteView: boolean = false;
  unidades = ['g', 'kg', 'oz', 'lb', 'ml', 'l', 'unit', 'cup', 'tablespoon', 'teaspoon'];
  ingredienteId: string = "";
  form: FormGroup;


  constructor() {
    this.setNav();
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      presentacion: [null, Validators.required],
      precio: [null, Validators.required],
      unidadBase: ['', Validators.required],
      precioPorUnidad: [{ value: 0, disabled: true }], // Campo de solo lectura
      categoria: [''],
      cantidad: [null],
      notificar: [false],
      cantidadMinima: [null],
      notas: ['']
      
    });

     this.form.valueChanges.subscribe(() => {
    this.calcularPrecioUnitario();
  });

    const navigation = this.router.getCurrentNavigation();
    this.ingrediente = navigation?.extras.state?.['ingrediente'];

    if (this.ingrediente) {
      this.ingredienteId = this.ingrediente.id!;
      this.form.patchValue(this.ingrediente);
    }
  }

  private calcularPrecioUnitario() {
  const precio = this.form.get('precio')?.value;
  const presentacion = this.form.get('presentacion')?.value;

  // Solo calculamos si ambos tienen valores mayores a cero
  if (precio && presentacion && presentacion > 0) {
    const resultado = (precio / presentacion).toFixed(2);
    // Usamos emitEvent: false para evitar un bucle infinito de cambios
    this.form.patchValue({ precioPorUnidad: resultado }, { emitEvent: false });
  }
}

  async guardar() {
    if (this.form.valid) {
      const datosActualizados = {
        ...this.form.value,
        precioPorUnidad: parseFloat(this.form.get('precioPorUnidad')?.value || 0)
      };

      await this.fbService.editar(this.ingredienteId, datosActualizados);
      this.router.navigate(["/app/ingredient/list"]);
    }
  }


  irADetail() {
    this.router.navigate(['/app/ingredient/detail'], {
      state: { ingrediente: this.ingrediente }
    });
  }


  setNav() {
    // this.checkFavorites();
    let navConfig: NavConfig = new NavConfig();
    navConfig.title = 'Ingrediente Edit';
    navConfig.ico.menu = false;
    navConfig.ico.favorite = true;
    navConfig.ico.logut = false;
    navConfig.ico.back = true;
    navConfig.ico.cart = false;
    navConfig.goto = "/app/ingredient/list";

    if (this.isFavoriteView) {
      navConfig.favorite.active = this.isFavoriteView;
    }
    // navConfig.favorite.url = 'favorites';
    this.navService.setNavConfig(navConfig);
  }


}