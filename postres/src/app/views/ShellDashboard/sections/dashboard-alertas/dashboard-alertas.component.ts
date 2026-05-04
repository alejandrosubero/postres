// sections/dashboard-alertas/dashboard-alertas.component.ts
import {
  Component, ChangeDetectionStrategy, input, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
 
interface Alerta {
  tipo: string;
  msg: string;
  nivel: 'danger' | 'warning' | 'info';
}

@Component({
  selector: 'app-dashboard-alertas',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('alertDismiss', [
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateX(20px)', height: '0', marginBottom: '0' })),
      ]),
    ]),
  ],
  templateUrl: './dashboard-alertas.component.html',
  styleUrl: './dashboard-alertas.component.scss'
})
export class DashboardAlertasComponent {
 alertas = input.required<Alerta[]>();
 
  dismissed = signal<Set<string>>(new Set());
 
  visibles() {
    const d = this.dismissed();
    return this.alertas().filter(a => !d.has(a.tipo));
  }
 
  dismiss(tipo: string) {
    this.dismissed.update(s => new Set([...s, tipo]));
  }
 
  clearAll() {
    this.dismissed.update(() => new Set(this.alertas().map(a => a.tipo)));
  }
 
  icon(nivel: string): string {
    if (nivel === 'danger')  return '🔴';
    if (nivel === 'warning') return '🟡';
    return 'ℹ️';
  }
 
  trackBy(_: number, a: Alerta) { return a.tipo; }


}
