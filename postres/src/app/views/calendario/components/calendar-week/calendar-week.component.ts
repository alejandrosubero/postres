// calendar-week/calendar-week.component.ts
// Vista semanal: 7 columnas, cada día muestra lista simple de pedidos.
import {
  Component, ChangeDetectionStrategy, input, output, computed, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { Pedido } from '../../../../models/pedido.model';

interface WeekDay {
  date: Date;
  isToday: boolean;
  pedidos: Pedido[];
}

@Component({
   selector: 'app-calendar-week',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('wslide', [
      transition(':increment', [
        style({ opacity: 0, transform: 'translateX(28px)' }),
        animate('240ms cubic-bezier(0.4,0,0.2,1)', style({ opacity: 1, transform: 'none' })),
      ]),
      transition(':decrement', [
        style({ opacity: 0, transform: 'translateX(-28px)' }),
        animate('240ms cubic-bezier(0.4,0,0.2,1)', style({ opacity: 1, transform: 'none' })),
      ]),
    ]),
  ],
  templateUrl: './calendar-week.component.html',
  styleUrl: './calendar-week.component.scss'
})
export class CalendarWeekComponent {

  pedidos      = input.required<Pedido[]>();
  focusDate    = input.required<Date>();
  dateSelected = output<Date>();
 
  selectedDate = signal<Date>(new Date());
  slideKey     = signal(0);
  private touchX = 0;
 
  readonly MONTHS_ES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  readonly WDAYS = ['D','L','M','X','J','V','S'];
  readonly WDAYS_FULL = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
 
  weekStart = computed(() => {
    const d = new Date(this.focusDate());
    d.setDate(d.getDate() - d.getDay()); // Sunday
    d.setHours(0,0,0,0);
    return d;
  });
 
  weekLabel = computed(() => {
    const s = this.weekStart();
    const e = new Date(s); e.setDate(s.getDate() + 6);
    return `${s.getDate()} ${this.MONTHS_ES[s.getMonth()]} – ${e.getDate()} ${this.MONTHS_ES[e.getMonth()]}`;
  });
 
  weekDays = computed<WeekDay[]>(() => {
    const start = this.weekStart();
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start); date.setDate(start.getDate() + i);
      return {
        date,
        isToday: date.toDateString() === today.toDateString(),
        pedidos: this.pedidos().filter(p => new Date(p.dayDue).toDateString() === date.toDateString()),
      };
    });
  });
 
  selectedDayPedidos = computed(() => {
    const sel = this.selectedDate();
    return this.pedidos().filter(p => new Date(p.dayDue).toDateString() === sel.toDateString());
  });
 
  selectedDateLabel = computed(() => {
    const d = this.selectedDate();
    return `${this.WDAYS_FULL[d.getDay()]}, ${d.getDate()} ${this.MONTHS_ES[d.getMonth()]}`;
  });
 
  onTap(wd: WeekDay) {
    this.selectedDate.set(wd.date);
    this.dateSelected.emit(wd.date);
  }
 
  isSelected(date: Date) { return this.selectedDate().toDateString() === date.toDateString(); }
  dayLetter(date: Date)  { return this.WDAYS[date.getDay()]; }
 
  prev() { const d = new Date(this.focusDate()); d.setDate(d.getDate()-7); this.dateSelected.emit(d); this.slideKey.update(v=>v-1); }
  next() { const d = new Date(this.focusDate()); d.setDate(d.getDate()+7); this.dateSelected.emit(d); this.slideKey.update(v=>v+1); }
 
  cardTap(p: Pedido) { this.dateSelected.emit(this.selectedDate()); }
 
  ts(e: TouchEvent) { this.touchX = e.touches[0].clientX; }
  te(e: TouchEvent) {
    const delta = e.changedTouches[0].clientX - this.touchX;
    if (Math.abs(delta) > 55) delta < 0 ? this.next() : this.prev();
  }
 
  trackById(_: number, p: Pedido) { return p.id; }


  // Dentro de CalendarWeekComponent
hasPriority(pedidos: Pedido[]): boolean {
  return pedidos.some(p => p.ispriority);
}


}
