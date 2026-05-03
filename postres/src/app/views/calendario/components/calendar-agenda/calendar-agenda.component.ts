import {
  Component, ChangeDetectionStrategy, input, output, computed, signal,} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { Pedido } from '../../../../models/pedido.model';

interface AgendaGroup {
  date: Date;
  label: string;
  isToday: boolean;
  isTomorrow: boolean;
  pedidos: Pedido[];
}


@Component({
  selector: 'app-calendar-agenda',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('listStagger', [
      transition(':enter', [
        query('.agenda-group', [
          style({ opacity: 0, transform: 'translateY(12px)' }),
          stagger(40, animate('220ms ease-out', style({ opacity: 1, transform: 'none' }))),
        ], { optional: true }),
      ]),
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }), animate('200ms ease', style({ opacity: 1 })),
      ]),
    ]),
  ],
  templateUrl: './calendar-agenda.component.html',
  styleUrl: './calendar-agenda.component.scss'
})
export class CalendarAgendaComponent {
pedidos      = input.required<Pedido[]>();
  focusDate    = input.required<Date>();
  dateSelected = output<Date>();
 
  private router = inject(Router);
 
  filter   = signal<'all'|'priority'|'enCurso'|'delivery'>('all');
  showDays = signal(30);
 
  readonly MONTHS_SHORT = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  readonly WDAYS_FULL   = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
 
  filteredPedidos = computed(() => {
    const f = this.filter();
    const all = this.pedidos();
    if (f === 'priority') return all.filter(p => p.ispriority);
    if (f === 'enCurso')  return all.filter(p => p.enCurso);
    if (f === 'delivery') return all.filter(p => p.delivery);
    return all;
  });
 
  groups = computed<AgendaGroup[]>(() => {
    const ref   = new Date(); ref.setHours(0,0,0,0);
    const limit = new Date(ref); limit.setDate(ref.getDate() + this.showDays());
    const today    = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
 
    // Agrupar pedidos por fecha
    const map = new Map<string, Pedido[]>();
    this.filteredPedidos().forEach(p => {
      const d = new Date(p.dayDue); d.setHours(0,0,0,0);
      if (d < ref || d > limit) return;
      const key = d.toDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    });
 
    // Ordenar por fecha y mapear a grupos
    return Array.from(map.entries())
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([key, pedidos]) => {
        const date = new Date(key);
        return {
          date,
          label: key,
          isToday:    date.toDateString() === today.toDateString(),
          isTomorrow: date.toDateString() === tomorrow.toDateString(),
          pedidos,
        };
      });
  });
 
  // Hay pedidos fuera del rango visible
  canShowMore = computed(() => {
    const ref   = new Date(); ref.setHours(0,0,0,0);
    const limit = new Date(ref); limit.setDate(ref.getDate() + this.showDays());
    return this.filteredPedidos().some(p => {
      const d = new Date(p.dayDue); d.setHours(0,0,0,0);
      return d > limit;
    });
  });
 
  navigate(pedido: Pedido) { 
   this.router.navigate(['/app/pedido/detail'], { state: { pedido } });
   }


  weekday(d: Date)    { return this.WDAYS_FULL[d.getDay()]; }
  monthShort(d: Date) { return this.MONTHS_SHORT[d.getMonth()]; }
 
  trackByDate(_: number, g: AgendaGroup) { return g.label; }
  trackById(_: number, p: Pedido)        { return p.id; }

  // Dentro de la clase CalendarAgendaComponent en calendar-agenda.component.ts
loadMore() {
  this.showDays.update(currentValue => currentValue + 14);
}

}

