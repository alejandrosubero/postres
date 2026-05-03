import { Injectable } from '@angular/core';
import { Pedido } from '../../models/pedido.model';

@Injectable({ providedIn: 'root' })
export class PedidoConverterService {

    
  pedidoToJson(pedido: Pedido): string {
    return JSON.stringify(pedido);
  }

  jsonToPedido(jsonString: string): Pedido | null {
    try {
      const data = JSON.parse(jsonString);
      // Reconstruir fechas
      if (data.dayDue) data.dayDue = new Date(data.dayDue);
      if (data.createDay) data.createDay = new Date(data.createDay);
      if (data.editDay) data.editDay = new Date(data.editDay);
       if (data.deliveryDay) data.deliveryDay = new Date(data.deliveryDay); 
      // Reconstruir fechas de recetas si es necesario
      if (data.recetas) {
        data.recetas = data.recetas.map((r: any) => ({ ...r, Date: new Date(r.Date) }));
      }
      return data as Pedido;
    } catch (e) {
      console.error("Error convirtiendo JSON a Pedido", e);
      return null;
    }
  }

}