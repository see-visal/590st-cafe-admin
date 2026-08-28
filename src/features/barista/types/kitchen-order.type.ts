import type { BackendOrderItem, OrderItem } from "@/features/orders/types/order.type";

export interface KitchenOrder {
  id: number;
  orderId: number;
  orderNumber: string;
  customerName?: string;
  totalAmount?: number;
  status: "CONFIRMED" | "ACCEPTED" | "PREPARING" | "READY" | "CANCELLED" | string;
  assignedBarista?: string;
  items?: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface BackendKitchenOrder {
  id: number;
  orderId: number;
  orderNumber: string;
  customerName?: string;
  totalAmount?: number | string;
  status: string;
  baristaName?: string;
  items?: BackendOrderItem[];
  createdAt: string;
  updatedAt?: string;
}
