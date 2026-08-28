export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address?: string;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
}

export type CustomerCreatePayload = Omit<Customer, "id" | "createdAt">;
