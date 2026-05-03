import { Injectable, inject, signal } from '@angular/core';
import { Database, ref, push, set, remove, update, onValue } from '@angular/fire/database';
import { Ingrediente } from '../../models/ingrediente.model';
 

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  private db = inject(Database);
  // Signal para exponer los datos a la UI
  ingredientesSignal = signal<Ingrediente[]>([]);

  constructor() {
    this.escucharCambios();
  }


private escucharCambios() {
  const starCountRef = ref(this.db, 'ingredientes');
  
  onValue(starCountRef, (snapshot) => {
    const data = snapshot.val();
    
    if (data) {
      // AQUÍ ESTÁ LA CLAVE:
      // Convertimos el objeto de Firebase en un Array y guardamos la key como 'id'
      const lista: Ingrediente[] = Object.keys(data).map(key => ({
        ...data[key], // Copiamos todas las propiedades (nombre, precio, etc.)
        id: key       // Agregamos el ID único de Firebase al objeto
      }));
      
      this.ingredientesSignal.set(lista);
    } else {
      this.ingredientesSignal.set([]);
    }
  });
}


  async guardar(ingrediente: Ingrediente) {
    const nuevoRef = push(ref(this.db, 'ingredientes'));
    await set(nuevoRef, ingrediente);
  }

  async editar(id: string, data: Partial<Ingrediente>) {
    await update(ref(this.db, `ingredientes/${id}`), data);
  }

  async borrar(id: string) {
    await remove(ref(this.db, `ingredientes/${id}`));
  }
}

