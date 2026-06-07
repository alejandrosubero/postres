import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { NavService } from '../../../services/navegate/nav.service';
import { NavConfig } from '../../../models/navegation/navElemet.model';
import { FormsModule } from '@angular/forms';
import { RecetaService } from '../../../services/data/receta.service';
import { Receta } from '../../../models/receta.model';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-lista-receta',
  standalone: true,
  imports: [FormsModule, CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './lista-receta.component.html',
  styleUrl: './lista-receta.component.scss'
})
export class ListaRecetaComponent {

  private recetaService = inject(RecetaService);
  private router = inject(Router);
  private navService = inject(NavService);
  isFavoriteView: boolean = false;

  // Accedemos a la señal directamente del servicio
  recetas = this.recetaService.recetas();
  searchTerm = signal('');
  activeFavoriteView = 0;


  constructor() {
    this.setNav();
    const navigation = this.router.getCurrentNavigation();
    this.activeFavoriteView = navigation?.extras.state?.['receta'];
    if (this.activeFavoriteView === 1) {
      this.recetas = this.recetaService.recetas().filter(item => item.isfavorite === true);
    }
  }

  // Señal calculada: se actualiza sola cada vez que 'searchTerm' o 'ingredientesSignal' cambian
  filteredRecetas = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const lista = this.recetas;
    if (term.length < 2) return lista;
    return lista.filter(item =>
      item.Name.toLowerCase().includes(term)
    );
  });


  seleccionarIngrediente(receta: Receta) {
    if (this.activeFavoriteView === 1) {
      let viewFavorite = true;
      this.router.navigate(['/app/receta/detail'], { state: { receta, viewFavorite } });
    } else {
      // Para pasar el objeto, podemos usar State en el Router
      this.router.navigate(['/app/receta/detail'], { state: { receta } });
    }
  }


  add() {
    const routeBase = '/app/receta/add';
    this.router.navigate([routeBase]);
  }


  setNav() {
    let navConfig: NavConfig = new NavConfig();
    navConfig.title = 'Recetas';
    navConfig.ico.menu = true;
    navConfig.ico.favorite = false;
    navConfig.ico.logut = false;
    navConfig.ico.home = true;
    navConfig.ico.cart = false;
    navConfig.goto2 = '/app/dashboard?tab=1'
    if (this.isFavoriteView) {
      navConfig.favorite.active = this.isFavoriteView;
    }
    this.navService.setNavConfig(navConfig);
  }

}
