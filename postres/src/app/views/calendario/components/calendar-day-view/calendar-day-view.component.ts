// calendar-day-view/calendar-day-view.component.ts
// Vista de UN día: lista simple de pedidos con navegación día anterior/siguiente.
import {
  Component, ChangeDetectionStrategy, input, output, computed, inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { Pedido } from '../../../../models/pedido.model';

@Component({
  selector: 'app-calendar-day-view',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('listIn', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(10px)' }),
          stagger(50, animate('200ms ease-out', style({ opacity: 1, transform: 'none' }))),
        ], { optional: true }),
      ]),
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('180ms ease', style({ opacity: 1 })),
      ]),
    ]),
  ],
  templateUrl: './calendar-day-view.component.html',
  styleUrl: './calendar-day-view.component.scss'
})
export class CalendarDayViewComponent {
  pedidos = input.required<Pedido[]>();
  date = input.required<Date>();

  private router = inject(Router);

  countPriority = computed(() => this.pedidos().filter(p => p.ispriority).length);
  countEnCurso = computed(() => this.pedidos().filter(p => p.enCurso && !p.ispriority).length);
  countDelivery = computed(() => this.pedidos().filter(p => p.delivery).length);

  priorityPedidos = computed(() => this.pedidos().filter(p => p.ispriority));
  enCursoPedidos = computed(() => this.pedidos().filter(p => p.enCurso && !p.ispriority));
  restoPedidos = computed(() => this.pedidos().filter(p => !p.ispriority && !p.enCurso));

  navigate(pedido: Pedido) {
    this.router.navigate(['/app/pedido/detail'], { state: { pedido } });
  }

  trackById(_: number, p: Pedido) { return p.id; }
}
