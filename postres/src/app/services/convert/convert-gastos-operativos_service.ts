import { Injectable } from '@angular/core';
import { GastoOperativo, DataObject } from '../../models/gasto-operativo';

@Injectable({
  providedIn: 'root'
})
export class GastoOperativoConverterService {

  /**
   * Transforma un objeto a una cadena JSON
   * @param  Objeto de tipo GastoOperativo
   * @returns string en formato JSON
   */
  recetaToJson(gasto: GastoOperativo): string {
    try {
      return JSON.stringify(gasto);
    } catch (error) {
      console.error("Error convirtiendo receta a JSON", error);
      return "";
    }
  }

  /**
   * Transforma una cadena JSON a un objeto de tipo GastoOperativo
   * @param jsonString Cadena de texto con el JSON
   * @returns Objeto GastoOperativo con la fecha reconstruida
   */
  jsonToReceta(jsonString: string): GastoOperativo | null {
    try {
      const data = JSON.parse(jsonString);
      
      // IMPORTANTE: Reconstruir el objeto Date
      // JSON.parse deja las fechas como strings, hay que convertirlas manualmente
      if (data.fecha) {
        data.fecha = new Date(data.fecha);
      }

      return data as GastoOperativo;
    } catch (error) {
      console.error("Error parseando JSON a receta", error);
      return null;
    }
  }
}