import { Component, effect, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { Receta } from '../../../models/receta.model'; 
import { NavService } from '../../../services/navegate/nav.service';
import { Router } from '@angular/router';
import { NavConfig } from '../../../models/navegation/navElemet.model';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RecetaService } from '../../../services/data/receta.service';

@Component({
  selector: 'app-detail-receta',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatCardModule, CommonModule],
  templateUrl: './detail-receta.component.html',
  styleUrl: './detail-receta.component.scss'
})
export class DetailRecetaComponent {

  private navService = inject(NavService);
  private router = inject(Router);
  private recetaService = inject(RecetaService);
  private viewFavorite = false;

  isFavoriteView: boolean = false;
  isFabOpen = false;
  receta!: Receta;
  recetaId: string = '';

  constructor() {

    const navigation = this.router.getCurrentNavigation();
    this.receta = navigation?.extras.state?.['receta'];
    this.viewFavorite = navigation?.extras.state?.['viewFavorite'];

    if (!this.receta) {
      this.router.navigate(['/app/receta/list']);
    } else {
      this.checkFavoriteView();
      this.setNav();
    }

    effect(() => {
      let trogleFavorite: boolean = this.navService.config().favorite.toggleFavorite;
      if (trogleFavorite != this.isFavoriteView) {
        this.toggleFavorite(trogleFavorite);
      }
    });
  }


  checkFavoriteView() {
    if (this.receta.id) {
      this.recetaId = this.receta.id;
    }
    if (this.receta.isfavorite != undefined && this.receta.isfavorite != null) {
      this.isFavoriteView = this.receta.isfavorite;
    }
  }

  async update() {
    if (this.recetaId != '') {
      console.log('this.receta = ', this.receta);
      await this.recetaService.editar(this.recetaId, this.receta);
    }
  }


  toggleFab() {
    this.isFabOpen = !this.isFabOpen;
  }

  edit(): void {
    this.isFabOpen = false;
    this.router.navigate(['/app/receta/edit'], {
      state: { receta: this.receta }
    });
  }

  confirmDelete(): void {
    this.isFabOpen = false;
    this.eliminar();
  }

  async eliminar() {
    const confirmacion = confirm("¿Estás seguro de eliminar este ingrediente?");

    if (confirmacion && this.receta.id) {
      try {
        await this.recetaService.borrar(this.receta.id);
        this.router.navigate(['/app/receta/list']);
      } catch (error) {
        console.error("Error al borrar:", error);
      }
    }
  }


  toggleFavorite(trogleFavorite: boolean): void {
    this.receta.isfavorite = trogleFavorite;
    this.update();
  }

  setNav() {
    let navConfig: NavConfig = new NavConfig();
    navConfig.title = 'Receta Detail';
    navConfig.ico.menu = false;
    navConfig.ico.favorite = true;
    navConfig.ico.logut = false;
    navConfig.ico.back = true;
    navConfig.ico.cart = false;
    navConfig.goto = "/app/receta/list";
    if (this.viewFavorite) { navConfig.goto2 = 'none'; }
    navConfig.favorite.viewDetail = true;
    navConfig.favorite.active = this.isFavoriteView;
    navConfig.favorite.toggleFavorite = this.isFavoriteView;
    this.navService.setNavConfig(navConfig);
  }

}
