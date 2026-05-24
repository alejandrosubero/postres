import { Component, inject, signal, OnInit} from '@angular/core';
// import { Router } from '@angular/router';
import { NavConfig } from '../../models/navegation/navElemet.model';
import { NavService } from '../../services/navegate/nav.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { CalendarShellComponent } from '../../views/calendario/components/calendar-shell/calendar-shell.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    CalendarShellComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  private router = inject(Router);
  private navService = inject(NavService);
  private route = inject(ActivatedRoute);
  isMenuOpen = signal(false);

  // Señal para controlar la pestaña activa (por defecto 0 = Calendario)
  activeTab = signal<number>(0);

  menuItems = [
    { label: 'Cargar Ingrediente', icon: '➕', path: '/app/ingredient/add' },
    { label: 'Lista Ingredientes', icon: '📋', path: '/app/ingredient/list' },
    { label: 'Cargar Receta', icon: '🍳', path: '/app/receta/add' },
    { label: 'Mis Recetas', icon: '📚', path: '/app/receta/list' },
    { label: 'Cargar Pedido', icon: '➕', path: '/app/pedido/add' },
    { label: 'Mis Pedidos', icon: '📚', path: '/app/pedido/list' },
  ];

  isFavoriteView: boolean = false;

  constructor() {
    this.setNav();
  }

  ngOnInit(): void {
    // Escuchamos los queryParams al entrar al Dashboard
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        const tabIndex = parseInt(params['tab'], 10);
        this.activeTab.set(tabIndex);
      } else {
        this.activeTab.set(0); // Si no viene el parámetro, por defecto va a la primera tab
      }
    });
  }
  
  toggleMenu() {
    this.isMenuOpen.set(!this.isMenuOpen());
  }

  navegar(path: string) {
    this.router.navigate([path]);
    this.isMenuOpen.set(false);
  }


  add() {
    const routeBase = '/app/pedido/add';
    this.router.navigate([routeBase]);
  }

  setNav() {
    // this.checkFavorites();
    let navConfig: NavConfig = new NavConfig();
    navConfig.title = 'Dashboard  ';
    navConfig.ico.menu = true;
    navConfig.ico.favorite = true;
    navConfig.ico.logut = false;
    navConfig.ico.cart = true;

    if (this.isFavoriteView) {
      navConfig.favorite.active = this.isFavoriteView;
    }
    // navConfig.favorite.url = 'favorites';
    this.navService.setNavConfig(navConfig);
  }

}
