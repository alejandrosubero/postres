// ══════════════════════════════════════════════════════════════════
//  pedidos-list.component.ts
//  Angular 17 — Standalone Component + Signals + @for control flow
//  Feature: Delivery — Lista de pedidos para reparto
//  UI: iOS Dark · Pure Black · Embossed · iPhone 12 Pro / S23 / iPad
// ══════════════════════════════════════════════════════════════════

import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';

// Angular Material
import { MatCardModule }      from '@angular/material/card';
import { MatCheckboxModule }  from '@angular/material/checkbox';
import { MatButtonModule }    from '@angular/material/button';
import { MatIconModule }      from '@angular/material/icon';
import { MatBadgeModule }     from '@angular/material/badge';
import { MatRippleModule }    from '@angular/material/core';
import { MatTooltipModule }   from '@angular/material/tooltip';
import { MatChipsModule }     from '@angular/material/chips';
import { MatDividerModule }   from '@angular/material/divider';

// Modelos y servicio  ← ajusta la ruta según tu proyecto
import { Pedido }        from '../../models/pedido.model';
import { PedidoService } from '../../services/data/pedido.service';

// ── Tipo auxiliar para el chip de estado ──────────────────────
interface PedidoStatus {
  label:    string;
  cssClass: string;
  icon:     string;
}

@Component({
  selector: 'app-pedidos-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatRippleModule,
    MatTooltipModule,
    MatChipsModule,
    MatDividerModule,
  ],
  templateUrl: './delivery-pedidos-list.component.html',
  styleUrls:   ['./delivery-pedidos-list.component.scss'],
})
export class PedidosListComponent implements OnInit {

  // ── Inyección ─────────────────────────────────────────────────
  private readonly _pedidoService = inject(PedidoService);

  // ── Signal pública readonly del servicio ─────────────────────
  /** Lista de pedidos expuesta por el servicio como signal readonly */
  readonly pedidos = this._pedidoService.pedidos;

  // ── Estado local (signals) ────────────────────────────────────

  /**
   * Set de direcciones seleccionadas vía checkbox.
   * Set garantiza unicidad y acceso O(1).
   */
  readonly selectedAddresses = signal<Set<string>>(new Set<string>());

  /** Array derivado del Set — para iterar en template y construir URL */
  readonly selectedAddressesArray = computed<string[]>(() =>
    Array.from(this.selectedAddresses())
  );

  /** Cantidad de direcciones seleccionadas — badge del FAB */
  readonly selectedCount = computed<number>(() =>
    this.selectedAddresses().size
  );

  /** true cuando hay al menos una dirección seleccionada */
  readonly hasSelections = computed<boolean>(() =>
    this.selectedAddresses().size > 0
  );

  // ── Lifecycle ─────────────────────────────────────────────────
  ngOnInit(): void {
    // El servicio gestiona la carga de pedidos de forma autónoma.
    // Si tu implementación requiere un método explícito de carga, descomenta:
    // this._pedidoService.loadPedidos();
  }

  // ══════════════════════════════════════════════════════════════
  //  CHECKBOX — Selección de direcciones
  // ══════════════════════════════════════════════════════════════

  /** Determina si una dirección está actualmente seleccionada */
  isAddressSelected(address: string): boolean {
    return this.selectedAddresses().has(address);
  }

  /**
   * Toggle de selección de dirección.
   * checked = true  → agrega al Set
   * checked = false → remueve del Set
   */
  onCheckboxChange(address: string, checked: boolean): void {
    this.selectedAddresses.update(current => {
      const next = new Set<string>(current);
      checked ? next.add(address) : next.delete(address);
      return next;
    });
  }

  // ══════════════════════════════════════════════════════════════
  //  GOOGLE MAPS — Lógica de URLs sin API ni librerías externas
  // ══════════════════════════════════════════════════════════════

  private isMobileDevice(): boolean {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
      .test(navigator.userAgent);
  }

  private isIOS(): boolean {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  private isAndroid(): boolean {
    return /Android/i.test(navigator.userAgent);
  }

  // ── URL dirección individual ──────────────────────────────────
  /**
   * iOS     → comgooglemaps://?q=<addr>&zoom=15
   * Android → geo:0,0?q=<addr>
   * Web     → https://www.google.com/maps/search/?api=1&query=<addr>
   */
  buildSingleMapUrl(address: string): string {
    const encoded = encodeURIComponent(address);
    if (this.isIOS())     return `comgooglemaps://?q=${encoded}&zoom=15`;
    if (this.isAndroid()) return `geo:0,0?q=${encoded}`;
    return `https://www.google.com/maps/search/?api=1&query=${encoded}`;
  }

  openSingleMap(address: string, event: Event): void {
    event.stopPropagation();
    if (!address?.trim()) return;
    window.open(this.buildSingleMapUrl(address), '_blank');
  }

  // ── URL multi-parada (FAB) ────────────────────────────────────
  /**
   * iOS     → comgooglemaps://?saddr=<o>&daddr=<d>&waypoints=<w1|w2>
   * Android → https://www.google.com/maps/dir/stop1/stop2/...
   * Web     → https://www.google.com/maps/dir/stop1/stop2/...
   */
  buildMultiStopMapUrl(addresses: string[]): string {
    if (addresses.length === 0) return '';
    if (addresses.length === 1) return this.buildSingleMapUrl(addresses[0]);

    const encoded = addresses.map(a => encodeURIComponent(a));

    if (this.isIOS()) {
      const origin      = encoded[0];
      const destination = encoded[encoded.length - 1];
      const midpoints   = encoded.slice(1, -1);
      let url = `comgooglemaps://?saddr=${origin}&daddr=${destination}`;
      if (midpoints.length > 0) url += `&waypoints=${midpoints.join('%7C')}`;
      return url;
    }

    return `https://www.google.com/maps/dir/${encoded.join('/')}`;
  }

  openMultiStopRoute(): void {
    const addresses = this.selectedAddressesArray();
    if (addresses.length === 0) return;
    window.open(this.buildMultiStopMapUrl(addresses), '_blank');
  }

  // ══════════════════════════════════════════════════════════════
  //  HELPERS DE PRESENTACIÓN
  // ══════════════════════════════════════════════════════════════

  getPedidoStatus(pedido: Pedido): PedidoStatus {
    if (pedido.cancel)      return { label: 'Cancelado',  cssClass: 'status-cancel',   icon: 'cancel'         };
    if (pedido.on_delivery) return { label: 'En Ruta',    cssClass: 'status-delivery', icon: 'local_shipping' };
    if (pedido.delivery)    return { label: 'Entregado',  cssClass: 'status-done',     icon: 'check_circle'   };
    if (pedido.onPausa)     return { label: 'En Pausa',   cssClass: 'status-paused',   icon: 'pause_circle'   };
    if (pedido.pendy)       return { label: 'Pendiente',  cssClass: 'status-pending',  icon: 'pending'        };
    if (pedido.enCurso)     return { label: 'En Curso',   cssClass: 'status-active',   icon: 'autorenew'      };
    return                         { label: 'Sin Estado', cssClass: 'status-default',  icon: 'help_outline'   };
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('es-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency: 'USD',
    }).format(value ?? 0);
  }
}
