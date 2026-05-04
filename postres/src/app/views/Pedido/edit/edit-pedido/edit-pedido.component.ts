import { Component, inject, signal, OnInit } from '@angular/core';
import { NavConfig } from '../../../../models/navegation/navElemet.model';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NavService } from '../../../../services/navegate/nav.service';
import { PedidoService } from '../../../../services/data/pedido.service';

import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';

import { Customer } from '../../../../models/customer.model';
import { MatExpansionModule } from '@angular/material/expansion';
import { Receta } from '../../../../models/receta.model';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { Pedido } from '../../../../models/pedido.model';
import { merge, throwIfEmpty } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button'; // Para mat-mini-fab
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EditPedidoRecetaDialogComponent } from '../edit-pedido-receta-dialog/edit-pedido-receta-dialog.component';
import { EditPedidoCustomerDialogComponent } from '../edit-pedido-customer-dialog/edit-pedido-customer-dialog.component';


@Component({
  selector: 'app-edit-pedido',
  standalone: true,
  imports: [
    MatButtonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    CommonModule,
    ClipboardModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatIconModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './edit-pedido.component.html',
  styleUrl: './edit-pedido.component.scss'
})
export class EditPedidoComponent implements OnInit {

  private navService = inject(NavService);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private pedidoService = inject(PedidoService);
  private snackBar = inject(MatSnackBar);

  isMenuOpen = signal(false);
  isFavoriteView: boolean = false;
  panelOpenState = false;
  customerExist = false;
  resetaExist = false;

  isMobile: boolean = false;
  isEmailExpanded = false;
  esSinCargos: boolean = false;
  esPrioritario: boolean = false;
  costosVariosDetalles = false;
  isOpen: boolean = false;
  newDate: Date = new Date();
  public pedidoForm: FormGroup;
  public pedido: Pedido;
  public pedidoId = '';

  customer: Customer = {
    id: "",
    name: '',
    phoneNumber: 0,
    address: '',
    email: '',
    notas: '',
  }


  constructor() {
    this.setNav();

    this.pedidoForm = this.fb.group({
      id: [''],
      name: ['', Validators.required],

      dayDue: [null, Validators.required],
      createDay: [new Date(), Validators.required],
      editDay: [null],

      customer: [null, Validators.required],
      recetas: [[] as Receta[]],

      delivery: [false],
      on_delivery: [false],

      charges: [false],
      enCurso: [true],
      pendy: [true],
      onPausa: [false],
      cancel: [false],

      ispriority: [false],
      wasPriority: [false],

      cost_total: [0, Validators.required],
      cost_base: [0, Validators.required],

      profit: [0],
      profit_Percentage: [0],
      delivery_cost: [0],
      miscellaneous_cost: [0],

      note_of_miscellaneous_Cost: [''],

      pedido: ['', Validators.required],

      address_Of_delivery: [''],
      instrucciones: [''],
      notas: [''],

    });

    const navigation = this.router.getCurrentNavigation();
    this.pedido = navigation?.extras.state?.['pedido'];
    console.log("navigation?.extras.state?.['pedido']: ", this.pedido);
    if (this.pedido.customer) {
      this.customer = this.pedido.customer;
      this.customerExist = true;
      console.log("EDIT customer: ", this.customer);
    }

    if (!this.pedido) {
      this.router.navigate(['/app/pedido/list']);
    } else {

      this.pedidoId = this.pedido.id!;

      if (this.pedido.charges != undefined && this.pedido.charges != null) {
        this.esSinCargos = this.pedido.charges;
      }

      if (this.pedido.ispriority != undefined && this.pedido.ispriority != null) {
        this.esPrioritario = this.pedido.ispriority;
      }

      this.pedidoForm.patchValue(this.pedido);

      console.log("EDIT Pedido: ", this.pedido);
    }
  }

  ngOnInit() {
    if (this.customer) {
      this.pedidoForm.patchValue({
        customer: this.customer,
      }, { emitEvent: false });
    }
    const campoA = this.pedidoForm.get('profit_Percentage');
    const campoB = this.pedidoForm.get('delivery_cost');
    const campoC = this.pedidoForm.get('miscellaneous_cost');
    merge(campoA!.valueChanges, campoB!.valueChanges, campoC!.valueChanges).subscribe(() => {
      this.calcularTotal();
    });

    this.pedidoForm.get('dayDue')?.valueChanges.subscribe(nuevaFecha => {
      this.newDate = nuevaFecha;
      console.log('La nueva fecha seleccionada es:', nuevaFecha);
      this.verificarFecha(nuevaFecha);
    });
  }

  verificarFecha(fecha: Date) {
    // Lógica personalizada
    const hoy = new Date();
    if (fecha < hoy) {
      console.warn('La fecha seleccionada ya pasó');
    } else {
      console.warn('La fecha seleccionada no a pasado');
    }
  }


  addCustomer() {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    this.dialog.open(EditPedidoCustomerDialogComponent, {
      width: '90%',
      maxWidth: '400px',
      panelClass: 'ios-dialog-panel',
      autoFocus: 'first-tabbable', // Fuerza el foco al primer input/botón del diálogo
      restoreFocus: false,
    }).afterClosed().subscribe(res => {
      if (res) {
        this.customer = res;
        if (this.customer.name !== '') {
          this.customerExist = true;
          console.log('El Customer:', this.customer);
        }
        this.pedidoForm.patchValue({
          customer: this.customer,
        });
      }
    });
  }

  quitarCustomer() {
    this.pedidoForm.get('customer')?.reset();
    this.customer = {
      id: "",
      name: '',
      phoneNumber: 0,
      address: '',
      email: '',
      notas: '',
    }
    this.addCustomer();
  }

  addReceta() {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    this.dialog.open(EditPedidoRecetaDialogComponent, {
      width: '90%',
      maxWidth: '400px',
      panelClass: 'ios-dialog-panel'
    }).afterClosed().subscribe(res => {
      if (res) {
        this.agregarReceta(res);
      }
      this.calcularTotal();
    });
  }

  // Método para agregar una receta y recalcular el costo
  agregarReceta(receta: Receta) {
    const recetasActuales = this.pedidoForm.get('recetas')?.value || [];
    const nuevasRecetas = [...recetasActuales, receta];
    this.actualizarRecetasYCostos(nuevasRecetas);
  }

  // Método para quitar una receta por índice y recalcular
  remuveReceta(index: number) {
    const recetasActuales = [...(this.pedidoForm.get('recetas')?.value || [])];
    recetasActuales.splice(index, 1);
    this.actualizarRecetasYCostos(recetasActuales);
  }

  // Lógica central para actualizar el form
  private actualizarRecetasYCostos(recetas: Receta[]) {
    // 1. Sumar los CostoTotal de cada receta
    const nuevoCostoBase = recetas.reduce((acc, curr) => acc + (curr.CostoTotal || 0), 0);
    // 2. Actualizar el formulario
    this.pedidoForm.patchValue({
      recetas: recetas,
      cost_base: nuevoCostoBase
    });
    if (!this.resetaExist) {
      this.resetaExist = true;
    }
  }

  calcularTotal() {
    const base = Number(this.pedidoForm.get('cost_base')?.value) || 0;
    const delivery = Number(this.pedidoForm.get('delivery_cost')?.value) || 0;
    const misc = Number(this.pedidoForm.get('miscellaneous_cost')?.value) || 0;
    const cost = base + delivery + misc;
    const porcentaje = Number(this.pedidoForm.get('profit_Percentage')?.value) || 0;
    const profit = this.calcularPorcentaje(porcentaje, cost) || 0;

    this.pedidoForm.patchValue({
      cost_total: cost + profit,
      profit: profit
    }, { emitEvent: false });
  }

  calcularPorcentaje(porcentaje: number, costo: number): number {
    if (porcentaje != null && porcentaje != undefined && porcentaje !== 0) {
      return costo * (porcentaje / 100);
    }
    return 0;
  }

  toggleCosto() {
    this.esSinCargos = !this.esSinCargos;
  }

  togglePrioridad() {
    this.esPrioritario = !this.esPrioritario;
  }

  toggleOpen() {
    this.isOpen = !this.isOpen;
  }

  async guardar() {
    const editPedido: Pedido = {
      ...this.pedidoForm.value,
    };
    editPedido.dayDue = this.newDate;
    editPedido.charges = this.esSinCargos;
    editPedido.ispriority = this.esPrioritario;
    editPedido.wasPriority = editPedido.ispriority
    editPedido.editDay = new Date();

    console.log('EL_PEDIDO: ->', editPedido);

    await this.pedidoService.editar(this.pedidoId, editPedido);


    this.router.navigate(['/app/pedido/list']);
  }


  setNav() {
    // this.checkFavorites();
    let navConfig: NavConfig = new NavConfig();
    navConfig.title = 'Edit Pedido';
    navConfig.ico.menu = false;
    navConfig.ico.favorite = false;
    navConfig.ico.logut = false;
    navConfig.ico.back = true;
    navConfig.goto = "/app/pedido/list";
    navConfig.ico.cart = false;
    if (this.isFavoriteView) {
      navConfig.favorite.active = this.isFavoriteView;
    }
    // navConfig.favorite.url = 'favorites';
    this.navService.setNavConfig(navConfig);
  }

  notificarCopiado() {
    this.snackBar.open('Dirección copiada al portapapeles', 'Cerrar', {
      duration: 2000,
      panelClass: ['ios-snackbar']
    });
  }

}


