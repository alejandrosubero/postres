import { Injectable, inject, signal, computed } from '@angular/core';
import { Database, ref, push, set, remove, get, update, child, query, orderByChild, equalTo } from '@angular/fire/database';
import { Usuario } from '../../models/usuario.model';
import { EncryptionService } from '../security/encryption.service';
import { DataObject } from '../../models/dataObject.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService {

  private db = inject(Database);
  private encryptionService = inject(EncryptionService);

  private _usuarios = signal<Usuario[]>([]);
  public usuarios = this._usuarios.asReadonly();

  async obtenerTodos(): Promise<Usuario[]> {
    const snapshot = await get(ref(this.db, 'usuarios'));
    const data = snapshot.val();

    if (!data) {
      this._usuarios.set([]);
      return [];
    }

    const lista: Usuario[] = Object.keys(data).map(key => {
      const dataObj = data[key] as DataObject;
      try {
        const decryptedJson = this.encryptionService.decrypt(dataObj.object);
        const user = JSON.parse(decryptedJson);
        return { ...user, id: key } as Usuario;
      } catch (e) {
        console.error("Error desencriptando usuario", key);
        return null;
      }
    }).filter((u): u is Usuario => u !== null);

    this._usuarios.set(lista);
    return lista;
  }


  async guardar(usuario: Usuario) {
    const encryptedJson = this.encryptionService.encrypt(JSON.stringify(usuario));
    const dataObject: DataObject = { object: encryptedJson };

    const nuevoRef = push(ref(this.db, 'usuarios'));
    await set(nuevoRef, dataObject);
    await this.obtenerTodos(); 
  }


  async editar(id: string, usuario: Usuario) {
    const encryptedJson = this.encryptionService.encrypt(JSON.stringify(usuario));
    await update(ref(this.db, `usuarios/${id}`), { object: encryptedJson });
    await this.obtenerTodos();
  }


  async borrar(id: string) {
    await remove(ref(this.db, `usuarios/${id}`));
    await this.obtenerTodos();
  }





}



// @Injectable({ providedIn: 'root' })
// export class UsuarioService {
//   private db = inject(Database);

//   async guardar(usuario: Usuario) {
//     const nuevoRef = push(ref(this.db, 'usuarios'));
//     await set(nuevoRef, usuario);
//   }

//   async buscarPorId(id: string): Promise<Usuario | null> {
//     const snapshot = await get(child(ref(this.db), `usuarios/${id}`));
//     return snapshot.exists() ? snapshot.val() : null;
//   }

//   // Buscar por nombre (contenido)
//   async buscarPorNombre(nombre: string) {
//     const q = query(ref(this.db, 'usuarios'), orderByChild('nombre'), equalTo(nombre));
//     const snapshot = await get(q);
//     return snapshot.val();
//   }

//   async borrar(id: string) {
//     await remove(ref(this.db, `usuarios/${id}`));
//   }
// }

