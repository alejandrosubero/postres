import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from '../../../services/data/firebase.service';
import { Ingrediente } from '../../../models/ingrediente.model';
import { NavService } from '../../../services/navegate/nav.service';
import { NavConfig } from '../../../models/navegation/navElemet.model';
import { FormsModule } from '@angular/forms'; 
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-list-ingrediente',
  standalone: true,
  imports: [
    FormsModule,
     MatIconModule,
    MatButtonModule
  ],
  templateUrl: './list-ingrediente.component.html',
  styleUrl: './list-ingrediente.component.scss'
})
export class ListIngredienteComponent {

  private fbService = inject(FirebaseService);
  private router = inject(Router);
  private navService = inject(NavService);
  isFavoriteView: boolean = false;

  // Accedemos a la señal directamente del servicio
  ingredientes = this.fbService.ingredientesSignal;
  searchTerm = signal('');

 constructor(){
    this.setNav();
  }

  // Señal calculada: se actualiza sola cada vez que 'searchTerm' o 'ingredientesSignal' cambian
  filteredIngredientes = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const lista = this.fbService.ingredientesSignal();

    if (term.length < 2) return lista;

    return lista.filter(item => 
      item.nombre.toLowerCase().includes(term) || 
      item.unidadBase.toLowerCase().includes(term)
    );
  });


  seleccionarIngrediente(ingrediente: Ingrediente) {
    // Para pasar el objeto, podemos usar State en el Router
    this.router.navigate(['/app/ingredient/detail'], { state: { ingrediente } });
  }

    add() {
    const routeBase = "/app/ingredient/list";
    this.router.navigate([routeBase]);
  }


setNav() {
    // this.checkFavorites();
    let navConfig: NavConfig = new NavConfig();
    navConfig.title = 'Ingredientes';
    navConfig.ico.menu = true;
    navConfig.ico.favorite = false;
    navConfig.ico.logut = false;
     navConfig.ico.home = true;
     navConfig.ico.cart = true;
    navConfig.goto = "/app/dashboard";
    if (this.isFavoriteView) {
      navConfig.favorite.active = this.isFavoriteView;
    }
    // navConfig.favorite.url = 'favorites';
    this.navService.setNavConfig(navConfig);
  }


}