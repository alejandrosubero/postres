import { Injectable } from '@angular/core';
import { Pedido } from '../../models/pedido.model';

@Injectable({
  providedIn: 'root'
})
export class PedidoFilterService {

  filter(pedidos: Pedido[], term: string): Pedido[] {
    
    if (!term || term.length < 2) return pedidos;

    const lowerTerm = term.toLowerCase().trim();

    // 1. Lógica de Rangos de Fecha (rango ...)
    if (lowerTerm.startsWith('rango')) {
      return this.filterByRange(pedidos, lowerTerm);
    }

    // 2. Lógica de Keys Especiales (& o *)
    if (lowerTerm.startsWith('&') || lowerTerm.startsWith('*')) {
      const cleanTerm = lowerTerm.substring(1).trim();
      return this.filterBySpecialKey(pedidos, cleanTerm);
    }

    // 3. Búsqueda por defecto (Nombre o Cliente)
    return pedidos.filter(p => 
      p.name.toLowerCase().includes(lowerTerm) || 
      p.customer.name.toLowerCase().includes(lowerTerm) ||
      p.customer.address.toLowerCase().includes(lowerTerm)
    );
  }

  private filterBySpecialKey(pedidos: Pedido[], key: string): Pedido[] {
    switch (key) {
      case 'cancelado': 
        return pedidos.filter(p => p.cancel);
      case 'completados': 
        return pedidos.filter(p => p.delivery && !p.enCurso && !p.pendy);
      case 'pendiente': case 'por hacer': case 'sin hacer': case 'ongoing': case 'pendientes':
        return pedidos.filter(p => p.pendy);
      case 'en curso': case 'activo':
        return pedidos.filter(p => p.enCurso);
      case 'prioridad': case 'primero':
        return pedidos.filter(p => p.ispriority);
      case 'pausa': case 'detenido':
        return pedidos.filter(p => p.onPausa);
      case 'donacion': case 'gratis': case 'regalo':
        return pedidos.filter(p => !p.charges); // Si charges es true, se cobra. Si es false, es gratis.
      default:
        return pedidos;
    }
  }

  private filterByRange(pedidos: Pedido[], term: string): Pedido[] {
    // Regex para extraer dos fechas: MM/DD/YYYY o DD/MM/YYYY
    const dateRegex = /(\d{1,2}\/\d{1,2}\/\d{4})/g;
    const dates = term.match(dateRegex);

    if (dates && dates.length === 2) {
      const dateStart = new Date(dates[0]).getTime();
      const dateEnd = new Date(dates[1]).getTime();

      // Determinar si buscamos en createDay o dayDue
      const isCreation = term.includes('creacion') || term.includes('rango c');
      
      return pedidos.filter(p => {
        const targetDate = new Date(isCreation ? p.createDay : p.dayDue).getTime();
        return targetDate >= dateStart && targetDate <= dateEnd;
      });
    }
    return pedidos;
  }
}