import { Customer } from "./customer.model";
import { Receta } from "./receta.model";

export interface Pedido{
    
    id?:string;
    name:string;    
    dayDue:Date;
    createDay:Date;
    editDay:Date;
    deliveryDay:Date;
    
    enCurso:boolean;
    confirInventory:boolean;

    pendy:boolean; 
    charges:boolean;
    onPausa:boolean;
    
    on_delivery:boolean;
    delivery:boolean;
    
    cancel:boolean;
    itWasconsume: boolean;
    
    howEndThePedido:string;

    ispriority:boolean;
    wasPriority:boolean;
    
    cost_total:number;
    cost_base:number;
    profit:number;
    profit_Percentage:number;
    delivery_cost:number;
    miscellaneous_cost:number;
    
    recetas: Receta[];
    
    address_Of_delivery:string;
    address_Of_delivery_note:string;
    
    customer:Customer;
    
    pedido:string;
    notas:string;
    note_of_miscellaneous_Cost:string;

   
}