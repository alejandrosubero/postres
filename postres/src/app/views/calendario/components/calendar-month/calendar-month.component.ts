// calendar-month/calendar-month.component.ts
// Vista mensual – indicador: punto + número al lado
import {Component, ChangeDetectionStrategy, input, output, computed, signal,} from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { Pedido } from '../../../../models/pedido.model';
 
export interface MonthDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  pedidos: Pedido[];
}

@Component({
  selector: 'app-calendar-month',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('slide', [
      transition(':increment', [
        style({ opacity: 0, transform: 'translateX(32px)' }),
        animate('260ms cubic-bezier(0.4,0,0.2,1)', style({ opacity: 1, transform: 'none' })),
      ]),
      transition(':decrement', [
        style({ opacity: 0, transform: 'translateX(-32px)' }),
        animate('260ms cubic-bezier(0.4,0,0.2,1)', style({ opacity: 1, transform: 'none' })),
      ]),
    ]),
  ],
  templateUrl: './calendar-month.component.html',
  styleUrl: './calendar-month.component.scss'
})
export class CalendarMonthComponent {

  pedidos   = input.required<Pedido[]>();
  focusDate = input.required<Date>();
  dateSelected = output<Date>();
 
  readonly wdays = ['D','L','M','X','J','V','S'];
  selectedDate = signal<Date | null>(null);
  slideKey = signal(0);
 
  private touchX = 0;
 
  days = computed<MonthDay[]>(() => {
    const ref = this.focusDate();
    const y = ref.getFullYear(), m = ref.getMonth();
    const first = new Date(y, m, 1);
    const last  = new Date(y, m + 1, 0);
    const today = new Date();
    const result: MonthDay[] = [];
 
    // leading
    for (let i = 0; i < first.getDay(); i++) {
      result.push({ date: new Date(y, m, -(first.getDay() - i - 1)), isCurrentMonth: false, isToday: false, pedidos: [] });
    }
    // month days
    for (let d = 1; d <= last.getDate(); d++) {
      const date = new Date(y, m, d);
      result.push({
        date,
        isCurrentMonth: true,
        isToday: date.toDateString() === today.toDateString(),
        pedidos: this.pedidos().filter(p => new Date(p.dayDue).toDateString() === date.toDateString()),
      });
    }
    // trailing
    while (result.length < 42) {
      result.push({ date: new Date(y, m + 1, result.length - last.getDate() - first.getDay() + 1), isCurrentMonth: false, isToday: false, pedidos: [] });
    }
    return result;
  });
 
  onTap(day: MonthDay) {
    if (!day.isCurrentMonth) return;
    this.selectedDate.set(day.date);
    this.dateSelected.emit(day.date);
  }
 
  isSelected(date: Date) {
    const s = this.selectedDate();
    return s ? s.toDateString() === date.toDateString() : false;
  }
 
  ts(e: TouchEvent) { this.touchX = e.touches[0].clientX; }
  te(e: TouchEvent) {
    const delta = e.changedTouches[0].clientX - this.touchX;
    if (Math.abs(delta) < 55) return;
    // swipe handled by shell via focusDate – here we just emit signal change
    this.slideKey.update(v => delta < 0 ? v + 1 : v - 1);
  }
 
  a11y(day: MonthDay) {
    return `${day.date.toLocaleDateString('es-ES')}${day.pedidos.length ? `, ${day.pedidos.length} pedidos` : ''}`;
  }
  trackBy(_: number, d: MonthDay) { return d.date.toISOString(); }
  
// Dentro de CalendarMonthComponent en el archivo .ts
hasPriority(pedidos: Pedido[]): boolean {
  return pedidos.some(p => p.ispriority);
}

hasEnCurso(pedidos: Pedido[]): boolean {
  return !this.hasPriority(pedidos) && pedidos.some(p => p.enCurso);
}


}
