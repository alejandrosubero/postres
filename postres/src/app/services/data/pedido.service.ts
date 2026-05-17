
import { Injectable, inject, signal, computed } from '@angular/core';
import { Database, ref, push, set, remove, update, get } from '@angular/fire/database';
import { Pedido } from '../../models/pedido.model';
import { Customer } from '../../models/customer.model'; // Asegura la importación
import { EncryptionService } from '../security/encryption.service';
import { PedidoConverterService } from '../../services/convert/pedido_converter_service';
import { DataObject } from '../../models/dataObject.model';

@Injectable({ providedIn: 'root' })
export class PedidoService {

  private urlKey = 'pedidos/'; 
  private db = inject(Database);
  private converter = inject(PedidoConverterService);
  private encryptionService = inject(EncryptionService);

  private _pedidos = signal<Pedido[]>([]);
  public pedidos = this._pedidos.asReadonly();

  // Nueva Signal para los clientes
  private _customers = signal<Customer[]>([]);
  public customers = this._customers.asReadonly();
  

  public totalPedidos = computed(() => this._pedidos().length);

  async obtenerTodas(): Promise<Pedido[]> {
    const snapshot = await get(ref(this.db, 'pedidos'));
    const data = snapshot.val();

    if (!data) {
      this._pedidos.set([]);
      this._customers.set([]);
      return [];
    }

    const listaPedidos: Pedido[] = Object.keys(data).map(key => {
      const dataObj = data[key] as DataObject;
      const decryptedJson = this.encryptionService.decrypt(dataObj.object);
      const pedido = this.converter.jsonToPedido(decryptedJson);
      return { ...pedido, id: key } as Pedido;
    }).filter((p): p is Pedido => p !== null);

    // 1. Actualizamos la signal de pedidos
    this._pedidos.set(listaPedidos);

    // 2. Extraemos clientes únicos usando un Map para evitar duplicados por ID
    const clientesMap = new Map<string, Customer>();
    listaPedidos.forEach(p => {
      if (p.customer && p.customer.id) {
        clientesMap.set(p.customer.id, p.customer);
      }
    });
    
    // 3. Actualizamos la signal de clientes
    this._customers.set(Array.from(clientesMap.values()));

    // console.log("listaPedidos: ",listaPedidos);
    // console.log("customers: ",this.customers());

    return listaPedidos;
  }

  async guardar(pedido: Pedido) {
    const jsonString = this.converter.pedidoToJson(pedido);
    const encryptedJson = this.encryptionService.encrypt(jsonString);
    const dataObject: DataObject = { object: encryptedJson };

    const nuevoRef = push(ref(this.db, 'pedidos'));
    await set(nuevoRef, dataObject);

    const nuevoPedidoConId = { ...pedido, id: nuevoRef.key || '' };
    this._pedidos.update(actuales => [...actuales, nuevoPedidoConId]);
    
    // Si el cliente es nuevo, lo añadimos a la lista de clientes (opcional)
    if (nuevoPedidoConId.customer) {
        this._customers.update(actuales => {
            const existe = actuales.find(c => c.id === nuevoPedidoConId.customer.id);
            return existe ? actuales : [...actuales, nuevoPedidoConId.customer];
        });
    }
  }

  async editar(id: string, data: Partial<Pedido>) {
    const snapshot = await get(ref(this.db, `pedidos/${id}`));
    const currentData = snapshot.val() as DataObject;
    // console.log('EL_PEDIDO editado : ->', currentData);
    const decryptedJson = this.encryptionService.decrypt(currentData.object);
    const currentPedido = this.converter.jsonToPedido(decryptedJson);

    if (currentPedido) {
      const updatedPedido = { ...currentPedido, ...data };
      const updatedJson = this.converter.pedidoToJson(updatedPedido);
      const encryptedJson = this.encryptionService.encrypt(updatedJson);

      await update(ref(this.db, `pedidos/${id}`), { object: encryptedJson });
      await this.obtenerTodas(); // Recargamos para refrescar ambas signals
    }
  }

  async borrar(id: string) {
    await remove(ref(this.db, `pedidos/${id}`));
    this._pedidos.update(actuales => actuales.filter(p => p.id !== id));
    // Opcional: podrías re-evaluar la lista de clientes si es necesario
    await this.obtenerTodas(); 
  }
}

