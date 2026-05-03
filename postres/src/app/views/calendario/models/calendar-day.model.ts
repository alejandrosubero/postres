import { Pedido } from "../../../models/pedido.model";

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  pedidos: Pedido[];
}