export interface GastoOperativo {
  id?: string;
  cantidad: number;
  descripcion: string;
  fecha: Date;
  year: number;
}

export interface DataObject {
  object: string; // El JSON encriptado
}

// Definimos el tipo del reporte Year -> Total
export type YearReport = Record<number, number>;

