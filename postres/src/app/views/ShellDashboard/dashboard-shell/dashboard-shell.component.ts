// dashboard/dashboard-shell.component.ts
import {Component, ChangeDetectionStrategy, inject, signal, computed,} from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { PedidoService } from '../../../services/data/pedido.service';
import { Pedido } from '../../../models/pedido.model';
import { DashboardKpisComponent }     from '../sections/dashboard-kpis/dashboard-kpis.component';
import { DashboardFinancieroComponent } from '../sections/dashboard-financiero/dashboard-financiero.component';
import { DashboardRecetasComponent }  from '../sections/dashboard-recetas/dashboard-recetas.component';
import { DashboardClientesComponent } from '../sections/dashboard-clientes/dashboard-clientes.component';
import { DashboardAlertasComponent }  from '../sections/dashboard-alertas/dashboard-alertas.component';
 
export type DashPeriod = '7d' | '30d' | '90d' | 'all';

@Component({
  selector: 'app-dashboard-shell',
  standalone: true,
  imports: [
    CommonModule,
    DashboardKpisComponent,
    DashboardFinancieroComponent,
    DashboardRecetasComponent,
    DashboardClientesComponent,
    DashboardAlertasComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(8px)' }),
        animate('220ms ease-out', style({ opacity: 1, transform: 'none' })),
      ]),
    ]),
    trigger('sectionsIn', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(12px)' }),
          stagger(60, animate('240ms ease-out', style({ opacity: 1, transform: 'none' }))),
        ], { optional: true }),
      ]),
    ]),
  ],
  templateUrl: './dashboard-shell.component.html',
  styleUrl: './dashboard-shell.component.scss'
})
export class DashboardShellComponent {

   private pedidoService = inject(PedidoService);
 
  // ── ÚNICA CONEXIÓN CON TU SIGNAL ─────────────────────────────────
  readonly allPedidos = computed(() => this.pedidoService.pedidos());
  // ─────────────────────────────────────────────────────────────────
 
  period = signal<DashPeriod>('30d');
 
  periods: { id: DashPeriod; label: string }[] = [
    { id: '7d',  label: '7 días'  },
    { id: '30d', label: '30 días' },
    { id: '90d', label: '90 días' },
    { id: 'all', label: 'Todo'    },
  ];
 
  pedidosFiltrados = computed<Pedido[]>(() => {
    const all = this.allPedidos();
    const p   = this.period();
    if (p === 'all') return all;
    const cutoff = new Date();
    const days = p === '7d' ? 7 : p === '30d' ? 30 : 90;
    cutoff.setDate(cutoff.getDate() - days);
    return all.filter(x => new Date(x.createDay) >= cutoff);
  });
 
  // Alertas inteligentes derivadas del signal
  alertas = computed(() => {
    const pedidos = this.allPedidos();
    const result: { tipo: string; msg: string; nivel: 'danger' | 'warning' | 'info' }[] = [];
    const enCurso = pedidos.filter(p => p.enCurso && !p.cancel);
 
    // Pedidos sin margen
    const sinMargen = pedidos.filter(p => p.profit <= 0 && !p.cancel);
    if (sinMargen.length > 0)
      result.push({ tipo: 'profit', msg: `${sinMargen.length} pedido${sinMargen.length !== 1 ? 's' : ''} sin margen de ganancia`, nivel: 'danger' });
 
    // Costos misceláneos altos (>10% del costo base)
    const miscAltos = pedidos.filter(p => p.cost_base > 0 && p.miscellaneous_cost / p.cost_base > 0.1 && !p.cancel);
    if (miscAltos.length > 0)
      result.push({ tipo: 'misc', msg: `${miscAltos.length} pedido${miscAltos.length !== 1 ? 's' : ''} con costos misceláneos altos (>10%)`, nivel: 'warning' });
 
    // Pedidos vencidos en curso
    const hoy = new Date();
    const vencidos = enCurso.filter(p => new Date(p.dayDue) < hoy);
    if (vencidos.length > 0)
      result.push({ tipo: 'vencido', msg: `${vencidos.length} pedido${vencidos.length !== 1 ? 's' : ''} vencido${vencidos.length !== 1 ? 's' : ''} sin completar`, nivel: 'danger' });
 
    return result;
  });
 
  greeting = computed(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días ☀️';
    if (h < 18) return 'Buenas tardes 🌤';
    return 'Buenas noches 🌙';
  });

}
