import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class IdGeneratorService {

  /**
   * Genera un ID único basado en el estándar UUID v4
   * Ejemplo de salida: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
   */
  generateId(): string {
    return uuidv4();
  }
}


// use explain:
// import { inject } from '@angular/core';
// import { IdGeneratorService } from './services/id-generator.service';

// // ... dentro de tu componente donde creas el cliente
// private idService = inject(IdGeneratorService);

// crearNuevoCliente() {
//   const nuevoCliente: Customer = {
//     id: this.idService.generateId(), // Genera el ID único aquí
//     name: "Juan Pérez",
//     phoneNumber: 123456789,
//     address: "Calle Falsa 123",
//     notas: ""
//   };
  
//   // Ahora puedes guardar este objeto con su ID asignado
// }