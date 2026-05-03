// calendar-year/calendar-year.component.ts
// Vista anual: grid 4×3 de mini-calendarios.
// - Navegación por flechas (un año a la vez)
// - Selector/dropdown de años disponibles según pedidos
// - Tap en mes → emite yearMonthSelected → shell cambia a vista Mes
 
import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { Pedido } from '../../../../models/pedido.model';
 
interface MiniMonth {
  year: number;
  month: number;        // 0-based
  label: string;
  totalPedidos: number;
  hasPriority: boolean;
  hasEnCurso: boolean;
  isCurrentMonth: boolean;
  hasPedidos: boolean;
}

@Component({
selector: 'app-calendar-year',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('yearSlide', [
      transition(':increment', [
        style({ opacity: 0, transform: 'translateX(36px)' }),
        animate('260ms cubic-bezier(0.4,0,0.2,1)', style({ opacity: 1, transform: 'none' })),
      ]),
      transition(':decrement', [
        style({ opacity: 0, transform: 'translateX(-36px)' }),
        animate('260ms cubic-bezier(0.4,0,0.2,1)', style({ opacity: 1, transform: 'none' })),
      ]),
    ]),
    trigger('dropdownFade', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-6px) scaleY(0.95)' }),
        animate('180ms ease-out', style({ opacity: 1, transform: 'none' })),
      ]),
      transition(':leave', [
        animate('140ms ease-in', style({ opacity: 0, transform: 'translateY(-4px) scaleY(0.97)' })),
      ]),
    ]),
  ],
  templateUrl: './calendar-year.component.html',
  styleUrl: './calendar-year.component.scss'
})
export class CalendarYearComponent {

 pedidos          = input.required<Pedido[]>();
  focusDate        = input.required<Date>();
  yearMonthSelected = output<Date>(); // shell lo captura y cambia a vista Mes
 
  readonly MONTHS_ES = [
    'Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
  ];
 
  viewYear    = signal<number>(new Date().getFullYear());
  slideKey    = signal(0);
  dropdownOpen = signal(false);
 
  // ── AÑOS DISPONIBLES ──────────────────────────────────────────────
  // Calcula el rango desde el primer pedido hasta el año actual + 1
  availableYears = computed(() => {
    const currentYear = new Date().getFullYear();
    const years = new Set<number>();
 
    // Siempre incluir año actual y adyacentes
    years.add(currentYear - 1);
    years.add(currentYear);
    years.add(currentYear + 1);
 
    // Años de pedidos existentes
    this.pedidos().forEach(p => {
      years.add(new Date(p.dayDue).getFullYear());
    });
 
    return Array.from(years)
      .sort((a, b) => a - b)
      .map(year => ({
        year,
        isCurrentYear: year === currentYear,
        totalPedidos: this.pedidos().filter(p => new Date(p.dayDue).getFullYear() === year).length,
      }));
  });
 
  canGoPrev = computed(() => {
    const minYear = Math.min(...this.availableYears().map(y => y.year));
    return this.viewYear() > minYear;
  });
 
  canGoNext = computed(() => {
    const maxYear = Math.max(...this.availableYears().map(y => y.year));
    return this.viewYear() < maxYear;
  });
 
  // ── MESES DEL AÑO VISIBLE ─────────────────────────────────────────
  months = computed<MiniMonth[]>(() => {
    const year    = this.viewYear();
    const today   = new Date();
    const allPedidos = this.pedidos();
 
    return this.MONTHS_ES.map((label, month) => {
      const monthPedidos = allPedidos.filter(p => {
        const d = new Date(p.dayDue);
        return d.getFullYear() === year && d.getMonth() === month;
      });
 
      return {
        year,
        month,
        label: label.substring(0, 3), // "Ene", "Feb"...
        totalPedidos: monthPedidos.length,
        hasPriority:  monthPedidos.some(p => p.ispriority),
        hasEnCurso:   monthPedidos.some(p => p.enCurso),
        isCurrentMonth: year === today.getFullYear() && month === today.getMonth(),
        hasPedidos: monthPedidos.length > 0,
      };
    });
  });
 
  totalyear = computed(() =>
    this.months().reduce((sum, m) => sum + m.totalPedidos, 0)
  );
 
  mesesConPedidos = computed(() =>
    this.months().filter(m => m.hasPedidos).length
  );
 
  // Genera array de tipos para renderizar hasta 5 puntos por mes
  dotsArray(m: MiniMonth): string[] {
    const pedidosMes = this.pedidos().filter(p => {
      const d = new Date(p.dayDue);
      return d.getFullYear() === m.year && d.getMonth() === m.month;
    }).slice(0, 5);
 
    return pedidosMes.map(p =>
      p.ispriority ? 'priority' : p.enCurso ? 'enCurso' : 'normal'
    );
  }
 
  // ── NAVEGACIÓN ────────────────────────────────────────────────────
  prevYear() {
    if (!this.canGoPrev()) return;
    this.viewYear.update(y => y - 1);
    this.slideKey.update(v => v - 1);
    this.dropdownOpen.set(false);
  }
 
  nextYear() {
    if (!this.canGoNext()) return;
    this.viewYear.update(y => y + 1);
    this.slideKey.update(v => v + 1);
    this.dropdownOpen.set(false);
  }
 
  selectYear(year: number) {
    const prev = this.viewYear();
    this.viewYear.set(year);
    this.slideKey.update(v => year > prev ? v + 1 : v - 1);
    this.dropdownOpen.set(false);
  }
 
  toggleDropdown() {
    this.dropdownOpen.update(v => !v);
  }
 
  // ── TAP EN MES → ir a vista Mes ──────────────────────────────────
  onMonthTap(m: MiniMonth) {
    const date = new Date(m.year, m.month, 1);
    this.yearMonthSelected.emit(date);
  }
 
  trackByMonth(_: number, m: MiniMonth) {
    return `${m.year}-${m.month}`;
  }

}
