import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavConfig } from '../../../../models/navegation/navElemet.model';
import { NavService } from '../../../../services/navegate/nav.service';
import { PedidoService } from '../../../../services/data/pedido.service';
import { Pedido } from '../../../../models/pedido.model';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PedidoFilterService } from '../../../../services/data/pedido-filter-service'; 
// 1. Importa el módulo en la parte superior
import { MatMenuModule } from '@angular/material/menu'; 
// Asegúrate de tener también estos para el botón y el icono si no los tenías


@Component({
  selector: 'app-pedido-lista',
  standalone: true,
  imports: [
    FormsModule, 
    CommonModule,
    DatePipe, 
    MatIconModule, 
    MatButtonModule, 
    MatMenuModule
  ],
  templateUrl: './pedido-lista.component.html',
  styleUrl: './pedido-lista.component.scss'
})
export class PedidoListaComponent {

  private router = inject(Router);
  private navService = inject(NavService);
  private pedidoService = inject(PedidoService);
  private filterService = inject(PedidoFilterService);
  isFavoriteView: boolean = false;


  // Accedemos a la señal directamente del servicio
  pedidos: Pedido[] = this.pedidoService.pedidos();

  searchTerm = signal('');

  constructor() {
    this.setNav();
  }

  // // Señal calculada: se actualiza sola cada vez que 'searchTerm' o 'ingredientesSignal' cambian
  // filteredRecetas = computed(() => {
  //   const term = this.searchTerm().toLowerCase();
  //   const lista = this.pedidos;
  //   if (term.length < 2) return lista;
  //   return lista.filter(item =>
  //     item.name.toLowerCase().includes(term)
  //   );
  // });

  // La señal calculada ahora delega la lógica al servicio
  filteredRecetas = computed(() => {
    const term = this.searchTerm();
    const listaOriginal = this.pedidoService.pedidos(); // Usamos la señal del servicio de datos
    
    return this.filterService.filter(listaOriginal, term);
  });

  seleccionarPedido(pedido: Pedido) {
    // Para pasar el objeto, podemos usar State en el Router
    this.router.navigate(['/app/pedido/detail'], { state: { pedido } });
  }

  add() {
    const routeBase = '/app/pedido/add';
    this.router.navigate([routeBase]);
  }

setSearch(val: string) {
  this.searchTerm.set(val);
}

  setNav() {
    // this.checkFavorites();
    let navConfig: NavConfig = new NavConfig();
    navConfig.title = 'Pedidos';
    navConfig.ico.menu = true;
    navConfig.ico.favorite = false;
    navConfig.ico.logut = false;
    navConfig.ico.home = true;
    navConfig.ico.cart = false;
    navConfig.ico.back = false;
    // navConfig.goto = "/app/dashboard";
    navConfig.goto2 = '/app/dashboard?tab=1'
    if (this.isFavoriteView) {
      navConfig.favorite.active = this.isFavoriteView;
    }
    // navConfig.favorite.url = 'favorites';
    this.navService.setNavConfig(navConfig);
  }



}
