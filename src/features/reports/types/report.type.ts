export interface Report {
  period: string;
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: { name: string; count: number }[];
  paymentMethods: { method: string; amount: number }[];
}

export interface BackendSalesReport {
  period: string;
  totalSales: number | string;
  totalOrders: number;
  averageOrderValue: number | string;
  topProducts: { name: string; count: number }[];
  paymentMethods: { method: string; amount: number | string }[];
}
