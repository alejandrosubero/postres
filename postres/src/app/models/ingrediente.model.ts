export interface Ingrediente {
  id?: string;
  nombre: string;
  presentacion: string;
  precio: number;
  unidadBase: string;
  precioPorUnidad: number;
  categoria: string;
  fechaIngreso: string;
  notas: string;
  cantidad:number;
  notificar:boolean;
  cantidadMinima:number;
}

