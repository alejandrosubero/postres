// sections/dashboard-kpis/dashboard-kpis.component.ts
import {Component, ChangeDetectionStrategy, input, computed,} from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { Pedido } from '../../../../models/pedido.model';
 
interface KpiCard {
  id: string;
  label: string;
  value: string;
  sub: string;
  delta?: string;       // "+12%" o "-5%"
  deltaPositive?: boolean;
  accent: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  icon: string;
}
 
@Component({
  selector: 'app-dashboard-kpis',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('cardsIn', [
      transition(':enter', [
        query('.kpi-card', [
          style({ opacity: 0, transform: 'translateY(10px) scale(0.97)' }),
          stagger(55, animate('220ms ease-out', style({ opacity: 1, transform: 'none' }))),
        ], { optional: true }),
      ]),
    ]),
  ],
  templateUrl: './dashboard-kpis.component.html',
  styleUrl: './dashboard-kpis.component.scss'
})
export class DashboardKpisComponent {
pedidos = input.required<Pedido[]>();
 
  kpis = computed<KpiCard[]>(() => {
    const all = this.pedidos();
    const activos = all.filter(p => !p.cancel);
 
    // ── Margen neto total ──
    const margenTotal = activos.reduce((s, p) => s + (p.profit ?? 0), 0);
 
    // ── Tasa de cancelación ──
    const cancelados = all.filter(p => p.cancel).length;
    const tasaCancel = all.length > 0 ? (cancelados / all.length) * 100 : 0;
 
    // ── Ticket promedio ──
    const ticketProm = activos.length > 0
      ? activos.reduce((s, p) => s + (p.cost_total ?? 0), 0) / activos.length
      : 0;
 
    // ── Entregas pendientes ──
    const entregasPend = activos.filter(p => p.enCurso && !p.delivery).length;
 
    // ── Margen % promedio ──
    const margenPct = activos.length > 0
      ? activos.reduce((s, p) => s + (p.profit_Percentage ?? 0), 0) / activos.length
      : 0;
 
    // ── Lead time promedio (días) ──
    const leadTimes = activos
      .filter(p => p.createDay && p.dayDue)
      .map(p => {
        const diff = new Date(p.dayDue).getTime() - new Date(p.createDay).getTime();
        return diff / (1000 * 60 * 60 * 24);
      });
    const leadProm = leadTimes.length > 0
      ? leadTimes.reduce((s, d) => s + d, 0) / leadTimes.length
      : 0;
 
    // ── Pedidos sin margen ──
    const sinMargen = activos.filter(p => p.profit <= 0).length;
 
    // ── Ingresos totales ──
    const ingresos = activos.reduce((s, p) => s + (p.cost_total ?? 0), 0);
 
    return [
      {
        id: 'margen',
        label: 'Margen neto',
        value: this.fmt(margenTotal),
        sub: `${margenPct.toFixed(1)}% promedio`,
        icon: '💰',
        accent: margenTotal >= 0 ? 'green' : 'red',
        delta: margenTotal >= 0 ? `+${margenPct.toFixed(0)}%` : `${margenPct.toFixed(0)}%`,
        deltaPositive: margenTotal >= 0,
      },
      {
        id: 'ingresos',
        label: 'Ingresos totales',
        value: this.fmt(ingresos),
        sub: `${activos.length} pedido${activos.length !== 1 ? 's' : ''} activos`,
        icon: '📈',
        accent: 'blue',
      },
      {
        id: 'ticket',
        label: 'Ticket promedio',
        value: this.fmt(ticketProm),
        sub: `Lead time: ${leadProm.toFixed(1)} días`,
        icon: '🧾',
        accent: 'purple',
      },
      {
        id: 'entregas',
        label: 'Entregas pend.',
        value: String(entregasPend),
        sub: `${cancelados} cancelado${cancelados !== 1 ? 's' : ''} (${tasaCancel.toFixed(1)}%)`,
        icon: '🚚',
        accent: entregasPend > 0 ? 'yellow' : 'green',
      },
      {
        id: 'sin-margen',
        label: 'Sin ganancia',
        value: String(sinMargen),
        sub: sinMargen > 0 ? 'Pedidos en pérdida o cero' : 'Todo con ganancia ✓',
        icon: '⚠️',
        accent: sinMargen > 0 ? 'red' : 'green',
      },
      {
        id: 'en-curso',
        label: 'En producción',
        value: String(activos.filter(p => p.enCurso).length),
        sub: `${activos.filter(p => p.onPausa).length} en pausa`,
        icon: '⚙️',
        accent: 'blue',
      },
    ];
  });
 
  fmt(v: number): string {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000)     return `$${(v / 1_000).toFixed(1)}K`;
    return `$${v.toFixed(0)}`;
  }

}
