// calendar-shell/calendar-shell.component.ts
// Componente raíz: contiene los 4 tabs y gestiona la vista activa.
// ES EL ÚNICO QUE INYECTA PedidoService.
 
import { Component, ChangeDetectionStrategy,inject, signal,computed,} from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

import { PedidoService } from '../../../../services/data/pedido.service';

import { CalendarMonthComponent } from '../calendar-month/calendar-month.component';
import { CalendarWeekComponent }  from '../calendar-week/calendar-week.component';
import { CalendarDayViewComponent } from '../calendar-day-view/calendar-day-view.component';
import { CalendarAgendaComponent } from '../calendar-agenda/calendar-agenda.component';
import { Pedido } from '../../../../models/pedido.model';
import { CalendarYearComponent } from '../calendar-year/calendar-year.component';
 

 
export type CalendarView = 'year' | 'month' | 'week' | 'day' | 'agenda';
 
const VIEW_ORDER: CalendarView[] = ['year', 'month', 'week', 'day', 'agenda'];



@Component({
   selector: 'app-calendar-shell',
  standalone: true,
  imports: [
    CommonModule,
    CalendarYearComponent,
    CalendarMonthComponent,
    CalendarWeekComponent,
    CalendarDayViewComponent,
    CalendarAgendaComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('viewFade', [
      transition('* => *', [
        style({ opacity: 0, transform: 'translateY(5px)' }),
        animate('190ms cubic-bezier(0.4,0,0.2,1)',
          style({ opacity: 1, transform: 'none' })),
      ]),
    ]),
  ],
  templateUrl: './calendar-shell.component.html',
  styleUrl: './calendar-shell.component.scss'
})
export class CalendarShellComponent {

  private pedidoService = inject(PedidoService);
 
  // ── ÚNICA CONEXIÓN CON TU SIGNAL ──────────────────────────────────
  pedidos = computed(() => this.pedidoService.pedidos());
  // ──────────────────────────────────────────────────────────────────
 
  activeView = signal<CalendarView>('month');
  focusDate  = signal<Date>(new Date());
 
  // 5 tabs
  tabs: { id: CalendarView; label: string }[] = [
    { id: 'year',   label: 'Año'    },
    { id: 'month',  label: 'Mes'    },
    { id: 'week',   label: 'Semana' },
    { id: 'day',    label: 'Día'    },
    { id: 'agenda', label: 'Agenda' },
  ];
 
  readonly MONTHS_ES = [
    'Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
  ];
  readonly DAYS_ES = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
 
  headerLabel = computed(() => {
    const v = this.activeView();
    const d = this.focusDate();
    if (v === 'year')   return `${d.getFullYear()}`;
    if (v === 'month')  return `${this.MONTHS_ES[d.getMonth()]} ${d.getFullYear()}`;
    if (v === 'week')   return `Sem. ${this.isoWeek(d)} · ${d.getFullYear()}`;
    if (v === 'day')    return `${this.DAYS_ES[d.getDay()]}, ${d.getDate()} ${this.MONTHS_ES[d.getMonth()]}`;
    return 'Próximos pedidos';
  });
 
  isToday = computed(() => {
    const t = new Date();
    const d = this.focusDate();
    return d.toDateString() === t.toDateString();
  });
 
  pedidosForDay = computed(() => {
    const d = this.focusDate();
    return this.pedidos().filter(p =>
      new Date(p.dayDue).toDateString() === d.toDateString()
    );
  });
 
  // Indicador deslizante: 5 tabs → 20% cada uno
  indicatorLeft = computed(() => {
    const idx = VIEW_ORDER.indexOf(this.activeView());
    return idx * 20;
  });
 
  setView(v: CalendarView) {
    this.activeView.set(v);
  }
 
  // Tap en día desde Mes o Semana → ir a vista Día
  onDateSelected(date: Date) {
    this.focusDate.set(date);
    if (this.activeView() === 'month' || this.activeView() === 'week') {
      this.activeView.set('day');
    }
  }
 
  // ── CLAVE: tap en mes desde vista Año ─────────────────────────────
  // Recibe el primer día del mes seleccionado,
  // actualiza focusDate y salta a la vista Mes.
  onYearMonthSelected(date: Date) {
    this.focusDate.set(date);
    this.activeView.set('month');
  }
 
  goToday() {
    this.focusDate.set(new Date());
  }
 
  private isoWeek(d: Date): number {
    const date = new Date(d.getTime());
    date.setHours(0,0,0,0);
    date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
    const week1 = new Date(date.getFullYear(), 0, 4);
    return 1 + Math.round(
      ((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7
    );
  }
}
// private pedidoService = inject(PedidoService);
 
//   // ── ÚNICA CONEXIÓN CON TU SIGNAL ──────────────────────────────────
// pedidos = computed(() => this.pedidoService.pedidos());
//   // ──────────────────────────────────────────────────────────────────
 
//   activeView = signal<CalendarView>('month');
//   focusDate  = signal<Date>(new Date());
 
//   tabs: { id: CalendarView; label: string }[] = [
//     { id: 'month',  label: 'Mes'    },
//     { id: 'week',   label: 'Semana' },
//     { id: 'day',    label: 'Día'    },
//     { id: 'agenda', label: 'Agenda' },
//   ];
 
//   MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
//                'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
//   DAYS_ES   = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
 
//   headerLabel = computed(() => {
//     const v = this.activeView();
//     const d = this.focusDate();
//     if (v === 'month')  return `${this.MONTHS_ES[d.getMonth()]} ${d.getFullYear()}`;
//     if (v === 'week')   return `Sem. ${this.isoWeek(d)} · ${d.getFullYear()}`;
//     if (v === 'day')    return `${this.DAYS_ES[d.getDay()]}, ${d.getDate()} ${this.MONTHS_ES[d.getMonth()]}`;
//     return 'Próximos pedidos';
//   });
 
//   isToday = computed(() => {
//     const t = new Date();
//     const d = this.focusDate();
//     return d.toDateString() === t.toDateString();
//   });
 
//   pedidosForDay = computed(() => {
//     const d = this.focusDate();
//     return this.pedidos().filter(p => {
//       const due = new Date(p.dayDue);
//       return due.toDateString() === d.toDateString();
//     });
//   });
 
//   indicatorLeft = computed(() => {
//     const idx = VIEW_ORDER.indexOf(this.activeView());
//     return idx * 25; // 4 tabs → 25% each
//   });
 
//   setView(v: CalendarView) { this.activeView.set(v); }
 
//   onDateSelected(date: Date) {
//     this.focusDate.set(date);
//     // Si estamos en mes o semana, al tocar un día va a la vista día
//     if (this.activeView() === 'month' || this.activeView() === 'week') {
//       this.activeView.set('day');
//     }
//   }
 
//   goToday() { this.focusDate.set(new Date()); }
 
//   private isoWeek(d: Date): number {
//     const date = new Date(d.getTime());
//     date.setHours(0,0,0,0);
//     date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
//     const week1 = new Date(date.getFullYear(), 0, 4);
//     return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
//   }
// }
