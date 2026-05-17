import { Component, inject } from '@angular/core';
import { NavService } from '../../../services/navegate/nav.service';
import { NavConfig } from '../../../models/navegation/navElemet.model';
import { Ingrediente } from '../../../models/ingrediente.model';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FirebaseService } from '../../../services/data/firebase.service';

@Component({
  selector: 'app-detail-ingrediente',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './detail-ingrediente.component.html',
  styleUrl: './detail-ingrediente.component.scss'
})
export class DetailIngredienteComponent {

  private navService = inject(NavService);
  private router = inject(Router);
  private fbService = inject(FirebaseService);
  isFavoriteView: boolean = false;
  isFabOpen = false;
  ingrediente: Ingrediente;

  constructor() {
    this.setNav();
    const navigation = this.router.getCurrentNavigation();
    this.ingrediente = navigation?.extras.state?.['ingrediente'];

    if (!this.ingrediente) {
      this.router.navigate(['/app/ingredient/list']);
    } else {
      // console.log("DETAIL: ", this.ingrediente);
    }
  }



  setNav() {
    // this.checkFavorites();
    let navConfig: NavConfig = new NavConfig();
    navConfig.title = 'Ingrediente Detail';
    navConfig.ico.menu = false;
    navConfig.ico.favorite = false;
    navConfig.ico.logut = false;
    navConfig.ico.back = true;
    navConfig.ico.cart = true;
    navConfig.goto = "/app/ingredient/list";

    if (this.isFavoriteView) {
      navConfig.favorite.active = this.isFavoriteView;
    }
    // navConfig.favorite.url = 'favorites';
    this.navService.setNavConfig(navConfig);
  }


  toggleFab() {
    this.isFabOpen = !this.isFabOpen;
  }


  edit(): void {
    this.isFabOpen = false;
    this.router.navigate(['/app/ingredient/edit'], {
      state: { ingrediente: this.ingrediente }
    });
  }


  confirmDelete(): void {
    this.isFabOpen = false;
    this.eliminarIngrediente();
  }


  async eliminarIngrediente() {
    const confirmacion = confirm("¿Estás seguro de eliminar este ingrediente?");

    if (confirmacion && this.ingrediente.id) {
      try {
        await this.fbService.borrar(this.ingrediente.id);
        this.router.navigate(['/app/ingredient/list']);
      } catch (error) {
        console.error("Error al borrar:", error);
      }
    }
  }


}
