
import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
  ElementRef,
  ViewChild,
  AfterViewInit,
  effect,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pedido } from '../../../../models/pedido.model';
import { DashPeriod } from '../../dashboard-shell/dashboard-shell.component';

// Declaración para ApexCharts
declare const ApexCharts: any;

@Component({
  selector: 'app-dashboard-financiero',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard-financiero.component.html',
  styleUrl: './dashboard-financiero.component.scss'
})
export class DashboardFinancieroComponent implements AfterViewInit {

  @ViewChild('barChart') barRef!: ElementRef;
  @ViewChild('pieChart') pieRef!: ElementRef;

  // Inputs reactivos
  pedidos = input.required<Pedido[]>();
  period = input.required<DashPeriod>();

  // Signal simplificada para controlar la vista actual
  public activeChart = signal<'barras' | 'pastel'>('barras');

  private barInstance: any;
  private pieInstance: any;

  constructor() {
    /**
     * Los efectos deben declararse en el constructor.
     * Se disparará cada vez que pedidos, period o activeChart cambien.
     */
    effect(() => {
      // Registramos las dependencias
      this.pedidos();
      this.period();
      this.activeChart();

      // Solo intentamos construir si las referencias del DOM están listas
      if (this.barRef && this.pieRef) {
        this.buildCharts();
      }
    });
  }

  /**
   * Implementación obligatoria de AfterViewInit
   */
  ngAfterViewInit(): void {
    this.buildCharts();
  }

  /**
   * Totales calculados automáticamente basados en la signal de pedidos
   */
  totales = computed(() => {
    const activos = this.pedidos().filter(p => !p.cancel);
    return {
      ingresos: activos.reduce((s, p) => s + (p.cost_total ?? 0), 0),
      costoBase: activos.reduce((s, p) => s + (p.cost_base ?? 0), 0),
      misc: activos.reduce((s, p) => s + (p.miscellaneous_cost ?? 0), 0),
      delivery: activos.reduce((s, p) => s + (p.delivery_cost ?? 0), 0),
      profit: activos.reduce((s, p) => s + (p.profit ?? 0), 0),
    };
  });

  private buildCharts() {
    // Verificamos existencia de elementos antes de renderizar
    if (!this.barRef?.nativeElement || !this.pieRef?.nativeElement) return;
    
    this.buildBar();
    this.buildPie();
  }

  private buildBar() {
    const pedidos = this.pedidos().filter(p => !p.cancel);
    const grupos = this.agruparPorPeriodo(pedidos);

    const opts = {
      chart: {
        type: 'bar',
        height: 240,
        background: 'transparent',
        toolbar: { show: false },
        fontFamily: '-apple-system, SF Pro Text, sans-serif',
        animations: { enabled: true, speed: 500 },
      },
      theme: { mode: 'dark' },
      colors: ['#30d158', '#0a84ff', '#ff3b30'],
      plotOptions: {
        bar: { borderRadius: 6, columnWidth: '60%', dataLabels: { position: 'top' } },
      },
      dataLabels: { enabled: false },
      series: [
        { name: 'Ingresos', data: grupos.map(g => g.ingresos) },
        { name: 'Costo base', data: grupos.map(g => g.costoBase) },
        { name: 'Ganancia', data: grupos.map(g => g.profit) },
      ],
      xaxis: {
        categories: grupos.map(g => g.label),
        labels: { style: { colors: '#636366', fontSize: '10px' } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          style: { colors: '#636366', fontSize: '10px' },
          formatter: (v: number) => `$${v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v.toFixed(0)}`,
        },
      },
      grid: { borderColor: '#2c2c2e', strokeDashArray: 4 },
      legend: {
        position: 'bottom', horizontalAlign: 'center',
        labels: { colors: '#8e8e93' }, fontSize: '11px',
        markers: { size: 5 },
      },
      tooltip: {
        theme: 'dark',
        y: { formatter: (v: number) => `$${v.toLocaleString('es')}` },
      },
    };

    if (this.barInstance) {
      this.barInstance.updateOptions(opts);
    } else {
      this.barInstance = new ApexCharts(this.barRef.nativeElement, opts);
      this.barInstance.render();
    }
  }

  private buildPie() {
    const t = this.totales();
    const opts = {
      chart: {
        type: 'donut',
        height: 240,
        background: 'transparent',
        fontFamily: '-apple-system, SF Pro Text, sans-serif',
        animations: { enabled: true, speed: 500 },
      },
      theme: { mode: 'dark' },
      colors: ['#0a84ff', '#ffd60a', '#ff3b30', '#30d158'],
      series: [t.costoBase, t.misc, t.delivery, t.profit],
      labels: ['Costo base', 'Misceláneos', 'Envíos', 'Ganancia'],
      plotOptions: {
        pie: {
          donut: {
            size: '65%',
            labels: {
              show: true,
              total: {
                show: true,
                label: 'Total',
                color: '#8e8e93',
                fontSize: '12px',
                formatter: (w: any) => {
                  const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
                  return `$${total >= 1000 ? (total / 1000).toFixed(1) + 'K' : total.toFixed(0)}`;
                },
              },
            },
          },
        },
      },
      dataLabels: { enabled: false },
      legend: {
        position: 'bottom', horizontalAlign: 'center',
        labels: { colors: '#8e8e93' }, fontSize: '11px',
        markers: { size: 5 },
      },
      tooltip: {
        theme: 'dark',
        y: { formatter: (v: number) => `$${v.toLocaleString('es')}` },
      },
      stroke: { colors: ['#1c1c1e'], width: 2 },
    };

    if (this.pieInstance) {
      this.pieInstance.updateOptions(opts);
    } else {
      this.pieInstance = new ApexCharts(this.pieRef.nativeElement, opts);
      this.pieInstance.render();
    }
  }

  private agruparPorPeriodo(pedidos: Pedido[]) {
    const p = this.period();
    const grupos = new Map<string, { label: string; ingresos: number; costoBase: number; profit: number }>();

    pedidos.forEach(ped => {
      const fecha = new Date(ped.createDay);
      let key: string;

      if (p === '7d') {
        key = fecha.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
      } else if (p === '30d') {
        const semana = Math.ceil(fecha.getDate() / 7);
        key = `Sem ${semana}`;
      } else {
        key = fecha.toLocaleDateString('es-ES', { month: 'short' });
      }

      if (!grupos.has(key)) {
        grupos.set(key, { label: key, ingresos: 0, costoBase: 0, profit: 0 });
      }
      const g = grupos.get(key)!;
      g.ingresos += ped.cost_total ?? 0;
      g.costoBase += ped.cost_base ?? 0;
      g.profit += ped.profit ?? 0;
    });

    return Array.from(grupos.values()).slice(-8);
  }

  fmt(v: number): string {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
    return `$${v.toFixed(0)}`;
  }

  // Método para cambiar la gráfica activa desde el HTML
  setChart(tipo: 'barras' | 'pastel') {
    this.activeChart.set(tipo);
  }
}

// // sections/dashboard-financiero/dashboard-financiero.component.ts
// // Requiere: npm install apexcharts ng-apexcharts
// import {
//   Component, ChangeDetectionStrategy, input, computed,
//   OnChanges, ElementRef, ViewChild, AfterViewInit, effect,
// } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Pedido } from '../../../../models/pedido.model';
// import { DashPeriod } from '../../dashboard-shell/dashboard-shell.component';
 
// // ApexCharts se importa como módulo ESM
// declare const ApexCharts: any;

// sections/dashboard-financiero/dashboard-financiero.component.ts

// @Component({
//   selector: 'app-dashboard-financiero',
//   standalone: true,
//   imports: [CommonModule],
//   changeDetection: ChangeDetectionStrategy.OnPush,
//   templateUrl: './dashboard-financiero.component.html',
//   styleUrl: './dashboard-financiero.component.scss'
// })
// export class DashboardFinancieroComponent implements AfterViewInit {

//   @ViewChild('barChart') barRef!: ElementRef;
//   @ViewChild('pieChart') pieRef!: ElementRef;
 
//   pedidos = input.required<Pedido[]>();
//   period  = input.required<DashPeriod>();
 
//   activeChart = computed(() => this._activeChart());
//   private _activeChart = (() => {
//     const s = { value: 'barras' as 'barras' | 'pastel' };
//     return { (): 'barras' | 'pastel' => s.value, set: (v: 'barras' | 'pastel') => { s.value = v; } };
//   })();
 
//   private barInstance: any;
//   private pieInstance: any;
//   private ready = false;
 


//   ngAfterViewInit() {
//     this.ready = true;
//     this.buildCharts();
 
//     // Escuchar cambios en pedidos
//     effect(() => {
//       const _ = this.pedidos();
//       if (this.ready) this.buildCharts();
//     });
//   }



 
//   totales = computed(() => {
//     const activos = this.pedidos().filter(p => !p.cancel);
//     return {
//       ingresos:  activos.reduce((s, p) => s + (p.cost_total ?? 0), 0),
//       costoBase: activos.reduce((s, p) => s + (p.cost_base ?? 0), 0),
//       misc:      activos.reduce((s, p) => s + (p.miscellaneous_cost ?? 0), 0),
//       delivery:  activos.reduce((s, p) => s + (p.delivery_cost ?? 0), 0),
//       profit:    activos.reduce((s, p) => s + (p.profit ?? 0), 0),
//     };
//   });
 
//   private buildCharts() {
//     if (!this.barRef || !this.pieRef) return;
//     this.buildBar();
//     this.buildPie();
//   }
 
//   private buildBar() {
//     const pedidos = this.pedidos().filter(p => !p.cancel);
 
//     // Agrupar por semana o por día según período
//     const grupos = this.agruparPorPeriodo(pedidos);
 
//     const opts = {
//       chart: {
//         type: 'bar',
//         height: 240,
//         background: 'transparent',
//         toolbar: { show: false },
//         fontFamily: '-apple-system, SF Pro Text, sans-serif',
//         animations: { enabled: true, speed: 500 },
//       },
//       theme: { mode: 'dark' },
//       colors: ['#30d158', '#0a84ff', '#ff3b30'],
//       plotOptions: {
//         bar: { borderRadius: 6, columnWidth: '60%', dataLabels: { position: 'top' } },
//       },
//       dataLabels: { enabled: false },
//       series: [
//         { name: 'Ingresos',   data: grupos.map(g => g.ingresos) },
//         { name: 'Costo base', data: grupos.map(g => g.costoBase) },
//         { name: 'Ganancia',   data: grupos.map(g => g.profit) },
//       ],
//       xaxis: {
//         categories: grupos.map(g => g.label),
//         labels: { style: { colors: '#636366', fontSize: '10px' } },
//         axisBorder: { show: false },
//         axisTicks: { show: false },
//       },
//       yaxis: {
//         labels: {
//           style: { colors: '#636366', fontSize: '10px' },
//           formatter: (v: number) => `$${v >= 1000 ? (v/1000).toFixed(0)+'K' : v.toFixed(0)}`,
//         },
//       },
//       grid: { borderColor: '#2c2c2e', strokeDashArray: 4 },
//       legend: {
//         position: 'bottom', horizontalAlign: 'center',
//         labels: { colors: '#8e8e93' }, fontSize: '11px',
//         markers: { size: 5 },
//       },
//       tooltip: {
//         theme: 'dark',
//         y: { formatter: (v: number) => `$${v.toLocaleString('es')}` },
//       },
//     };
 
//     if (this.barInstance) {
//       this.barInstance.updateOptions(opts);
//     } else {
//       this.barInstance = new ApexCharts(this.barRef.nativeElement, opts);
//       this.barInstance.render();
//     }
//   }
 
//   private buildPie() {
//     const t = this.totales();
//     const opts = {
//       chart: {
//         type: 'donut',
//         height: 240,
//         background: 'transparent',
//         fontFamily: '-apple-system, SF Pro Text, sans-serif',
//         animations: { enabled: true, speed: 500 },
//       },
//       theme: { mode: 'dark' },
//       colors: ['#0a84ff', '#ffd60a', '#ff3b30', '#30d158'],
//       series: [t.costoBase, t.misc, t.delivery, t.profit],
//       labels: ['Costo base', 'Misceláneos', 'Envíos', 'Ganancia'],
//       plotOptions: {
//         pie: {
//           donut: {
//             size: '65%',
//             labels: {
//               show: true,
//               total: {
//                 show: true,
//                 label: 'Total',
//                 color: '#8e8e93',
//                 fontSize: '12px',
//                 formatter: (w: any) => {
//                   const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
//                   return `$${total >= 1000 ? (total/1000).toFixed(1)+'K' : total.toFixed(0)}`;
//                 },
//               },
//             },
//           },
//         },
//       },
//       dataLabels: { enabled: false },
//       legend: {
//         position: 'bottom', horizontalAlign: 'center',
//         labels: { colors: '#8e8e93' }, fontSize: '11px',
//         markers: { size: 5 },
//       },
//       tooltip: {
//         theme: 'dark',
//         y: { formatter: (v: number) => `$${v.toLocaleString('es')}` },
//       },
//       stroke: { colors: ['#1c1c1e'], width: 2 },
//     };
 
//     if (this.pieInstance) {
//       this.pieInstance.updateOptions(opts);
//     } else {
//       this.pieInstance = new ApexCharts(this.pieRef.nativeElement, opts);
//       this.pieInstance.render();
//     }
//   }
 
//   private agruparPorPeriodo(pedidos: Pedido[]) {
//     const p = this.period();
//     const grupos = new Map<string, { label: string; ingresos: number; costoBase: number; profit: number }>();
 
//     pedidos.forEach(ped => {
//       const fecha = new Date(ped.createDay);
//       let key: string;
 
//       if (p === '7d') {
//         key = fecha.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
//       } else if (p === '30d') {
//         // Agrupar por semana del mes
//         const semana = Math.ceil(fecha.getDate() / 7);
//         key = `Sem ${semana}`;
//       } else {
//         key = fecha.toLocaleDateString('es-ES', { month: 'short' });
//       }
 
//       if (!grupos.has(key)) {
//         grupos.set(key, { label: key, ingresos: 0, costoBase: 0, profit: 0 });
//       }
//       const g = grupos.get(key)!;
//       g.ingresos  += ped.cost_total ?? 0;
//       g.costoBase += ped.cost_base ?? 0;
//       g.profit    += ped.profit ?? 0;
//     });
 
//     return Array.from(grupos.values()).slice(-8); // máx 8 grupos
//   }
 
//   fmt(v: number): string {
//     if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
//     if (v >= 1_000)     return `$${(v / 1_000).toFixed(1)}K`;
//     return `$${v.toFixed(0)}`;
//   }
// }
 


