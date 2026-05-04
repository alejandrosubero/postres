// sections/dashboard-clientes/dashboard-clientes.component.ts
import {Component, ChangeDetectionStrategy, input, computed, ViewChild, ElementRef, AfterViewInit, effect,OnChanges, SimpleChanges} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pedido } from '../../../../models/pedido.model';
 
declare const ApexCharts: any;
 
interface ClienteStat {
  id: string;
  nombre: string;
  totalPedidos: number;
  totalIngresos: number;
  totalProfit: number;
  pctIngresos: number;      // % sobre total
  acumulado: number;        // % acumulado (Pareto)
  esPareto: boolean;        // está en el 80%
}

@Component({
 selector: 'app-dashboard-clientes',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard-clientes.component.html',
  styleUrl: './dashboard-clientes.component.scss'
})
export class DashboardClientesComponent  implements AfterViewInit, OnChanges {
  @ViewChild('cliChart') cliRef!: ElementRef;
 
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
    this.buildChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['pedidos'] && this.ready) {
      this.buildChart();
    }
  }


 
  clientes = computed<ClienteStat[]>(() => {
    const map = new Map<string, ClienteStat>();
    const activos = this.pedidos().filter(p => !p.cancel && p.customer);
 
    activos.forEach(p => {
      const id     = p.customer?.id ?? p.customer?.name ?? 'desconocido';
      const nombre = p.customer?.name ?? 'Cliente desconocido';
      if (!map.has(id)) {
        map.set(id, { id, nombre, totalPedidos: 0, totalIngresos: 0, totalProfit: 0, pctIngresos: 0, acumulado: 0, esPareto: false });
      }
      const c = map.get(id)!;
      c.totalPedidos++;
      c.totalIngresos += p.cost_total ?? 0;
      c.totalProfit   += p.profit ?? 0;
    });
 
    const lista = Array.from(map.values()).sort((a, b) => b.totalIngresos - a.totalIngresos);
    const totalGeneral = lista.reduce((s, c) => s + c.totalIngresos, 0) || 1;
 
    let acum = 0;
    lista.forEach(c => {
      c.pctIngresos = (c.totalIngresos / totalGeneral) * 100;
      acum += c.pctIngresos;
      c.acumulado = acum;
      c.esPareto  = c.acumulado <= 80;
    });
 
    return lista.slice(0, 8);
  });
 
  paretoCount = computed(() => this.clientes().filter(c => c.esPareto).length);
 
  private buildChart() {
    if (!this.cliRef) return;
    const data = this.clientes().slice(0, 6);
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
      plotOptions: { bar: { horizontal: true, borderRadius: 6, barHeight: '55%' } },
      colors: data.map(c => c.esPareto ? '#0a84ff' : '#48484a'),
      series: [{ name: 'Ingresos', data: data.map(c => Math.round(c.totalIngresos)) }],
      xaxis: {
        categories: data.map(c => c.nombre.length > 12 ? c.nombre.substring(0, 12) + '…' : c.nombre),
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
      this.chartInstance = new ApexCharts(this.cliRef.nativeElement, opts);
      this.chartInstance.render();
    }
  }
 
  inicial(nombre: string): string {
    return (nombre || '?').charAt(0).toUpperCase();
  }
 
  fmt(v: number): string {
    if (v >= 1_000_000) return `$${(v/1_000_000).toFixed(1)}M`;
    if (v >= 1_000)     return `$${(v/1_000).toFixed(1)}K`;
    return `$${v.toFixed(0)}`;
  }
}


  

