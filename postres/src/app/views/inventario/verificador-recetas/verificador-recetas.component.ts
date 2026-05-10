// verificador-recetas/verificador-recetas.component.ts
import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';
import { MatBadgeModule } from '@angular/material/badge';
import { RecetaService } from '../../../services/data/receta.service';
import { InventarioCheckerService, RecetaConCantidad, ResultadoAnalisis, ResultadoReceta, EntradaReceta} from '../../../services/inventories/inventario-checker.service';
import { Receta } from '../../../models/receta.model';
import { NavConfig } from '../../../models/navegation/navElemet.model';
import { NavService } from '../../../services/navegate/nav.service';




@Component({
  selector: 'app-verificador-recetas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatTooltipModule,
    MatRippleModule,
    MatBadgeModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  templateUrl: './verificador-recetas.component.html',
  styleUrl: './verificador-recetas.component.scss'
})
export class VerificadorRecetasComponent {

  private checkerService = inject(InventarioCheckerService);
  private navService = inject(NavService);
  private recetaService = inject(RecetaService);

  constructor(){
    this.setNav();
  }

  recetas = computed(() => this.recetaService.recetas());

  // ── STATE ──────────────────────────────────────────────────────────────────
  entradas = signal<EntradaReceta[]>([this.nuevaEntrada()]);
  resultado = signal<ResultadoAnalisis | null>(null);

  private detallesAbiertos = signal<Set<string>>(new Set());

  // ── HELPERS ───────────────────────────────────────────────────────────────
  puedeAnalizar = computed(() =>
    this.entradas().some(e => e.receta !== null)
  );

  private nuevaEntrada(): EntradaReceta {
    return { uid: crypto.randomUUID(), receta: null, cantidad: 1, maximoPosible: 0 };
  }

  // ── ENTRADAS ──────────────────────────────────────────────────────────────
  agregarEntrada() {
    this.entradas.update(arr => [...arr, this.nuevaEntrada()]);
  }

  quitarEntrada(idx: number) {
    this.entradas.update(arr => arr.filter((_, i) => i !== idx));
    this.resultado.set(null);
  }

  onRecetaChange(e: EntradaReceta) {
    e.maximoPosible = e.receta ? this.checkerService.maximoPosible(e.receta) : 0;
    this.resultado.set(null);
    this.entradas.update(arr => [...arr]); // forzar re-render
  }

  incrementar(e: EntradaReceta) {
    e.cantidad++;
    this.resultado.set(null);
    this.entradas.update(arr => [...arr]);
  }

  decrementar(e: EntradaReceta) {
    if (e.cantidad > 1) { e.cantidad--; this.resultado.set(null); }
    this.entradas.update(arr => [...arr]);
  }

  // ── ANALIZAR ──────────────────────────────────────────────────────────────
  analizar() {
    const solicitudes: RecetaConCantidad[] = this.entradas()
      .filter(e => e.receta !== null)
      .map(e => ({ receta: e.receta!, cantidad: e.cantidad }));

    const res = this.checkerService.analizar(solicitudes);
    this.resultado.set(res);

    // Abrir detalle de las recetas que tienen faltantes
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

  // ── IMPRIMIR ─────────────────────────────────────────────────────────────
 imprimir() {
  window.print();
}

  // ── UTILS ────────────────────────────────────────────────────────────────
  fmt(v: number): string {
    return new Intl.NumberFormat('es', { style: 'currency', currency: 'USD' }).format(v);
  }
  now(): string {
    return new Date().toLocaleString('es');
  }

  trackByUid(_: number, e: EntradaReceta) { return e.uid; }


  setNav() {
    // this.checkFavorites();
    let navConfig: NavConfig = new NavConfig();
    navConfig.title = 'Check Receta';
    navConfig.ico.menu = true;
    navConfig.ico.favorite = false;
    navConfig.ico.logut = false;
    navConfig.ico.back = false;
    navConfig.ico.cart = false;
    navConfig.goto = "/app/dashboard";

    // navConfig.favorite.url = 'favorites';
    this.navService.setNavConfig(navConfig);
  }
}

