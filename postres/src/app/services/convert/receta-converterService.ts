import { Injectable } from '@angular/core';
import { Receta } from '../../models/receta.model';

@Injectable({
  providedIn: 'root'
})
export class RecetaConverterService {

  /**
   * Transforma un objeto Receta a una cadena JSON
   * @param receta Objeto de tipo Receta
   * @returns string en formato JSON
   */
  recetaToJson(receta: Receta): string {
    try {
      return JSON.stringify(receta);
    } catch (error) {
      console.error("Error convirtiendo receta a JSON", error);
      return "";
    }
  }

  /**
   * Transforma una cadena JSON a un objeto de tipo Receta
   * @param jsonString Cadena de texto con el JSON
   * @returns Objeto Receta con la fecha reconstruida
   */
  jsonToReceta(jsonString: string): Receta | null {
    try {
      const data = JSON.parse(jsonString);
      
      // IMPORTANTE: Reconstruir el objeto Date
      // JSON.parse deja las fechas como strings, hay que convertirlas manualmente
      if (data.Date) {
        data.Date = new Date(data.Date);
      }

      return data as Receta;
    } catch (error) {
      console.error("Error parseando JSON a receta", error);
      return null;
    }
  }
}