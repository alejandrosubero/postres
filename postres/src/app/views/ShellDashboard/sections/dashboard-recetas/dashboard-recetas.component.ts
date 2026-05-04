// sections/dashboard-recetas/dashboard-recetas.component.ts
import { Component, ChangeDetectionStrategy, input, computed,ViewChild,OnChanges, SimpleChanges,ElementRef, AfterViewInit, effect,} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pedido } from '../../../../models/pedido.model';
 
declare const ApexCharts: any;
 
interface RecetaStat {
  nombre: string;
  veces: number;
  profitTotal: number;
  profitPromedio: number;
  rank: number;
}


@Component({
selector: 'app-dashboard-recetas',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard-recetas.component.html',
  styleUrl: './dashboard-recetas.component.scss'
})
export class DashboardRecetasComponent  implements AfterViewInit,OnChanges {
  @ViewChild('recChart') recRef!: ElementRef;
 
  pedidos = input.required<Pedido[]>();
 
  private chartInstance: any;
  private ready = false;
 
  // ngAfterViewInit() {
  //   this.ready = true;
  //   this.buildChart();
  //   effect(() => {
  //     const _ = this.pedidos();
  //     if (this.ready) this.buildChart();
  //   });
  // }
 
   ngAfterViewInit() {
    this.ready = true;
    this.buildChart();   // render inicial
  }

   // Se ejecuta cada vez que el @Input pedidos cambia
  ngOnChanges(changes: SimpleChanges) {
    if (changes['pedidos'] && this.ready) {
      this.buildChart();
    }
  }


  
  topRecetas = computed<RecetaStat[]>(() => {
    const map = new Map<string, RecetaStat>();
 
    this.pedidos().filter(p => !p.cancel).forEach(p => {
      const profitPorReceta = p.recetas?.length > 0 ? (p.profit ?? 0) / p.recetas.length : 0;
 
      p.recetas?.forEach(r => {
        const key = r.Name?.trim() || 'Sin nombre';
        if (!map.has(key)) {
          map.set(key, { nombre: key, veces: 0, profitTotal: 0, profitPromedio: 0, rank: 0 });
        }
        const stat = map.get(key)!;
        stat.veces++;
        stat.profitTotal += profitPorReceta;
      });
    });
 
    return Array.from(map.values())
      .map(r => ({ ...r, profitPromedio: r.veces > 0 ? r.profitTotal / r.veces : 0 }))
      .sort((a, b) => b.profitTotal - a.profitTotal)
      .slice(0, 7)
      .map((r, i) => ({ ...r, rank: i + 1 }));
  });
 
  maxProfit = computed(() => Math.max(...this.topRecetas().map(r => r.profitTotal), 1));
 
  barPct(profit: number): number {
    return (profit / this.maxProfit()) * 100;
  }
 
  private buildChart() {
    if (!this.recRef) return;
    const data = this.topRecetas();
    const opts = {
      chart: {
        type: 'bar',
        height: 200,
        background: 'transparent',
        toolbar: { show: false },
        fontFamily: '-apple-system, SF Pro Text, sans-serif',
        animations: { enabled: true, speed: 600 },
      },
      theme: { mode: 'dark' },
      plotOptions: {
        bar: { horizontal: true, borderRadius: 6, barHeight: '60%' },
      },
      colors: ['#30d158'],
      series: [{ name: 'Ganancia total', data: data.map(r => Math.round(r.profitTotal)) }],
      xaxis: {
        categories: data.map(r => r.nombre.length > 14 ? r.nombre.substring(0, 14) + '…' : r.nombre),
        labels: { style: { colors: '#636366', fontSize: '10px' } },
        axisBorder: { show: false },
      },
      yaxis: { labels: { style: { colors: '#8e8e93', fontSize: '10px' } } },
      grid: { borderColor: '#2c2c2e', strokeDashArray: 4, xaxis: { lines: { show: true } }, yaxis: { lines: { show: false } } },
      dataLabels: {
        enabled: true,
        style: { fontSize: '10px', colors: ['#f2f2f7'] },
        formatter: (v: number) => `$${v >= 1000 ? (v/1000).toFixed(1)+'K' : v}`,
      },
      tooltip: { theme: 'dark', y: { formatter: (v: number) => `$${v.toLocaleString('es')}` } },
    };
 
    if (this.chartInstance) {
      this.chartInstance.updateOptions(opts);
    } else {
      this.chartInstance = new ApexCharts(this.recRef.nativeElement, opts);
      this.chartInstance.render();
    }
  }
 
  fmt(v: number): string {
    if (v >= 1_000_000) return `$${(v/1_000_000).toFixed(1)}M`;
    if (v >= 1_000)     return `$${(v/1_000).toFixed(1)}K`;
    return `$${v.toFixed(0)}`;
  }
}
