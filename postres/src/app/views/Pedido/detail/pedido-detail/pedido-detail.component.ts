import { Component, Input, Output, EventEmitter, OnInit, inject, signal } from '@angular/core';
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
import { InventoryService } from '../../../../services/inventories/inventory.service';
import { InventarioCheckerService, RecetaConCantidad, ResultadoAnalisis, ResultadoReceta, EntradaReceta } from '../../../../services/inventories/inventario-checker.service';
import { Receta } from '../../../../models/receta.model';
import { provideNativeDateAdapter } from '@angular/material/core';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { MatDialog } from '@angular/material/dialog';
import { IosAlertDialogComponent, IosDialogData } from '../../../../share/ios-alert-dialog/ios-alert-dialog.component';
import { OrderIssueDialogComponent } from '../../issue/order-issue-dialog.component';
import { CalculoPerdidaErrorEnPedidoService } from '../../../../services/data/calculo_perdida_por_error_en_pedido.Service';
import {
  DeliveryMilesDialogComponent,
  DeliveryMilesDialogData,
  DeliveryMilesDialogResult,
} from '../../../../share/milles_dialog/delivery-miles-dialog.component';


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
  templateUrl: './pedido-detail.component.html',
  styleUrl: './pedido-detail.component.scss'
})
export class PedidoDetailComponent {


  private dialog = inject(MatDialog);
  private inventoryService = inject(InventoryService);
  private snackBar = inject(MatSnackBar);
  private navService = inject(NavService);
  private router = inject(Router);
  private pedidoService = inject(PedidoService);
  private errorEnPedidoService = inject(CalculoPerdidaErrorEnPedidoService);
  public pedido: Pedido;
  private id: string = '';

  private detallesAbiertos = signal<Set<string>>(new Set());
  private checkerService = inject(InventarioCheckerService);
  entradas = signal<EntradaReceta[]>([this.nuevaEntrada()]);
  resultado = signal<ResultadoAnalisis | null>(null);

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
  toggleEsCursoResultado = false;


  constructor() {
    this.setNav();
    const navigation = this.router.getCurrentNavigation();
    this.pedido = navigation?.extras.state?.['pedido'];
    if (this.pedido.id != undefined && this.pedido.id != null) {
      this.id = this.pedido.id;

      // corrige el error que se envia a colocar el error pero no se salva el orderIssue
      if (this.pedido.issue && this.pedido.orderIssue === undefined || this.pedido.orderIssue === null) {
        this.pedido.issue = false;
        this.guardar();
      }

      if (this.pedido.milles_for_delivery == undefined || this.pedido.milles_for_delivery === null) {
        this.pedido.milles_for_delivery = 0;
        this.guardar();
      }
    }
    if (!this.pedido) {
      this.router.navigate(['/app/pedido/list']);
    }
  }


  ngOnInit(): void { }


  toggleEsCurso(): void {

    if (this.pedido.enCurso) {
      this.pedido.enCurso = false;
      this.toggleEsCursoResultado = false;
      this.revertProccessOfconsume();
    } else {
      this.analizar();

      if (this.resultado()) {
        this.toggleEsCursoResultado = true;
      }

      if (this.resultado()!.todoAlcanza) {
        this.pedido.enCurso = true;
        if (this.pedido.enCurso) {
          this.confirmarReservaInventario(this.pedido);
        }
      } else {
        this.pedido.enCurso = false;
      }
    }
    this.guardar();
  }

  confirmarPedido(pedido: Pedido) {
    this.inventoryService.procesarDescuentoStock(pedido)
      .then(() => {
        // Notificación de éxito
        this.snackBar.open('Inventario actualizado con éxito', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['success-snackbar']
        });
        // Aquí podrías navegar a otra pantalla si quieres
        // this.router.navigate(['/pedidos']); 
      })
      .catch((error) => {
        // Notificación de error
        this.snackBar.open('Error al actualizar inventario', 'Reintentar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      });
  }


  confirmarReservaInventario(miPedido: Pedido) {

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    const dialogData: IosDialogData = {
      title: 'Alerta', // Título requerido con símbolo
      message: 'Los Ingredientes seran sacados de inventario y puesto en reserva hasta el Delivery.',
      btnLeft: {
        label: 'none',
        value: 'none'
      },
      btnRight: {
        label: 'ok',
        value: true
      }
    };
    // Abrimos el MatDialog pasándole el componente y la configuración
    const dialogRef = this.dialog.open(IosAlertDialogComponent, {
      data: dialogData,
      panelClass: 'ios-custom-panel',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((respuesta: any) => {
      this.confirmarPedido(miPedido);
    });
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


  processOfEndPedido() {
    // Definimos los datos con la interfaz estricta que creamos
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    const dialogData: IosDialogData = {
      title: 'Alerta', // Título requerido con símbolo
      message: '¿Los Ingredientes fueron consumidos?',
      btnLeft: {
        label: 'No',
        value: false
      },
      btnRight: {
        label: 'Sí',
        value: true
      }
    };
    // Abrimos el MatDialog pasándole el componente y la configuración
    const dialogRef = this.dialog.open(IosAlertDialogComponent, {
      data: dialogData,
      panelClass: 'ios-custom-panel',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((respuesta: any) => {
      if (respuesta) {
        this.pedido.itWasconsume = true;
        this.inventoryService.procesarReducedStockReserved(this.pedido);
      } else {
        this.pedido.itWasconsume = false;
      }
    });
  }

  retornDelivery(pedido: Pedido): void {

  }

  toggleDelivery(): void {

    if (this.pedido.enCurso) {

      this.pedido.delivery = !this.pedido.delivery;

      if (this.pedido.delivery) {

        this.pedido.pendy = false;
        this.pedido.enCurso = false;
        this.pedido.ispriority = false;
        this.pedido.onPausa = false;
        this.pedido.cancel = false;
        this.pedido.deliveryDay = new Date();

        this.processOfEndPedido();

        if (this.pedido.issue && this.pedido.orderIssue != undefined && this.pedido.orderIssue != null) {
          this.processErrorDescount();
        }

      } else {
        this.pedido.pendy = true;
        this.pedido.enCurso = true;
        this.pedido.deliveryDay = this.pedido.dayDue;

        if (this.pedido.itWasconsume) {
          this.revertProccessOfconsume();
        }
      }
      this.guardar();
    } else {
      this.onDeliveryDialogAlertCurse();
    }


  }



  processErrorDescount() {

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    // Definimos los datos con la interfaz estricta que creamos
    const dialogData: IosDialogData = {
      title: 'Alerta', // Título requerido con símbolo
      message: 'Se procesara el descuento por error sobre las Ganancias',
      btnLeft: {
        label: 'none',
        value: 'none'
      },
      btnRight: {
        label: 'OK',
        value: true
      }
    };
    const dialogRef = this.dialog.open(IosAlertDialogComponent, {
      data: dialogData,
      panelClass: 'ios-custom-panel',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((respuesta: any) => {
      if (respuesta) {
        if (this.pedido.orderIssue != undefined && this.pedido.orderIssue != null && this.pedido.orderIssue.issueAffectsCosts) {
          this.errorEnPedidoService.procesarErrorPedido(this.pedido, this.pedido.orderIssue.porcentajeError)
            .then(nuevoProfit => {
              this.pedido.profit = nuevoProfit;
            });
        }
      }
    });
  }

  revertCancelReducetoStockReserved() {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    const dialogData: IosDialogData = {
      title: 'Alerta', // Título requerido con símbolo
      message: 'Se revertira el proceso de consumo a reserva.',
      btnLeft: {
        label: 'none',
        value: 'none'
      },
      btnRight: {
        label: 'ok',
        value: true
      }
    };
    // Abrimos el MatDialog pasándole el componente y la configuración
    const dialogRef = this.dialog.open(IosAlertDialogComponent, {
      data: dialogData,
      panelClass: 'ios-custom-panel',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((respuesta: any) => {
      this.inventoryService.cancelReducetoStockReserved(this.pedido);
      this.pedido.itWasconsume = false;
    });
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
      this.processOfEndPedido();
    } else {

      this.pedido.pendy = true;
      this.pedido.enCurso = true;

      if (this.pedido.itWasconsume) {
        this.revertProccessOfconsume();
      }


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

  analizar() {
    // const solicitudes: RecetaConCantidad[] = this.entradas().filter(e => e.receta !== null)
    //   .map(e => ({ receta: e.receta!, cantidad: e.cantidad }));

    const res = this.checkerService.analizarPedido(this.pedido);
    if (res != null && res != undefined) {
      // const res = this.checkerService.analizar(solicitudes);
      this.resultado.set(res);
      // console.log('this.resultado', this.resultado());
  
      const conFaltantes = new Set(
        res.resultados.filter(r => !r.puedeCompletarse).map(r => r.receta.id!)
      );
      // console.log('conFaltantes', conFaltantes);
      this.detallesAbiertos.set(conFaltantes);
      // console.log(' this.detallesAbiertos', this.detallesAbiertos());
    }




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

  revertProccessOfconsume() {
    this.revertCancelReducetoStockReserved();
    this.confirmarPedido(this.pedido);
    this.pedido.itWasconsume = false;
  }


  toggleError(): void {
    this.pedido.issue = !this.pedido.issue;
    if (this.pedido.issue) {
      this.router.navigate(['/app/pedido/edit'], {
        state: { pedido: this.pedido }
      });
    }
  }


  toggleOnDelivery(): void {
    if (this.pedido.enCurso) {
      this.pedido.on_delivery = !this.pedido.on_delivery;
      this.openDeliveryMilesDialog();
    } else {
      this.onDeliveryDialogAlertCurse();
    }
  }

  onDeliveryDialogAlertCurse() {

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    const dialogData: IosDialogData = {
      title: 'Alerta', // Título requerido con símbolo
      message: 'El pedido debe de estar en curso Primero.',
      btnLeft: {
        label: 'none',
        value: 'none'
      },
      btnRight: {
        label: 'ok',
        value: true
      }
    };
    // Abrimos el MatDialog pasándole el componente y la configuración
    const dialogRef = this.dialog.open(IosAlertDialogComponent, {
      data: dialogData,
      panelClass: 'ios-custom-panel',
      disableClose: true,
      autoFocus: 'first-tabbable',
      restoreFocus: false
    });

    dialogRef.afterClosed().subscribe((respuesta: any) => { });
  }





  openDeliveryMilesDialog(): void {
    let milles = 0;

    if (this.pedido.milles_for_delivery != 0) {
      milles = this.pedido.milles_for_delivery;
    }

    const dialogRef = this.dialog.open<DeliveryMilesDialogComponent, DeliveryMilesDialogData, DeliveryMilesDialogResult | null
    >(DeliveryMilesDialogComponent, {
      // ── Datos enviados al dialog ──────────────────────────
      data: {
        initialMiles: milles,
      } satisfies DeliveryMilesDialogData,

      // ── Configuración visual ──────────────────────────────
      panelClass: 'dark-dialog-panel', // clase global para el backdrop/panel
      backdropClass: 'dark-dialog-backdrop',
      width: '420px',          // Ancho máximo (iPad y desktop)
      maxWidth: '95vw',        // Responsivo en mobile
      hasBackdrop: true,
      disableClose: false,     // Permitir cerrar con Escape / click backdrop
      autoFocus: 'dialog',     // Foco al dialog al abrir
    });

    // ── Suscripción al cierre ─────────────────────────────
    dialogRef.afterClosed().subscribe((result: DeliveryMilesDialogResult | null | undefined) => {
      if (result) {
        this.pedido.milles_for_delivery = result.miles;
        this.guardar();
      }
    });
  }



}
