export interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  options?: Record<string, string>;
}

export interface Order {
  id: number;
  orderNumber: string;
  customerId?: number;
  totalAmount: number;
  status: string;
  type: "DINE_IN" | "TAKEAWAY" | "DELIVERY";
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface BackendOrderItem {
  id: number;
  productId: number;
  productName?: string;
  quantity: number;
  price: number | string;
}

export interface BackendOrder {
  id: number;
  orderNumber: string;
  orderType: Order["type"];
  status: string;
  totalAmount?: number | string;
  finalAmount?: number | string;
  items?: BackendOrderItem[];
  createdAt: string;
  updatedAt?: string;
}
