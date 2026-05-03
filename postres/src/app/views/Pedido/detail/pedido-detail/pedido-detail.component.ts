import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { NavService } from '../../../../services/navegate/nav.service';
import { PedidoService } from '../../../../services/data/pedido.service';
import { Pedido } from '../../../../models/pedido.model';
import { NavConfig } from '../../../../models/navegation/navElemet.model';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-pedido-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSlideToggleModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatExpansionModule,
    MatChipsModule,
    MatListModule,
    MatCardModule,
    ClipboardModule

  ],
  templateUrl: './pedido-detail.component.html',
  styleUrl: './pedido-detail.component.scss'
})
export class PedidoDetailComponent {

  private snackBar = inject(MatSnackBar);
  private navService = inject(NavService);
  private router = inject(Router);
  private pedidoService = inject(PedidoService);
  public pedido: Pedido;
  private id: string = '';

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
  isFabOpen = false;
  esEncurso: boolean = false;

  constructor() {
    this.setNav();
    const navigation = this.router.getCurrentNavigation();
    this.pedido = navigation?.extras.state?.['pedido'];
    if (this.pedido.id != undefined && this.pedido.id != null) {
      this.id = this.pedido.id;
    }
    if (!this.pedido) {
      this.router.navigate(['/app/pedido/list']);
    } else {
      console.log(this.pedido);
    }
  }


  ngOnInit(): void { }


  toggleEsCurso(): void {
    this.pedido.enCurso = !this.pedido.enCurso;
    this.guardar();
  }


  togglePriority(): void {
    this.pedido.ispriority = !this.pedido.ispriority;
    if (this.pedido.ispriority) {
      if (this.pedido.wasPriority === undefined || this.pedido.wasPriority === null) {
        this.pedido.wasPriority = this.pedido.ispriority
      } else {
        this.pedido.wasPriority = this.pedido.ispriority
      }
      this.pedido.enCurso = this.pedido.ispriority;
    }
    this.guardar();
  }


  toggleOnPausa(): void {
    this.pedido.onPausa = !this.pedido.onPausa;
    if (this.pedido.onPausa) {
      this.pedido.enCurso = false;
      this.pedido.ispriority = false;
      if (!this.pedido.pendy) { this.pedido.pendy = true; }
    } else {
      this.pedido.enCurso = true;
      this.pedido.ispriority = true;
    }
    this.guardar();
  }

  toggleDelivery(): void {
    this.pedido.delivery = !this.pedido.delivery;

    if (this.pedido.delivery) {
      this.pedido.pendy = false;
      this.pedido.enCurso = false;
      this.pedido.ispriority = false;
      this.pedido.onPausa = false;
      this.pedido.cancel = false;
      this.pedido.deliveryDay = new Date();
    } else {
      this.pedido.pendy = true;
      this.pedido.enCurso = true;
      this.pedido.deliveryDay = this.pedido.dayDue;
    }
    this.guardar();
  }

  toggleOnDelivery(): void {
    this.pedido.on_delivery = !this.pedido.on_delivery;
    this.guardar();
  }

  toggleCancel(): void {
    this.pedido.cancel = !this.pedido.cancel;
    if (this.pedido.cancel) {
      this.pedido.pendy = false;
      this.pedido.enCurso = false;
      this.pedido.ispriority = false;
      this.pedido.onPausa = false;
      this.pedido.on_delivery = false;
      this.pedido.delivery = false;
    } else {
      this.pedido.pendy = true;
      this.pedido.enCurso = true;
    }
    this.guardar();
  }




  // Helper para formato de moneda
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
  }

  toggleFab() {
    this.isFabOpen = !this.isFabOpen;
  }

  edit(): void {
    this.isFabOpen = false;
    this.router.navigate(['/app/pedido/edit'], {
      state: { pedido: this.pedido }
    });
  }

  confirmDelete(): void {
    this.isFabOpen = false;
    this.eliminar();
  }

  async eliminar() {
    const confirmacion = confirm("¿Estás seguro de eliminar este ingrediente?");
    if (confirmacion && this.pedido.id) {
      try {
        await this.pedidoService.borrar(this.id);
        this.router.navigate(['/app/pedido/list']);
      } catch (error) {
        console.error("Error al borrar:", error);
      }
    }
  }

  async guardar() {
    const newPedido: Pedido = this.pedido;
    newPedido.editDay = new Date();
    await this.pedidoService.editar(this.id, newPedido);
  }

  notificarCopiado() {
    this.snackBar.open('Dirección copiada al portapapeles', 'Cerrar', {
      duration: 2000,
      panelClass: ['ios-snackbar']
    });
  }


  setNav() {
    // this.checkFavorites();
    let navConfig: NavConfig = new NavConfig();
    navConfig.title = 'Nuevo Pedido';
    navConfig.ico.menu = false;
    navConfig.ico.favorite = false;
    navConfig.ico.logut = false;
    navConfig.ico.back = true;
    navConfig.goto = '/app/pedido/list';
    if (this.isFavoriteView) {
      navConfig.favorite.active = this.isFavoriteView;
    }
    // navConfig.favorite.url = 'favorites';
    this.navService.setNavConfig(navConfig);
  }


  status(): string {
    if (this.pedido.cancel) {
      return 'Cancelado'
    } else if (!this.pedido.enCurso && !this.pedido.cancel && !this.pedido.delivery && this.pedido.pendy) {
      return 'Pendiente';
    } else if (this.pedido.enCurso && !this.pedido.cancel && !this.pedido.delivery && this.pedido.on_delivery) {
      return 'En Entrega';
    } else if (!this.pedido.enCurso && !this.pedido.cancel && this.pedido.delivery) {
      return 'Completado';
    } else if (this.pedido.enCurso && !this.pedido.cancel) {
      return 'En Curso';
    }
    return '---'
  }



}
