import { Injectable, inject } from '@angular/core';
import { FirebaseService } from '../data/firebase.service';
import { Pedido } from '../../models/pedido.model';


@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private fbService = inject(FirebaseService);

  /**
   * Procesa un pedido completo, descuenta el stock de todos los ingredientes
   * involucrados en sus recetas y actualiza la base de datos.
   */
  async procesarDescuentoStock(pedido: Pedido): Promise<void> {
    // 1. Agrupar consumos (Evitamos múltiples escrituras al mismo ID)
    const mapaConsumo = this.consolidarConsumo(pedido);
    
    // 2. Obtener el estado actual del inventario desde el Signal
    const stockActual = this.fbService.ingredientesSignal();

    // 3. Preparar las tareas de actualización
    const tareasDeActualizacion: Promise<void>[] = [];

    mapaConsumo.forEach((cantidadA_Descontar, idIngrediente) => {
      const ingredienteEnStock = stockActual.find(i => i.id === idIngrediente);

      if (ingredienteEnStock) {
        // Calculamos el nuevo stock (Garantizamos que no baje de cero si lo deseas)
        const nuevaCantidad = Math.max(0, ingredienteEnStock.cantidad - cantidadA_Descontar);

        // Agregamos la promesa al array para ejecución paralela
        tareasDeActualizacion.push(
          this.fbService.editar(idIngrediente, { cantidad: nuevaCantidad })
        );
      } else {
        console.warn(`⚠️ El ingrediente ID: ${idIngrediente} no se encontró en el inventario global.`);
      }
    });

    // 4. Ejecutar todas las actualizaciones simultáneamente
    try {
      await Promise.all(tareasDeActualizacion);
      // console.log('✅ Inventario actualizado correctamente tras el pedido.');
    } catch (error) {
      console.error('❌ Error al actualizar el inventario:', error);
      throw error;
    }
  }

  /**
   * Recorre el pedido y suma todas las cantidades de ingredientes repetidos
   * @returns Map<idIngrediente, totalConsumido>
   */
  private consolidarConsumo(pedido: Pedido): Map<string, number> {
    const consumos = new Map<string, number>();

    pedido.recetas.forEach(receta => {
      receta.Lista_ingredientes.forEach(item => {
        if (item.idIngrediente) {
          const actual = consumos.get(item.idIngrediente) || 0;
          // Sumamos la cantidad actual + la cantidad usada en esta receta
          consumos.set(item.idIngrediente, actual + item.Cantidad);
        }
      });
    });

    return consumos;
  }
}