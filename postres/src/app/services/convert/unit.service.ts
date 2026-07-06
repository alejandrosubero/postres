import { Injectable, signal } from '@angular/core';

// Definimos un tipo estricto para evitar errores de escritura en el resto de la app
export type MeasurementUnit = 'g' | 'kg' | 'oz' | 'fl_oz' | 'lb' | 'ml' | 'l' | 'unit' | 'cup' | 'tablespoon' | 'teaspoon';

export interface UnitLabel {
  id: MeasurementUnit;
  label: string;      // Nombre amigable para el usuario
  category: 'weight' | 'volume' | 'count' | 'kitchen'; // Opcional: útil si quieres agruparlos en un select
}

@Injectable({
  providedIn: 'root'
})
export class UnitService {

  // 1. Guardamos la lista simple como una señal de solo lectura
  private readonly _units = signal<MeasurementUnit[]>([
    'g', 'kg', 'oz', 'fl_oz', 'lb', 'ml', 'l', 'unit', 'cup', 'tablespoon', 'teaspoon'
  ]);

  // 2. Exponemos la señal para usarla en componentes de manera reactiva
  public readonly units = this._units.asReadonly();

  // 3. Opcional: Lista detallada con etiquetas legibles (ideal para maquetar un <select> en un formulario)
  private readonly _unitsWithLabels = signal<UnitLabel[]>([
    { id: 'g', label: 'Gramos (g)', category: 'weight' },
    { id: 'kg', label: 'Kilogramos (kg)', category: 'weight' },
    { id: 'lb', label: 'Libras (lb)', category: 'weight' },
    { id: 'oz', label: 'Onzas (oz)', category: 'weight' },
    { id: 'ml', label: 'Mililitros (ml)', category: 'volume' },
    { id: 'l', label: 'Litros (l)', category: 'volume' },
    { id: 'fl_oz', label: 'Onzas Líquidas (fl oz)', category: 'volume' },
    { id: 'cup', label: 'Tazas (cup)', category: 'kitchen' },
    { id: 'tablespoon', label: 'Cucharadas (tbsp)', category: 'kitchen' },
    { id: 'teaspoon', label: 'Cucharaditas (tsp)', category: 'kitchen' },
    { id: 'unit', label: 'Unidades (unit)', category: 'count' }
  ]);

  public readonly unitsWithLabels = this._unitsWithLabels.asReadonly();

  constructor() { }

  /**
   * Método tradicional por si necesitas recuperar el array nativo sin señales
   */
  getUnitsList(): MeasurementUnit[] {
    return this._units();
  }
}