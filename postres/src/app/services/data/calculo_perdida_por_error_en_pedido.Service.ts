import { Injectable, inject } from '@angular/core';
import { Pedido } from '../../models/pedido.model';
import { GastoOperativo } from '../../models/gasto-operativo';
import { GastoOperativoService } from './gasto-operativo.service'; // Ajustar ruta según tu estructura real

@Injectable({
  providedIn: 'root'
})
export class CalculoPerdidaErrorEnPedidoService {


  private readonly gastoOperativoService = inject(GastoOperativoService);

  async procesarErrorPedido(pedido: Pedido, porcentajeError: number): Promise<number> {
  
    const profit = pedido.profit || 0;

    if (porcentajeError <= 100) {
      return profit * (porcentajeError / 100);
    } else {
      const valorTotalPorcentaje = profit * (porcentajeError / 100);
      const cantidadGastoExcedente = valorTotalPorcentaje - profit;
      const pedidoIdDisplay = pedido.id ? pedido.id : 'SIN_ID';

      const nuevoGasto: GastoOperativo = {
        cantidad: cantidadGastoExcedente,
        descripcion: ` ${pedido.name} #${pedido.orderNumber} Gasto por error en la ejecucion de la receta #${pedidoIdDisplay}`,
        fecha: new Date(),
        year: new Date().getFullYear()
      };

      try {
        await this.gastoOperativoService.guardar(nuevoGasto);
      } catch (error) {
        console.error('Error crítico en el guardado del GastoOperativo:', error);
      }
      return 0;
    }
  }


}


