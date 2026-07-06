
// src/app/views/ShellDashboard/sections/dashboard-financiero/dashboard-financiero.component.ts
import {
  Component, ChangeDetectionStrategy, input, computed, ElementRef, ViewChild, AfterViewInit, effect, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pedido } from '../../../../models/pedido.model';
import { GastoOperativo } from '../../../../models/gasto-operativo';
import { DashPeriod } from '../../dashboard-shell/dashboard-shell.component';

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
  @ViewChild('logisticsChart') logisticsRef!: ElementRef;
  @ViewChild('globalBalanceChart') balanceRef!: ElementRef;

  // INPUTS REACTIVOS DESDE EL SHELL
  pedidos = input.required<Pedido[]>();
  gastosOperativos = input.required<GastoOperativo[]>();
  period = input.required<DashPeriod>();

  // Selector de pestañas reactivo
  public activeChart = signal<'barras' | 'pastel' | 'logistica' | 'balance'>('barras');

  private barInstance: any;
  private pieInstance: any;
  private logisticsInstance: any;
  private balanceInstance: any;

  // Bandera de control para evitar ejecuciones prematuras de los efectos
  private isChartsReady = false;

  constructor() {
    /**
     * EFECTO 1: Reacciona de forma automática cuando cambian los datos filtrados del periodo
     */
    effect(() => {
      // Forzamos la lectura reactiva de los inputs de datos
      const _p = this.pedidos();
      const _g = this.gastosOperativos();
      const _per = this.period();

      if (this.isChartsReady) {
        this.updateBarChart();
        this.updatePieChart();
        this.updateLogisticsChart();
        this.updateBalanceChart();
      }
    });

   
    effect(() => {
      const currentTab = this.activeChart();
      
      if (!this.isChartsReady) return;

      // Esperamos un micro-instante (0ms) a que Angular procese los bindings de display en el HTML
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
        
      }, 0);
    });
  }

  ngAfterViewInit(): void {
    // Inicializamos TODOS los gráficos del Dashboard de manera simultánea al cargar la vista
    this.initBarChart();
    this.initPieChart();
    this.initLogisticsChart();
    this.initBalanceChart();

    // Cambiamos el estado de control y disparamos un resize general para asegurar el pintado inicial
    this.isChartsReady = true;
    
    setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
    }, 50);
  }


/**
   * CÁLCULOS FINANCIEROS GLOBALES TOTALMENTE BLINDADOS
   * Mapea de manera segura los datos reactivos para el HTML y los Gráficos.
   */
  public totales = computed(() => {
    const pedidos = this.pedidos() || [];
    const operativos = this.gastosOperativos() || [];

    let ingresos = 0;
    let costoBase = 0;
    let misc = 0;
    let logistica = 0;
    let millas = 0;

    // Acumular costos unitarios por cada pedido activo
    pedidos.forEach(p => {
      if (!p.cancel) {
        ingresos += p.cost_total ?? 0;
        costoBase += p.cost_base ?? 0;
        misc += p.miscellaneous_cost ?? 0;
        logistica += p.delivery_cost ?? 0;
        millas += p.milles_for_delivery ?? 0;
      }
    });

    // Calcular costos de estructura fija (Luz, gas, sueldos fijos, etc.)
    const totalGastosOperativos = operativos.reduce((sum, g) => sum + (g.cantidad ?? 0), 0);
    
    // Egresos globales y Balance neto final
    const egresosTotales = costoBase + misc + logistica + totalGastosOperativos;
    const balanceGlobal = ingresos - egresosTotales;

    return { 
      ingresos, 
      costoBase, 
      misc, 
      logistica, 
      totalGastosOperativos, 
      egresosTotales, 
      balanceGlobal,
      millas,
      costoTotalPedidos: costoBase,           
      gastosOperativos: totalGastosOperativos 
    };
  });

  
  
  public fmt(val: number): string {
    return new Intl.NumberFormat('es-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  }

  private fmtK(val: number): string {
    return val >= 1000 ? `$${(val / 1000).toFixed(1)}K` : `$${val}`;
  }

  // ────────────────────────────────────────────────────────────────────────
  // 1. GRÁFICO DE BARRAS: INGRESOS VS COSTOS
  // ────────────────────────────────────────────────────────────────────────
  private initBarChart() {
    const opts = {
      chart: { type: 'bar', height: 240, toolbar: { show: false }, fontFamily: '-apple-system, sans-serif' },
      theme: { mode: 'dark' },
      plotOptions: { bar: { horizontal: false, columnWidth: '55%', borderRadius: 4 } },
      stroke: { show: true, width: 2, colors: ['transparent'] },
      colors: ['#30d158', '#0a84ff', '#ffd60a'],
      series: [],
      xaxis: { categories: [], labels: { style: { colors: '#636366', fontSize: '10px' } } },
      yaxis: { labels: { style: { colors: '#636366', fontSize: '10px' }, formatter: (v: number) => this.fmtK(v) } },
      grid: { borderColor: '#2c2c2e', strokeDashArray: 4 },
      dataLabels: { enabled: false },
      tooltip: { theme: 'dark', y: { formatter: (v: number) => this.fmt(v) } }
    };
    this.barInstance = new ApexCharts(this.barRef.nativeElement, opts);
    this.barInstance.render();
    this.updateBarChart();
  }

  private updateBarChart() {
    const data = this.agruparPorPeriodo(this.pedidos());
    this.barInstance.updateOptions({
      xaxis: { categories: data.map(d => d.label) },
      series: [
        { name: 'Ingresos', data: data.map(d => Math.round(d.ingresos)) },
        { name: 'Costo Base', data: data.map(d => Math.round(d.costoBase)) },
        { name: 'Misceláneos', data: data.map(d => Math.round(d.misc)) }
      ]
    });
  }

  // ────────────────────────────────────────────────────────────────────────
  // 2. GRÁFICO DE PASTEL: DISTRIBUCIÓN DE GASTOS
  // ────────────────────────────────────────────────────────────────────────
  private initPieChart() {
    const opts = {
      chart: { type: 'donut', height: 240, fontFamily: '-apple-system, sans-serif' },
      theme: { mode: 'dark' },
      colors: ['#0a84ff', '#ffd60a', '#ff9f0a', '#bf5af2'],
      labels: ['Costo Base', 'Misceláneos', 'Logística', 'Gastos Ops'],
      series: [0, 0, 0, 0],
      legend: { position: 'bottom', labels: { colors: '#f2f2f7' } },
      dataLabels: { enabled: true, style: { fontSize: '10px' }, formatter: (val: number) => `${val.toFixed(0)}%` },
      plotOptions: { pie: { donut: { background: 'transparent' } } },
      tooltip: { theme: 'dark', y: { formatter: (v: number) => this.fmt(v) } }
    };
    this.pieInstance = new ApexCharts(this.pieRef.nativeElement, opts);
    this.pieInstance.render();
    this.updatePieChart();
  }

  private updatePieChart() {
    const t = this.totales();
    this.pieInstance.updateSeries([
      Math.round(t.costoBase),
      Math.round(t.misc),
      Math.round(t.logistica),
      Math.round(t.totalGastosOperativos)
    ]);
  }

  // ────────────────────────────────────────────────────────────────────────
  // 3. GRÁFICO DE LOGÍSTICA
  // ────────────────────────────────────────────────────────────────────────
  private initLogisticsChart() {
    const opts = {
      chart: { type: 'area', height: 240, toolbar: { show: false }, fontFamily: '-apple-system, sans-serif' },
      theme: { mode: 'dark' },
      stroke: { curve: 'smooth', width: 2 },
      colors: ['#ff9f0a'],
      series: [],
      xaxis: { categories: [], labels: { style: { colors: '#636366', fontSize: '10px' } } },
      yaxis: { labels: { style: { colors: '#636366', fontSize: '10px' }, formatter: (v: number) => this.fmtK(v) } },
      grid: { borderColor: '#2c2c2e', strokeDashArray: 4 },
      dataLabels: { enabled: false },
      tooltip: { theme: 'dark', y: { formatter: (v: number) => this.fmt(v) } }
    };
    this.logisticsInstance = new ApexCharts(this.logisticsRef.nativeElement, opts);
    this.logisticsInstance.render();
    this.updateLogisticsChart();
  }

  private updateLogisticsChart() {
    const data = this.agruparPorPeriodo(this.pedidos());
    this.logisticsInstance.updateOptions({
      xaxis: { categories: data.map(d => d.label) },
      series: [{ name: 'Costo Logística', data: data.map(d => Math.round(d.logistica)) }]
    });
  }

  // ────────────────────────────────────────────────────────────────────────
  // 4. GRÁFICO DE BALANCE GLOBAL
  // ────────────────────────────────────────────────────────────────────────
  private initBalanceChart() {
    const opts = {
      chart: { type: 'bar', height: 240, toolbar: { show: false }, fontFamily: '-apple-system, sans-serif' },
      theme: { mode: 'dark' },
      colors: ['#bf5af2'],
      series: [],
      plotOptions: { bar: { colors: { ranges: [{ from: -99999999, to: 0, color: '#ff3b30' }] }, columnWidth: '60%', borderRadius: 4 } },
      xaxis: { categories: [], labels: { style: { colors: '#636366', fontSize: '10px' } } },
      yaxis: { labels: { style: { colors: '#636366', fontSize: '10px' }, formatter: (v: number) => this.fmtK(v) } },
      grid: { borderColor: '#2c2c2e', strokeDashArray: 4 },
      dataLabels: { enabled: false },
      tooltip: { theme: 'dark', y: { formatter: (v: number) => this.fmt(v) } }
    };
    this.balanceInstance = new ApexCharts(this.balanceRef.nativeElement, opts);
    this.balanceInstance.render();
    this.updateBalanceChart();
  }

  private updateBalanceChart() {
    const dataPedidos = this.agruparPorPeriodo(this.pedidos());
    const dataGastos = this.agruparGastosPorPeriodo(this.gastosOperativos());

    const todasCategorias = Array.from(new Set([...dataPedidos.map(d => d.key), ...dataGastos.map(g => g.key)]));
    
    todasCategorias.sort((a, b) => a.localeCompare(b)); // Ordenación básica secuencial

    const seriesBalance = todasCategorias.map(cat => {
      const ped = dataPedidos.find(d => d.key === cat);
      const gas = dataGastos.find(g => g.key === cat);

      const ingresos = ped ? ped.ingresos : 0;
      const egresosPedidos = ped ? (ped.costoBase + ped.misc + ped.logistica) : 0;
      const egresosOps = gas ? gas.cantidad : 0;

      return Math.round(ingresos - (egresosPedidos + egresosOps));
    });

    const labelsMap: Record<string, string> = {};
    dataPedidos.forEach(d => labelsMap[d.key] = d.label);
    dataGastos.forEach(g => labelsMap[g.key] = g.label);
    const categoriesLabels = todasCategorias.map(cat => labelsMap[cat] || cat);

    this.balanceInstance.updateOptions({
      xaxis: { categories: categoriesLabels },
      series: [{ name: 'Balance Neto', data: seriesBalance }]
    });
  }

  // ────────────────────────────────────────────────────────────────────────
  // AGRUPADORES DE TEMPOREIDAD (LÓGICA INTERNA)
  // ────────────────────────────────────────────────────────────────────────
  private agruparPorPeriodo(pedidos: Pedido[]) {
    const p = this.period();
    const grupos = new Map<string, { key: string; label: string; ingresos: number; costoBase: number; misc: number; logistica: number }>();

    pedidos.forEach(ped => {
      if (ped.cancel) return;
      const fecha = new Date(ped.createDay);
      let key: string;
      let label: string;

      if (p === '7d') {
        key = fecha.toISOString().split('T')[0];
        label = fecha.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
      } else if (p === '30d') {
        const semana = Math.ceil(fecha.getDate() / 7);
        key = `${fecha.getFullYear()}-W${semana}`;
        label = `Sem ${semana}`;
      } else {
        key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
        label = fecha.toLocaleDateString('es-ES', { month: 'short' });
      }

      if (!grupos.has(key)) {
        grupos.set(key, { key, label, ingresos: 0, costoBase: 0, misc: 0, logistica: 0 });
      }
      const g = grupos.get(key)!;
      g.ingresos += ped.cost_total ?? 0;
      g.costoBase += ped.cost_base ?? 0;
      g.misc += ped.miscellaneous_cost ?? 0;
      g.logistica += ped.delivery_cost ?? 0;
    });

    return Array.from(grupos.values()).sort((a, b) => a.key.localeCompare(b.key));
  }

  private agruparGastosPorPeriodo(gastos: GastoOperativo[]) {
    const p = this.period();
    const grupos = new Map<string, { key: string; label: string; cantidad: number }>();

    gastos.forEach(gas => {
      const fecha = new Date(gas.fecha);
      let key: string;
      let label: string;

      if (p === '7d') {
        key = fecha.toISOString().split('T')[0];
        label = fecha.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
      } else if (p === '30d') {
        const semana = Math.ceil(fecha.getDate() / 7);
        key = `${fecha.getFullYear()}-W${semana}`;
        label = `Sem ${semana}`;
      } else {
        key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
        label = fecha.toLocaleDateString('es-ES', { month: 'short' });
      }

      if (!grupos.has(key)) {
        grupos.set(key, { key, label, cantidad: 0 });
      }
      grupos.get(key)!.cantidad += gas.cantidad ?? 0;
    });

    return Array.from(grupos.values()).sort((a, b) => a.key.localeCompare(b.key));
  }
}
