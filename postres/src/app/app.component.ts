import { Component, effect, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UsuarioService } from './services/security/usuario.service';
import { EncryptionService } from './services/security/encryption.service';
import { FirebaseService } from './services/data/firebase.service';
import { RecetaService } from './services/data/receta.service';
import { DataLoaderService } from './services/data/data-loader.service';
import { PedidoService } from './services/data/pedido.service';
import { Ingrediente } from './models/ingrediente.model';
import { GastoOperativoService } from './services/data/gasto-operativo.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  private fbService = inject(FirebaseService);
  private dataService = inject(DataLoaderService);
  private recetaService = inject(RecetaService);
  private pedidoService = inject(PedidoService);
  private gastoOperativosService = inject(GastoOperativoService);

  private encryptionService = inject(EncryptionService);
  private userSvc = inject(UsuarioService);


  // Accedemos a la lista de ingredientes desde el Signal
  ingredientes = this.fbService.ingredientesSignal;
  title = 'postres';


  constructor() {
    effect(() => {
      console.log("Datos recibidos desde Firebase: ", this.ingredientes());
        this.ingredientes().forEach( ingrediente=>{
          if(ingrediente.reservedStock != null && ingrediente.reservedStock != undefined && ingrediente.reservedStock > 0){
            console.log(`${ingrediente.nombre}:`, ingrediente);
          }
        })



      // this.editIngredientes();
    });
    this.recetaService.obtenerTodas();
    this.pedidoService.obtenerTodas();
    this.userSvc.obtenerTodos();
    this.gastoOperativosService.obtenerTodas();
  }

  ngOnInit() { }


  probarEncrypted() {
    let original = 'Hola Angular 17 🚀';
    let encrypted = '';
    let decrypted = '';

    encrypted = this.encryptionService.encrypt(original);
    decrypted = this.encryptionService.decrypt(encrypted);
    // console.log('original ', original);
    // console.log(' encrypted', encrypted);
    // console.log('decrypted', decrypted);
  }

  // async prueba() {
  //   await this.userSvc.guardar({ nombre: 'as', email: 'a@a.com', rol: 'admin', pass:'123456' });
  // }

  // editIngredientes(){
  //    let ingredientes: Ingrediente[] = this.fbService.ingredientesSignal();
  //     ingredientes.forEach(ingrediente => {
  //       let id = '';
  //       if (ingrediente != undefined && ingrediente.id != null && ingrediente.id != undefined && ingrediente.id != '') {
  //         id = ingrediente.id;
  //         ingrediente.cantidad = 10;
  //         ingrediente.cantidadMinima = 2;
  //         ingrediente.notificar = true;
  //         this.fbService.editar(id, ingrediente);
  //       }
  //     });
  // }

  // cargarenFiverBase(): void {
  //   this.dataService.cargarDataLocal().subscribe({
  //     next: (data) => {
  //       if (data !== null && data !== undefined) {
  //         console.log("DATA .JSOM: ", data);
  //         // Validamos que data y data.ingrediente existan antes de iterar
  //         if (data && data) {
  //           data.forEach(item => this.fbService.guardar(item));
  //         } else {
  //           console.error("El formato del JSON no es el esperado o está vacío");
  //         }
  //       }
  //     },
  //     error: (err) => {
  //       console.error("Error al cargar el archivo JSON, revisa la ruta en assets:", err);
  //     }
  //   });
  // }


}



// ng build --configuration production --base-href="https://tu-usuario-github.github.io/nombre-de-tu-repositorio/"