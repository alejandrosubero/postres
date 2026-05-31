// services/inventario-checker.service.ts
// Servicio puro de lógica — sin UI, reutilizable en cualquier componente.
// Recibe recetas + cantidades, cruza contra el inventario del FirebaseService
// y devuelve: recetas posibles, faltantes y lista de compra.

import { Injectable, inject, computed } from '@angular/core';
import { FirebaseService } from '../data/firebase.service';
import { Ingrediente } from '../../models/ingrediente.model';
import { Receta, RecetaIngredientes } from '../../models/receta.model';
import { UnitsService } from '../convert/units.service';
import { Pedido } from '../../models/pedido.model';

// ── TIPOS PÚBLICOS ────────────────────────────────────────────────────────────

/** Una receta + cuántas unidades se quieren verificar */
export interface RecetaConCantidad {
    receta: Receta;
    cantidad: number;   // cuántas veces se quiere preparar esa receta
}

/** Resultado de un ingrediente individual dentro del análisis */
export interface IngredienteResultado {
    idIngrediente: string;
    nombre: string;
    requerido: number;       // total requerido para todas las recetas
    disponible: number;      // cuánto hay en inventario
    faltante: number;        // requerido - disponible (0 si alcanza)
    alcanza: boolean;

    // Para la lista de compra
    presentacion: string;    // "kg", "litro", "unidad", etc.
    unidadOfPresentacion:string;
    precioPorUnidad: number;
    unidadesNecesarias: number; // faltante expresado en unidades de presentación
    costoEstimado: number;

}

/** Resultado completo del análisis para UN bloque de receta+cantidad */
export interface ResultadoReceta {
    receta: Receta;
    cantidadSolicitada: number;
    cantidadPosible: number;        // cuántas alcanza a hacer con el inventario actual
    puedeCompletarse: boolean;      // cantidadPosible >= cantidadSolicitada
    ingredientes: IngredienteResultado[];
    faltantes: IngredienteResultado[];  // solo los que no alcanzan
}

/** Lista de compra consolidada (varios bloques de recetas combinados) */
export interface ItemListaCompra {
    idIngrediente: string;
    nombre: string;
    presentacion: string;
    cantidadFaltante: number;
    unidadesNecesarias: number;
    precioPorUnidad: number;
    costoEstimado: number;
}

export interface ResultadoAnalisis {
    resultados: ResultadoReceta[];
    listaCompra: ItemListaCompra[];       // consolidada sin duplicados
    costoTotalCompra: number;
    todoAlcanza: boolean;
}

export interface EntradaReceta {
  uid: string;
  receta: Receta | null;
  cantidad: number;
  maximoPosible: number;
}

// ─────────────────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class InventarioCheckerService {

    private firebase = inject(FirebaseService);
    private unitsService = inject(UnitsService);

    // Acceso directo al signal del inventario
    private inventario = computed(() => this.firebase.ingredientesSignal());

    /**
     * Método principal — recibe lista de RecetaConCantidad y devuelve el análisis.
     * Es un método puro (no signal): retorna un objeto, no necesita suscripción.
     * Ideal para llamarlo desde un computed() en el componente o directamente.
     */
    analizar(solicitudes: RecetaConCantidad[]): ResultadoAnalisis {

        const inv = this.inventario();
        const resultados: ResultadoReceta[] = [];

        for (const solicitud of solicitudes) {
            const resultado = this.analizarReceta(solicitud.receta, solicitud.cantidad, inv);
            resultados.push(resultado);
        }

        const listaCompra = this.consolidarListaCompra(resultados);
        const costoTotalCompra = listaCompra.reduce((s, i) => s + i.costoEstimado, 0);
        const todoAlcanza = resultados.every(r => r.puedeCompletarse);

        return { resultados, listaCompra, costoTotalCompra, todoAlcanza };
    }


/**
   * Toma un Pedido, extrae sus recetas y ejecuta el análisis de inventario de forma directa.
   */
  analizarPedido(pedido: Pedido): ResultadoAnalisis | null {
    if (!pedido || !pedido.recetas || pedido.recetas.length === 0) {
      console.warn('El pedido no contiene recetas para analizar.');
      return null;
    }

    // 1. Convertimos las recetas del pedido al formato que espera tu método analizar()
    // Nota: Como el modelo Receta no tiene un campo 'cantidad' explícito en tu interfaz, 
    // asumimos que cada objeto en el array representa 1 unidad, o puedes mapearlo según tu lógica.
    const solicitudes: RecetaConCantidad[] = pedido.recetas.map(receta => ({
      receta: receta,
      cantidad: 1 // Si tu modelo maneja cantidades de otra forma, ajústalo aquí
    }));

    // 2. Ejecutamos y retornamos el análisis usando la lógica existente
    return this.analizar(solicitudes);
  }


    /**
     * Versión simplificada: una sola receta.
     * Útil cuando el componente solo maneja una receta a la vez.
     */
    analizarUna(receta: Receta, cantidad: number): ResultadoReceta {
        return this.analizarReceta(receta, cantidad, this.inventario());
    }

    /**
     * Cuántas veces puede prepararse una receta con el inventario actual,
     * sin importar la cantidad solicitada. Útil para mostrar el máximo posible.
     */
    maximoPosible(receta: Receta): number {
        const inventario = this.inventario();
        if (!receta.Lista_ingredientes?.length) return 0;

        const ratios = receta.Lista_ingredientes.map(ri => {
            const ing = this.buscarIngrediente(ri.idIngrediente, ri.Name, inventario);
            if (!ing || ri.Cantidad <= 0) return 0;
            return Math.floor(ing.cantidad / ri.Cantidad);
        });

        return Math.min(...ratios);
    }

    // ── PRIVADOS ────────────────────────────────────────────────────────────────

    private analizarReceta(receta: Receta, cantidadSolicitada: number, inventario: Ingrediente[]): ResultadoReceta {

        const ingredientes: IngredienteResultado[] = [];

        for (const recetaIngrediente of (receta.Lista_ingredientes ?? [])) {
            const ingrediente = this.buscarIngrediente(recetaIngrediente.idIngrediente, recetaIngrediente.Name, inventario);

            const disponible = ingrediente?.cantidad ?? 0;
            let cantidadEnUnidadBase = 0;
            let unidadBaseOfIngrediente = '';
            if(ingrediente != null && ingrediente != undefined){
            // Conversión a unidad base
              unidadBaseOfIngrediente = ingrediente.unidadBase;
              cantidadEnUnidadBase = this.unitsService.convertUnits(recetaIngrediente.Cantidad,recetaIngrediente.presentacion, ingrediente.unidadBase, ingrediente.presentacion );
            }

            const requerido = cantidadEnUnidadBase * cantidadSolicitada;
            const alcanza = disponible >= requerido;
            const faltante = alcanza? 0 : requerido - disponible;
            // const faltante = Math.max(0, requerido - disponible);

            // Calcular cuántas unidades de presentación se necesitan comprar
            const precioPorUnidad = ingrediente?.precioPorUnidad ?? 0;
            const unidadesNecesarias = faltante; // ya está en unidad base
            const costoEstimado = faltante * precioPorUnidad;

            ingredientes.push(
                {
                idIngrediente: recetaIngrediente.idIngrediente ?? '',
                nombre: ingrediente?.nombre ?? recetaIngrediente.Name,
                requerido,
                disponible,
                faltante,
                alcanza,
                presentacion: ingrediente?.presentacion ?? '',
                unidadOfPresentacion: unidadBaseOfIngrediente,
                precioPorUnidad,
                unidadesNecesarias,
                costoEstimado,
            });
        }

        // Calcular cuántas recetas completas pueden hacerse
        const ratios = (receta.Lista_ingredientes ?? []).map(ri => {
            const ing = this.buscarIngrediente(ri.idIngrediente, ri.Name, inventario);
            if (!ing || ri.Cantidad <= 0) return 0;
            return Math.floor(ing.cantidad / ri.Cantidad);
        });

        const cantidadPosible = ratios.length ? Math.min(...ratios) : 0;
        const faltantes = ingredientes.filter(i => !i.alcanza);

        return {
            receta,
            cantidadSolicitada,
            cantidadPosible,
            puedeCompletarse: cantidadPosible >= cantidadSolicitada,
            ingredientes,
            faltantes,
        };
    }

    /** Busca un ingrediente por id primero, luego por nombre como fallback */
    private buscarIngrediente(id: string | undefined, nombre: string, inventario: Ingrediente[] ): Ingrediente | undefined {
       
        if (id) {
            const porId = inventario.find(i => i.id === id);
            if (porId) return porId;
        }
        return inventario.find(i =>
            i.nombre.toLowerCase().trim() === nombre.toLowerCase().trim()
        );
    }

    /** Consolida los faltantes de varios análisis eliminando duplicados */
    private consolidarListaCompra(resultados: ResultadoReceta[]): ItemListaCompra[] {
        
        const map = new Map<string, ItemListaCompra>();

        for (const r of resultados) {
            for (const f of r.faltantes) {
                const key = f.idIngrediente || f.nombre;
                if (map.has(key)) {
                    const existing = map.get(key)!;
                    existing.cantidadFaltante += f.faltante;
                    existing.unidadesNecesarias += f.unidadesNecesarias;
                    existing.costoEstimado += f.costoEstimado;
                } else {
                    map.set(key, {
                        idIngrediente: f.idIngrediente,
                        nombre: f.nombre,
                        presentacion: f.presentacion,
                        cantidadFaltante: f.faltante,
                        unidadesNecesarias: f.unidadesNecesarias,
                        precioPorUnidad: f.precioPorUnidad,
                        costoEstimado: f.costoEstimado,
                    });
                }
            }
        }

        return Array.from(map.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));
    }
}