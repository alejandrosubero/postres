import { Component, computed, effect, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/Auth/auth.Service';
import { NavService } from '../../services/navegate/nav.service';
import { FirebaseService } from '../../services/data/firebase.service';
import { MatBadgeModule } from '@angular/material/badge';

// import { DomSanitizer } from '@angular/platform-browser';
// import { NavegateService } from '../../services/navegate/navegateService';
// import { NavConfig } from '../../models/navegation/navElemet.model';
// import { Ingrediente } from '../../models/ingrediente.model';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    MatBadgeModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    RouterOutlet
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent implements OnInit {

  private navService = inject(NavService);
  public navConfig = this.navService.config;
  private breakpointObserver = inject(BreakpointObserver);
  private fbService = inject(FirebaseService);
  private authService = inject(AuthService);

  public isAdmin = false;
  public car = false;
  lowStockCount = 0;

  constructor(private router: Router ) {
    this.isAdmin = this.authService.getRolValue() === 'admin' ? true : false;
    effect(() => {
      this.navConfig = this.navService.config;
    });
  }

  ngOnInit(): void {
    this.getlowStockCount()
  }


  getlowStockCount() {
    const ingredientes = this.fbService.ingredientesSignal();
    if (ingredientes != undefined && ingredientes != null && ingredientes.length > 0) {
      this.lowStockCount = ingredientes.filter(i => i.cantidad <= i.cantidadMinima).length;
    }
  }

  isHandset$: Observable<boolean> = this.breakpointObserver.observe([
    Breakpoints.Handset,
    Breakpoints.Small,
    '(max-width: 768px)'
  ]).pipe(
    map(result => result.matches),
    shareReplay()
  );


  // ======= navegate =============== //
  navigateToInventory(): void {
    this.router.navigate(['/app/inventory/management']);
  }

  navigate(routeBase: string) {
    this.router.navigate([routeBase]);
  }


  //  ============ logout and back================
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goHome(sidenav: any): void {
    const routeBase = "/app/dashboard";
    sidenav.toggle();
    this.navigate(routeBase);
  }

  home(): void {
    const goto: string = this.navConfig().goto2;
    if (goto != undefined && goto != null && goto != '') {
      const urlTree = this.router.parseUrl(goto);
      this.router.navigateByUrl(urlTree);
    } else {
      const routeBase = "/app/dashboard";
      this.navigate(routeBase);
    }
  }


  goFavorites(): void {
    if (this.navConfig().favorite.viewDetail) {
      let value = this.navConfig().favorite.toggleFavorite ? false : true;
      this.navService.updateToggleFavorite(value);
    } else {
      // this.navegateService.goFavorites('favorites', 1);
      let receta = 1;
      this.router.navigate(['/app/receta/list'], { state: { receta } });
    }
  }


  back() {
    const goto: string = this.navConfig().goto;
    if (!goto) return;
   
    if (goto === '/app/receta/list' && this.navConfig().goto2 === 'none') {
      this.navConfig().favorite.viewDetail = false;
      this.goFavorites();
    } else {
      // Creamos un UrlTree para separar limpiamente la ruta base de los queryParams
      const urlTree = this.router.parseUrl(goto);
      this.router.navigateByUrl(urlTree);
    }
  }

  back1() {
    let goto: string = this.navConfig().goto;
    this.navigate(goto);

    // switch (goto) {
    //   case 'app/favorites':
    //     this.navegateService.goFavorites('favorites', 1);
    //     break;
    //   case 'formulations':
    //     this.navegateService.goFavorites('formulations', this.navConfig().favorite.id);
    //     break;
    //   case 'storage':
    //     this.navegateService.goFavorites('storage', 1);
    //     break;
    //   default:
    //     this.navigate(this.navConfig().goto);
    //     break;
    // }
  }


  //  ============ buto ================
  adIngredient(sidenav: any): void {
    const routeBase = '/app/ingredient/add';
    sidenav.toggle();
    this.navigate(routeBase);
  }

  addRecipe(sidenav: any): void {
    const routeBase = '/app/receta/add';
    sidenav.toggle();
    this.navigate(routeBase);
  }

  addPedido(sidenav: any): void {
    const routeBase = '/app/pedido/add';
    sidenav.toggle();
    this.navigate(routeBase);
  }


  addGastosOperativos(sidenav: any): void {
    const routeBase = '/app/mager/Gastos/Operativos';
    sidenav.toggle();
    this.navigate(routeBase);
  }


  magerStadistic(sidenav: any): void {
    const routeBase = '/app/mager/estadisticas';
    sidenav.toggle();
    this.navigate(routeBase);
  }

  magerUsusers(sidenav: any): void {
    const routeBase = '/app/mager/usuarios';
    sidenav.toggle();
    this.navigate(routeBase);
  }

  magerInventario(sidenav: any): void {
    const routeBase = '/app/inventory/management';
    sidenav.toggle();
    this.navigate(routeBase);
  }

  navegateInventario(): void {
    const routeBase = '/app/inventory/management';
    this.navigate(routeBase);
  }

  checkeInventario(sidenav: any): void {
    const routeBase = '/app/inventory/checker';
    sidenav.toggle();
    this.navigate(routeBase);
  }


  goCompareTecnnical(sidenav: any): void {
    // const routeBase = "app/technical/notes/compare";
    // sidenav.toggle();
    // this.navigate(routeBase);
  }

  goAbout(sidenav: any): void {
    // const routeBase = 'app/about';
    // sidenav.toggle();
    // this.navigate(routeBase);
  }

  goMix(sidenav: any): void {
    // const routeBase = 'app/technical/notes/mix';
    // sidenav.toggle();
    // this.navigate(routeBase);
  }
  goJarTest(sidenav: any): void {
    // const routeBase = 'app/lab/test/jar';
    // sidenav.toggle();
    // this.navigate(routeBase);
  }

  goToSourceDetail(): void {
    // const routeBase = "app/technical/notes";
    // this.navegateService.goToDetail(routeBase, this.navConfig().sourceId, 'mix');
  }

  goBackup(sidenav: any): void {
    // const routeBase = "app/backup";
    // sidenav.toggle();
    // this.navigate(routeBase);
  }

  //  ============ ********** ================

  goToPhrase(sidenav: any): void {
    // const routeBase = "app/phrase/main";
    // sidenav.toggle();
    // this.navigate(routeBase);
  }

  downloadPdf(): void {
    // const pdfUrl = this.navConfig().label;
    // const pdfName = `${new Date()}.pdf`;
    // // Crea un enlace temporal.
    // const link = document.createElement('a');
    // link.href = pdfUrl;
    // link.download = pdfName;
    // link.click();
    // link.remove();
  }

}

