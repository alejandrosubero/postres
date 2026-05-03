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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';


@Component({
  selector: 'app-add-ingrediente',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
  ],
  templateUrl: './add-ingrediente.component.html',
  styleUrl: './add-ingrediente.component.scss'
})
export class AddIngredienteComponent implements OnInit {
  private fb = inject(FormBuilder);
  private fbService = inject(FirebaseService);
  private router = inject(Router);
  private navService = inject(NavService);
  isMenuOpen = signal(false);
  isFavoriteView: boolean = false;

  form: FormGroup;
  unidades = ['g', 'kg', 'oz', 'lb', 'ml', 'l', 'unit', 'cup', 'tablespoon', 'teaspoon'];


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

    // Suscripción única y limpia
    this.form.valueChanges.subscribe(() => {
      this.calcularPrecioUnitario();
    });
  }
  ngOnInit(): void {
    this.form.get('notificar')?.valueChanges.subscribe(valor => {
      console.log('El nuevo valor del toggle es:', valor);
    });
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
      const nuevoIngrediente: Ingrediente = {
        ...this.form.value,
        precioPorUnidad: parseFloat(this.form.get('precioPorUnidad')?.value || 0),
        fechaIngreso: new Date().toISOString().split('T')[0] // Fecha actual
      };
      debugger
      await this.fbService.guardar(nuevoIngrediente);
      this.form.reset();
      this.router.navigate(["/app/ingredient/list"]);

    }
  }



  setNav() {
    // this.checkFavorites();
    let navConfig: NavConfig = new NavConfig();
    navConfig.title = 'Nuevo Ingrediente  ';
    navConfig.ico.menu = false;
    navConfig.ico.favorite = false;
    navConfig.ico.logut = false;
    navConfig.ico.back = true;
    navConfig.goto = "/app/ingredient/list";
    if (this.isFavoriteView) {
      navConfig.favorite.active = this.isFavoriteView;
    }
    // navConfig.favorite.url = 'favorites';
    this.navService.setNavConfig(navConfig);
  }



}