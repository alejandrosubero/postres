
import { EncryptionService } from '../security/encryption.service';
import { GastoOperativo, DataObject, YearReport } from '../../models/gasto-operativo';
import { Injectable, inject, signal, computed } from '@angular/core';
import { Database, ref, push, set, remove, update, get } from '@angular/fire/database';
import { GastoOperativoConverterService } from '../convert/convert-gastos-operativos_service';


@Injectable({ providedIn: 'root' })
export class GastoOperativoService {

    // Inyección de dependencias siguiendo el estándar de Angular 17+
    private db = inject(Database);
    private converter = inject(GastoOperativoConverterService);
    private encryptionService = inject(EncryptionService);
    // Definición del estado privado con Signals para reactividad granular
    private _gastosOperativos = signal<GastoOperativo[]>([]);
    // Exposición pública de solo lectura (Encapsulamiento)
    public gastosOperativos = this._gastosOperativos.asReadonly();
    // Signal computada para obtener el total de gastos de forma automática
    public totalGastos = computed(() => this._gastosOperativos().length);
    // Referencia al nodo de la base de datos para evitar errores de dedo
    private readonly DB_NODE = 'gastosOperativos';


    /**
       * 2. SIGNAL COMPUTADA DEL REPORTE ANUAL (La solución reactiva)
       * Utiliza computed para que este valor se recalcule automáticamente
       * cada vez que el valor de 'gastosOperativos' cambie.
       */
    public yearReport = computed<YearReport>(() => {
        const gastos = this._gastosOperativos();

        // Inicializamos el mapa de resultados
        const report: YearReport = {};

        // Iteramos sobre los gastos y acumulamos el total por año.
        gastos.forEach(gasto => {
            const year = gasto.year;
            const cantidad = gasto.cantidad;
            if (report[year] !== undefined) {
                report[year] += cantidad;
            } else {
                report[year] = cantidad;
            } 
        });
        return report;
    });



    /**
     * Obtiene todos los gastos desde Firebase, desencripta y actualiza el estado local.
     * @returns Promise con la lista de gastos procesados
     */
    async obtenerTodas(): Promise<GastoOperativo[]> {
        try {
            const snapshot = await get(ref(this.db, this.DB_NODE));
            const data = snapshot.val();

            if (!data) {
                this._gastosOperativos.set([]);
                return [];
            }

            // Transformación de los datos crudos de Firebase a objetos GastoOperativo
            const listaGastos: GastoOperativo[] = Object.keys(data).map(key => {
                const dataObj = data[key] as DataObject;

                // 1. Desencriptar el JSON string
                const decryptedJson = this.encryptionService.decrypt(dataObj.object);

                // 2. Convertir JSON a Objeto (el conversor reconstruye la fecha)
                const gasto = this.converter.jsonToReceta(decryptedJson);

                // 3. Retornar con el ID de la base de datos
                return gasto ? { ...gasto, id: key } as GastoOperativo : null;
            }).filter((g): g is GastoOperativo => g !== null);

            // Actualizar la señal con la nueva lista
            this._gastosOperativos.set(listaGastos);
            return listaGastos;
        } catch (error) {
            console.error("Error al obtener gastos operativos:", error);
            return [];
        }
    }

    /**
     * Encripta y guarda un nuevo gasto operativo en Firebase.
     * @param gasto Objeto de tipo GastoOperativo
     */
    async guardar(gasto: GastoOperativo): Promise<void> {
        try {
            // 1. Convertir objeto a JSON string
            const jsonString = this.converter.recetaToJson(gasto);
            // 2. Encriptar el string
            const encryptedJson = this.encryptionService.encrypt(jsonString);
            // 3. Envolver en DataObject
            const dataObject: DataObject = { object: encryptedJson };
            // 4. Push a Firebase
            const nuevoRef = push(ref(this.db, this.DB_NODE));
            await set(nuevoRef, dataObject);
            // 5. Actualizar estado local de forma reactiva
            const nuevoGastoConId = { ...gasto, id: nuevoRef.key || '' };
            this._gastosOperativos.update(current => [...current, nuevoGastoConId]);
        } catch (error) {
            console.error("Error al guardar el gasto:", error);
            throw error;
        }
    }

    /**
     * Actualiza un gasto existente aplicando cambios parciales.
     * @param id ID del gasto a modificar
     * @param cambios Objeto con los campos a actualizar
     */
    async actualizar(id: string, cambios: Partial<GastoOperativo>): Promise<void> {
        try {
            // 1. Recuperar el registro actual para no perder datos
            const gastosActuales = this.gastosOperativos().find(g => g.id === id);
            if (!gastosActuales) throw new Error("Gasto no encontrado");
            const gastoActualizado = { ...gastosActuales, ...cambios };
            // 2. Preparar el objeto para Firebase (sin el ID en el cuerpo si no es necesario)
            const { id: _, ...dataToUpdate } = gastoActualizado;
            const encryptedData = this.encryptObject(dataToUpdate);
            await update(ref(this.db, `${this.DB_NODE}/${id}`), { object: encryptedData });
            // 4. Actualizar estado local
            this._gastosOperativos.update(current =>
                current.map(g => g.id === id ? gastoActualizado : g)
            );
        } catch (error) {
            console.error("Error al actualizar el gasto:", error);
            throw error;
        }
    }

    async editar(id: string, data: Partial<GastoOperativo>) {
        const snapshot = await get(ref(this.db, `${this.DB_NODE}/${id}`));
        const currentData = snapshot.val() as DataObject;

        const decryptedJson = this.encryptionService.decrypt(currentData.object);
        const current = this.converter.jsonToReceta(decryptedJson);

        if (current) {
            const updated = { ...current, ...data };
            const updatedJson = this.converter.recetaToJson(updated);
            const encryptedJson = this.encryptionService.encrypt(updatedJson);

            await update(ref(this.db, `${this.DB_NODE}/${id}`), { object: encryptedJson });
            await this.obtenerTodas();
        }
    }

    async borrar(id: string) {
        await remove(ref(this.db, `${this.DB_NODE}/${id}`));
        // Filtramos la signal para remover la receta eliminada de la UI instantáneamente
        this._gastosOperativos.update(actuales => actuales.filter(r => r.id !== id));
    }

    /**
     * Elimina un gasto de la base de datos y del estado local.
     * @param id ID del gasto a eliminar
     */
    async eliminar(id: string): Promise<void> {
        try {
            await remove(ref(this.db, `${this.DB_NODE}/${id}`));
            this._gastosOperativos.update(current => current.filter(g => g.id !== id));
        } catch (error) {
            console.error("Error al eliminar el gasto:", error);
            throw error;
        }
    }

    // Helper privado para mantener la integridad del cifrado en actualizaciones
    private encryptObject(data: any): any {
        const str = JSON.stringify(data);
        return { object: this.encryptionService.encrypt(str) };
    }
}