export interface Receta {
  id?: string
  Name: string
  Date: Date
  Lista_ingredientes: RecetaIngredientes[]
  CostoTotal: number
  instrucciones: string;
  Notes: string[];
  // cantidad?:number;
}


export interface RecetaIngredientes {
  idIngrediente?: string
  Name: string
  Cantidad: number
  presentacion: string;
  Cost: number
}


