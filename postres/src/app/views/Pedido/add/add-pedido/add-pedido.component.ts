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

import { AddPedidoRecetaDialogComponent } from '../add-pedido-receta-dialog/add-pedido-receta-dialog.component';
import { AddPedidoCustomerDialogComponent } from '../add-pedido-customer-dialog/add-pedido-customer-dialog.component';
import { Customer } from '../../../../models/customer.model';
import { MatExpansionModule } from '@angular/material/expansion';
import { Receta } from '../../../../models/receta.model';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { Pedido } from '../../../../models/pedido.model';
import { merge } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button'; // Para mat-mini-fab
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InventarioCheckerService,RecetaConCantidad, ResultadoAnalisis, ResultadoReceta, EntradaReceta } from '../../../../services/inventories/inventario-checker.service';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-add-pedido',
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
    animations: [
      trigger('fadeSlide', [
        transition(':enter', [
          style({ opacity: 0, transform: 'translateY(10px)' }),
          animate('220ms ease-out', style({ opacity: 1, transform: 'none' })),
        ]),
      ]),
      trigger('listIn', [
        transition('* => *', [
          query(':enter', [
            style({ opacity: 0, transform: 'translateY(8px)' }),
            stagger(40, animate('180ms ease-out', style({ opacity: 1, transform: 'none' }))),
          ], { optional: true }),
        ]),
      ]),
    ],
  templateUrl: './add-pedido.component.html',
  styleUrl: './add-pedido.component.scss'
})
export class AddPedidoComponent implements OnInit {

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
  checkInventory = false;

  customer: Customer = {
    id: "",
    name: '',
    phoneNumber: 0,
    address: '',
    email: '',
    notas: '',
  }


  pedidoForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    dayDue: [null, Validators.required],
    createDay: [new Date(), Validators.required],
    customer: [null, Validators.required],
    recetas: [[] as Receta[]],
    delivery: [false],
    on_delivery: [false],
    cancel: [false],
    pendy: [true],
    charges: [false],
    enCurso: [false],
    ispriority:[false],
    wasPriority:[false],
    onPausa:[false],
    cost_total: [0, Validators.required],
    cost_base: [0, Validators.required],
    profit: [0],
    profit_Percentage: [0],
    delivery_cost: [0],
    miscellaneous_cost: [0],
    pedido: ['', Validators.required],
    address_Of_delivery: [''],
    note_of_miscellaneous_Cost: [''],
    instrucciones: [''],
    notas: [''],
  });


entradas = signal<EntradaReceta[]>([this.nuevaEntrada()]);
resultado = signal<ResultadoAnalisis | null>(null);
private detallesAbiertos = signal<Set<string>>(new Set());
private checkerService = inject(InventarioCheckerService);

  constructor() {
    this.setNav();

  }

  ngOnInit() {
    const campoA = this.pedidoForm.get('profit_Percentage');
    const campoB = this.pedidoForm.get('delivery_cost');
    const campoC = this.pedidoForm.get('miscellaneous_cost');
    merge(campoA!.valueChanges, campoB!.valueChanges, campoC!.valueChanges).subscribe(() => {
      this.calcularTotal();
    });

    this.pedidoForm.get('dayDue')?.valueChanges.subscribe(nuevaFecha => {
      this.newDate = nuevaFecha;
      // console.log('La nueva fecha seleccionada es:', nuevaFecha);
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

    this.dialog.open(AddPedidoCustomerDialogComponent, {
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
          // console.log('El Customer:', this.customer);
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

    this.dialog.open(AddPedidoRecetaDialogComponent, {
      width: '90%',
      maxWidth: '400px',
      panelClass: 'ios-dialog-panel'
    }).afterClosed().subscribe(res => {
      if (res) {
        this.agregarReceta(res);
        const entrda:EntradaReceta = this.addNuevaEntrada(res);
        this.agregarEntrada(entrda);

      }
      this.calcularTotal();
    });
  }

  // Método para agregar una receta y recalcular el costo
  agregarReceta(receta: Receta) {
    let recetasActuales = this.pedidoForm.get('recetas')?.value || [];
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
    // Usamos + para convertir el string a número inmediatamente
    const base = Number(this.pedidoForm.get('cost_base')?.value) || 0;
    const delivery = Number(this.pedidoForm.get('delivery_cost')?.value) || 0;
    const misc = Number(this.pedidoForm.get('miscellaneous_cost')?.value) || 0;

    const cost = base + delivery + misc; // Ahora sí se sumarán correctamente

    const porcentaje = Number(this.pedidoForm.get('profit_Percentage')?.value) || 0;
    const profit = this.calcularPorcentaje(porcentaje, cost) || 0;

    this.pedidoForm.patchValue({
      cost_total: cost + profit,
      profit: profit
    }, { emitEvent: false }); // Usamos emitEvent: false para evitar bucles infinitos
  }



  calcularPorcentaje(porcentaje: number, costo: number): number {
    if (porcentaje != null && porcentaje != undefined && porcentaje !== 0) {
      return costo * (porcentaje / 100);
    }
    return 0;
  }


  // Función para el click
  toggleCosto() {
    this.esSinCargos = !this.esSinCargos;
    // console.log(" this.esSinCargos:", this.esSinCargos);
  }


   togglePrioridad() {
    this.esPrioritario = !this.esPrioritario;
  }

  toggleCheckInventory(){
    this.checkInventory = ! this.checkInventory;
    this.analizar();
  }

  toggleOpen() {
    this.isOpen = !this.isOpen;
  }


  async guardar() {
    const newPedido: Pedido = {
      ...this.pedidoForm.value,
    };
    newPedido.dayDue = this.newDate;
    newPedido.createDay = new Date();
    newPedido.charges = this.esSinCargos;
    newPedido.ispriority = this.esPrioritario;
    newPedido.wasPriority = newPedido.ispriority 
    newPedido.editDay = new Date();
    newPedido.deliveryDay = newPedido.dayDue;
    newPedido.confirInventory = this.resultado()!.todoAlcanza;
    newPedido.itWasconsume = false;
    newPedido.issue = false;
    // newPedido.orderNumber = 0;
    await this.pedidoService.guardar(newPedido);
    this.router.navigate(['/app/pedido/list']);
  }


  notificarCopiado() {
  this.snackBar.open('Dirección copiada al portapapeles', 'Cerrar', {
    duration: 2000,
    panelClass: ['ios-snackbar'] // Puedes darle estilo en tu CSS global
  });
}

 // ── ────────────────────── EntradaReceta ───────────────────────────────────────

 private nuevaEntrada(): EntradaReceta {
    return { uid: crypto.randomUUID(), receta: null, cantidad: 1, maximoPosible: 0 };
  }


addNuevaEntrada(receta: Receta): EntradaReceta {
    return { 
      uid: crypto.randomUUID(), 
      receta: receta, 
      cantidad: 1, 
      maximoPosible: 0 
    };
  }

  agregarEntrada(entrda: EntradaReceta) {
    this.entradas.update(arr => [...arr, entrda]);
  }

analizar() {
    const solicitudes: RecetaConCantidad[] = this.entradas()
      .filter(e => e.receta !== null)
      .map(e => ({ receta: e.receta!, cantidad: e.cantidad }));

    const res = this.checkerService.analizar(solicitudes);
    this.resultado.set(res);
    // console.log('this.resultado',this.resultado());
    const conFaltantes = new Set(
      res.resultados.filter(r => !r.puedeCompletarse).map(r => r.receta.id!)
    );
    this.detallesAbiertos.set(conFaltantes);
  }

 // ── DETALLE TOGGLE ────────────────────────────────────────────────────────
  toggleDetalle(id: string) {
    this.detallesAbiertos.update(s => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

    detalleAbierto(id: string): boolean {
    return this.detallesAbiertos().has(id);
  }

   fmt(v: number): string {
    return new Intl.NumberFormat('es', { style: 'currency', currency: 'USD' }).format(v);
  }

  now(): string {
    return new Date().toLocaleString('es');
  }


  imprimir() {
  window.print();
}
 // ── ─────────────────────────────────────────────────────────────
 setNav() {
    // this.checkFavorites();
    let navConfig: NavConfig = new NavConfig();
    navConfig.title = 'Nuevo Pedido';
    navConfig.ico.menu = false;
    navConfig.ico.favorite = false;
    navConfig.ico.logut = false;
    navConfig.ico.back = true;
    navConfig.ico.cart = false;
    navConfig.goto ='/app/pedido/list';
    if (this.isFavoriteView) {
      navConfig.favorite.active = this.isFavoriteView;
    }
    // navConfig.favorite.url = 'favorites';
    this.navService.setNavConfig(navConfig);
  }

}


