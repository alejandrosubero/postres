import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UnitsService {

  constructor() { }


  convertUnits(cantidad: number, unidadOrigen: string, unidadDestino: string, presentacion: string): number {

    let factorH: number = 1;
    // 1. Manejo de "unit" (Lógica C2 y G2 de tu Excel)
    if (unidadOrigen === "unit" && unidadDestino !== "unit") {
      // Usamos el operador ?? (nullish coalescing) para que si es null, sea 1
      const presentacionCantidad = this.extraerNumero(presentacion) ?? factorH;

      return cantidad * presentacionCantidad;
    }

    if (unidadDestino === "unit") {
      return cantidad;
    }

    // --- SECCIÓN DE SÓLIDOS ---

    // Convertir a KILOGRAMOS (kg)
    if (unidadDestino === "kg") {
      switch (unidadOrigen) {
        case "g": return cantidad / 1000;
        case "kg": return cantidad;
        case "oz": return (cantidad * 28.3495) / 1000;
        case "lb": return (cantidad * 453.592) / 1000;
        default: return 0;
      }
    }

    // Convertir a GRAMOS (g)
    if (unidadDestino === "g") {
      switch (unidadOrigen) {
        case "g": return cantidad;
        case "kg": return cantidad * 1000;
        case "oz": return cantidad * 28.3495;
        case "lb": return cantidad * 453.592;
        default: return 0;
      }
    }

    // Convertir a LIBRAS (lb)
    if (unidadDestino === "lb") {
      switch (unidadOrigen) {
        case "g": return cantidad / 453.592;
        case "kg": return (cantidad * 1000) / 453.592;
        case "oz": return cantidad / 16;
        case "lb": return cantidad;
        default: return 0;
      }
    }

    // 4. Conversión a Onzas (oz)
    if (unidadDestino === "oz") {
      switch (unidadOrigen) {
        case "g": return cantidad / 28.3495;
        case "kg": return (cantidad * 1000) / 28.3495;
        case "oz": return cantidad;
        case "lb": return cantidad * 16;
        default: return 0;
      }
    }

    // --- SECCIÓN DE LÍQUIDOS ---

    // Convertir a MILILITROS (ml)
    if (unidadDestino === "ml") {
      switch (unidadOrigen) {
        case "ml": return cantidad;
        case "l": return cantidad * 1000;
        case "fl oz": return cantidad * 29.5735;
        case "cup": return cantidad * 236.588; // 1 cup = 8 fl oz
        case "tablespoon": return cantidad * 14.7868;
        case "teaspoon": return cantidad * 4.92892;
        default: return 0;
      }
    }

    // Convertir a LITROS (l)
    if (unidadDestino === "l") {
      switch (unidadOrigen) {
        case "ml": return cantidad / 1000;
        case "l": return cantidad;
        case "fl oz": return (cantidad * 29.5735) / 1000;
        default: return 0;
      }
    }

    // Convertir a ONZAS LÍQUIDAS (fl oz)
    if (unidadDestino === "fl oz") {
      switch (unidadOrigen) {
        case "ml": return cantidad / 29.5735;
        case "l": return (cantidad * 1000) / 29.5735;
        case "cup": return cantidad * 8;
        case "tablespoon": return cantidad * 0.5;
        case "teaspoon": return cantidad * 0.166;
        case "fl oz": return cantidad;
        default: return 0;
      }
    }

    // Convertir a TAZAS (cup)
    if (unidadDestino === "cup") {
      switch (unidadOrigen) {
        case "fl oz": return cantidad / 8;
        case "ml": return cantidad / 236.588;
        case "tablespoon": return cantidad / 16;
        case "cup": return cantidad;
        default: return 0;
      }
    }

    return 0; // Si no encuentra la combinación
  }



  extraerNumero(texto: string): number | null {
    if (!texto) return null;

    // Dividimos por el espacio y tomamos la primera parte
    const parteNumerica = texto.split(' ')[0];

    const numero = parseFloat(parteNumerica);

    return isNaN(numero) ? null : numero;
  }





}
