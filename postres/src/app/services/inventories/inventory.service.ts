import { Injectable, inject } from '@angular/core';
import { FirebaseService } from '../data/firebase.service';
import { Pedido } from '../../models/pedido.model';
import { Ingrediente } from '../../models/ingrediente.model';
import { RecetaService } from '../data/receta.service';
import { Receta, RecetaIngredientes } from '../../models/receta.model';


@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private fbService = inject(FirebaseService);
  private recetaService = inject(RecetaService);

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
        const newReserved = ingredienteEnStock.reservedStock += cantidadA_Descontar;

        // Agregamos la promesa al array para ejecución paralela
        tareasDeActualizacion.push(
          this.fbService.editar(idIngrediente, {
            cantidad: nuevaCantidad,
            reservedStock: newReserved
          })
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

  async procesarReducedStockReserved(pedido: Pedido): Promise<void> {
    const mapaConsumoReserved = this.consolidarConsumo(pedido);
    const stockActual = this.fbService.ingredientesSignal();
    const tareasDeActualizacion: Promise<void>[] = [];

    mapaConsumoReserved.forEach((cantidadA_Descontar, idIngrediente) => {
      const ingredienteEnStock = stockActual.find(i => i.id === idIngrediente);

      if (ingredienteEnStock) {
        const newReservedStock = Math.max(0, ingredienteEnStock.reservedStock - cantidadA_Descontar);
        tareasDeActualizacion.push(this.fbService.editar(idIngrediente, { reservedStock: newReservedStock }));
      } else {
        console.warn(`⚠️ El ingrediente ID: ${idIngrediente} no se encontró en el inventario global.`);
      }
    });
    try {
      await Promise.all(tareasDeActualizacion);
    } catch (error) {
      console.error('❌ Error al actualizar el inventario:', error);
      throw error;
    }
  }

//TODO: NO ESTA MUY CLARO QUE SE HAGA LO QYE SE QUIERE QUE ES RETORNAR A STOCK O A RESERVA.
  async cancelReducetoStockReserved(pedido: Pedido): Promise<void> {
    const mapaConsumo = this.consolidarConsumo(pedido);
    const stockActual = this.fbService.ingredientesSignal();
    const tareasDeActualizacion: Promise<void>[] = [];

    mapaConsumo.forEach((cantidadA_Descontar, idIngrediente) => {
      const ingredienteEnStock = stockActual.find(i => i.id === idIngrediente);
      let nuevaCantidad = 0;
      let newReserved = 0;

      if (ingredienteEnStock) {
        if (pedido.itWasconsume) {
          newReserved = Math.max(0, ingredienteEnStock.reservedStock + cantidadA_Descontar);
        } else {
          newReserved = Math.max(0, ingredienteEnStock.reservedStock - cantidadA_Descontar);
          nuevaCantidad = Math.max(0, ingredienteEnStock.cantidad + cantidadA_Descontar);
        }
        // Agregamos la promesa al array para ejecución paralela
        tareasDeActualizacion.push(
          this.fbService.editar(idIngrediente, {
            cantidad: nuevaCantidad,
            reservedStock: newReserved
          })
        );
      } else {
        console.warn(`⚠️ El ingrediente ID: ${idIngrediente} no se encontró en el inventario global.`);
      }
    });
    try {
      await Promise.all(tareasDeActualizacion);
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
          item.reservedStock = item.Cantidad;
          consumos.set(item.idIngrediente, actual + item.Cantidad);
        }
      });
        if(receta.id != undefined){
          this.updateIngrediente(receta, receta.id);
        }
    });
    return consumos;
  }


  private updateIngrediente(receta: Receta, id: string): void {
    if (receta != undefined && receta != null) {
      const recetaCheckList = receta.Lista_ingredientes.filter(ingrediente => ingrediente.reservedStock != null && ingrediente.reservedStock != undefined);
      if (recetaCheckList != undefined && recetaCheckList.length > 0) {
        this.recetaService.editar(id, receta);
      }
    }
  }



}

