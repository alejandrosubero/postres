import { Injectable, inject, signal, computed } from '@angular/core';
import { Database, ref, push, set, remove, update, onValue, get } from '@angular/fire/database';
import { Receta } from '../../models/receta.model';
import { EncryptionService } from '../security/encryption.service';
import { RecetaConverterService } from '../convert/receta-converterService';
import { DataObject } from '../../models/dataObject.model';


@Injectable({ providedIn: 'root' })
export class RecetaService {

  private db = inject(Database);
  private converter = inject(RecetaConverterService);
  private encryptionService = inject(EncryptionService);

  // 1. Definimos la Signal privada para manejar el estado interno
  // y una versión pública de solo lectura para los componentes.
  private _recetas = signal<Receta[]>([]);
  public recetas = this._recetas.asReadonly(); // public recetaService = inject(RecetaService); recetaService.recetas()

  // Opcional: Una signal computada para saber cuántas recetas hay
  public totalRecetas = computed(() => this._recetas().length);

  /**
   * public recetaService = inject(RecetaService);
   * this.recetaService.obtenerTodas();
   */
  async obtenerTodas(): Promise<Receta[]> {
    const snapshot = await get(ref(this.db, 'recetas'));
    const data = snapshot.val();

    if (!data) {
      this._recetas.set([]);
      return [];
    }

    const listaRecetas: Receta[] = Object.keys(data).map(key => {
      const dataObj = data[key] as DataObject;
      const decryptedJson = this.encryptionService.decrypt(dataObj.object);
      const receta = this.converter.jsonToReceta(decryptedJson);
      return { ...receta, id: key } as Receta;
    }).filter((r): r is Receta => r !== null);
    this._recetas.set(listaRecetas);
    return listaRecetas;
  }


  /**
     * Convierte Receta a JSON, crea DataObject y guarda en Firebase
     */
  async guardar(receta: Receta) {
    const jsonString = this.converter.recetaToJson(receta);
    const encryptedJson = this.encryptionService.encrypt(jsonString);
    const dataObject: DataObject = { object: encryptedJson };
    const nuevoRef = push(ref(this.db, 'recetas'));
    await set(nuevoRef, dataObject);
    const nuevaRecetaConId = { ...receta, id: nuevoRef.key || '' };
    this._recetas.update(actuales => [...actuales, nuevaRecetaConId]);
  }

  /**
  * Actualiza el objeto JSON en la base de datos
  */
  async editar(id: string, data: Partial<Receta>) {
    const snapshot = await get(ref(this.db, `recetas/${id}`));
    const currentData = snapshot.val() as DataObject;

    const decryptedJson = this.encryptionService.decrypt(currentData.object);
    const currentReceta = this.converter.jsonToReceta(decryptedJson);

    if (currentReceta) {
      const updatedReceta = { ...currentReceta, ...data };

      const updatedJson = this.converter.recetaToJson(updatedReceta);
      const encryptedJson = this.encryptionService.encrypt(updatedJson);

      await update(ref(this.db, `recetas/${id}`), { object: encryptedJson });
      await this.obtenerTodas();
    }
  }


  /**
   * Borra una receta y la elimina de la signal
   */
  async borrar(id: string) {
    await remove(ref(this.db, `recetas/${id}`));
    // Filtramos la signal para remover la receta eliminada de la UI instantáneamente
    this._recetas.update(actuales => actuales.filter(r => r.id !== id));
  }
}

