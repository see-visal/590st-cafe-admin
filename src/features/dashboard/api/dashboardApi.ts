/**
 * Comprehensive Admin Dashboard API Services
 * This file contains all API service methods for admin dashboard features
 */

import { apiClient } from "@/lib/apiClient";

// ==================== TYPES ====================

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

interface BackendOrderItem {
  id: number;
  productId: number;
  productName?: string;
  quantity: number;
  price: number | string;
}

interface BackendOrder {
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

function mapOrder(raw: BackendOrder): Order {
  return {
    id: raw.id,
    orderNumber: raw.orderNumber,
    totalAmount: Number(raw.finalAmount ?? raw.totalAmount ?? 0),
    status: raw.status,
    type: raw.orderType,
    items: (raw.items ?? []).map((item) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      price: Number(item.price),
    })),
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt ?? raw.createdAt,
  };
}

export interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  options?: { [key: string]: string };
}

export interface KitchenOrder {
  id: number;
  orderId: number;
  orderNumber: string;
  customerName?: string;
  totalAmount?: number;
  status: "CONFIRMED" | "ACCEPTED" | "PREPARING" | "READY" | "CANCELLED" | string;
  assignedBarista?: string;
  createdAt: string;
  updatedAt: string;
}

interface BackendKitchenOrder {
  id: number;
  orderId: number;
  orderNumber: string;
  customerName?: string;
  totalAmount?: number | string;
  status: string;
  baristaName?: string;
  createdAt: string;
  updatedAt?: string;
}

function mapKitchenOrder(raw: BackendKitchenOrder): KitchenOrder {
  return {
    id: raw.id,
    orderId: raw.orderId,
    orderNumber: raw.orderNumber,
    customerName: raw.customerName,
    totalAmount: raw.totalAmount != null ? Number(raw.totalAmount) : undefined,
    status: raw.status,
    assignedBarista: raw.baristaName,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt ?? raw.createdAt,
  };
}

export interface Inventory {
  id: number;
  ingredientId: number;
  quantity: number;
  unit: string;
  minStock: number;
  maxStock: number;
  lastUpdated: string;
}

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

export interface Staff {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: "ADMIN" | "MANAGER" | "BARISTA" | "CASHIER" | "DELIVERY_RIDER";
  status: "ACTIVE" | "INACTIVE";
  joinDate: string;
}

export interface StaffCreatePayload {
  name: string;
  email: string;
  phone: string;
  role: Staff["role"];
  username?: string;
  password?: string;
}

interface BackendStaff {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: Staff["role"];
  status: Staff["status"];
  joinDate: string;
}

function mapStaff(raw: BackendStaff): Staff {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    phone: raw.phone || "",
    role: raw.role,
    status: raw.status,
    joinDate: raw.joinDate,
  };
}

interface BackendSalesReport {
  period: string;
  totalSales: number | string;
  totalOrders: number;
  averageOrderValue: number | string;
  topProducts: { name: string; count: number }[];
  paymentMethods: { method: string; amount: number | string }[];
}

function mapSalesReport(raw: BackendSalesReport): Report {
  return {
    period: raw.period,
    totalSales: Number(raw.totalSales),
    totalOrders: raw.totalOrders,
    averageOrderValue: Number(raw.averageOrderValue),
    topProducts: raw.topProducts ?? [],
    paymentMethods: raw.paymentMethods.map((p) => ({
      method: p.method,
      amount: Number(p.amount),
    })),
  };
}

export interface Report {
  period: string;
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: { name: string; count: number }[];
  paymentMethods: { method: string; amount: number }[];
}

export interface DashboardSummary {
  dailySales: number;
  totalOrders: number;
  totalCustomers: number;
  queueItems: number;
  lowStockAlerts: number;
}

export interface Notification {
  id: number;
  userId: number;
  type: string;
  channel: string;
  title: string;
  message: string;
  actionUrl?: string;
  orderId?: number;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

// ==================== ADMIN API SERVICE ====================

const API_BASE = "/api/v1";

export const adminService = {
  // ====== ORDERS ======
  orders: {
    getAll: async () => {
      const data = await apiClient.get<BackendOrder[]>(`${API_BASE}/orders`);
      return data.map(mapOrder);
    },
    getById: async (id: number) => {
      const data = await apiClient.get<BackendOrder>(`${API_BASE}/orders/${id}`);
      return mapOrder(data);
    },
    updateStatus: async (id: number, status: string) =>
      await apiClient.put<Order>(`${API_BASE}/orders/${id}/status`, { status }),
    cancel: async (id: number) => await apiClient.delete(`${API_BASE}/orders/${id}/cancel`),
  },

  // ====== KITCHEN QUEUE ======
  kitchen: {
    getActiveOrders: async () => {
      const data = await apiClient.get<BackendKitchenOrder[]>(`${API_BASE}/kitchen/active-orders`);
      return data.map(mapKitchenOrder);
    },
    getQueueItem: async (id: number) => {
      const data = await apiClient.get<BackendKitchenOrder>(`${API_BASE}/kitchen/${id}`);
      return mapKitchenOrder(data);
    },
    accept: async (id: number) => await apiClient.post(`${API_BASE}/kitchen/${id}/accept`, {}),
    markPreparing: async (id: number) => await apiClient.post(`${API_BASE}/kitchen/${id}/preparing`, {}),
    markReady: async (id: number) => await apiClient.post(`${API_BASE}/kitchen/${id}/ready`, {}),
  },

  // ====== INVENTORY ======
  inventory: {
    getAll: async () => await apiClient.get<Inventory[]>(`${API_BASE}/inventory/stocks`),
    getById: async (id: number) => await apiClient.get<Inventory>(`${API_BASE}/inventory/${id}`),
    adjust: async (id: number, quantity: number) =>
      await apiClient.post(`${API_BASE}/inventory/adjust`, { inventoryId: id, quantity }),
    getLowStock: async () => await apiClient.get<Inventory[]>(`${API_BASE}/inventory/low-stock`),
  },

  // ====== CUSTOMERS ======
  customers: {
    getAll: async () => await apiClient.get<Customer[]>(`${API_BASE}/customer`),
    getById: async (id: number) => await apiClient.get<Customer>(`${API_BASE}/customer/${id}`),
    create: async (data: Omit<Customer, "id" | "createdAt">) =>
      await apiClient.post<Customer>(`${API_BASE}/customer`, data),
    update: async (id: number, data: Partial<Customer>) =>
      await apiClient.put<Customer>(`${API_BASE}/customer/${id}`, data),
    delete: async (id: number) => await apiClient.delete(`${API_BASE}/customer/${id}`),
  },

  // ====== STAFF ======
  staff: {
    getAll: async () => {
      const data = await apiClient.get<BackendStaff[]>(`${API_BASE}/staff`);
      return data.map(mapStaff);
    },
    getById: async (id: number) => {
      const data = await apiClient.get<BackendStaff>(`${API_BASE}/staff/${id}`);
      return mapStaff(data);
    },
    create: async (data: StaffCreatePayload) =>
      mapStaff(await apiClient.post<BackendStaff>(`${API_BASE}/staff`, {
        fullName: data.name,
        email: data.email,
        username: data.username || data.email.split("@")[0],
        password: data.password || "ChangeMe123!",
        phoneNumber: data.phone,
        role: data.role,
      })),
    update: async (id: number, data: Partial<Staff>) =>
      mapStaff(await apiClient.put<BackendStaff>(`${API_BASE}/staff/${id}`, {
        fullName: data.name,
        phoneNumber: data.phone,
        role: data.role,
        status: data.status,
      })),
    delete: async (id: number) => await apiClient.delete(`${API_BASE}/staff/${id}`),
  },

  // ====== REPORTS ======
  reports: {
    sales: async (startDate: string, endDate: string) => {
      const data = await apiClient.get<BackendSalesReport>(
        `${API_BASE}/reports/sales?start=${startDate}&end=${endDate}`
      );
      return mapSalesReport(data);
    },
    orders: async (startDate: string, endDate: string) =>
      await apiClient.get<Report>(`${API_BASE}/reports/orders?start=${startDate}&end=${endDate}`),
    inventory: async () => await apiClient.get<Report>(`${API_BASE}/reports/inventory`),
    export: async (format: "PDF" | "EXCEL") =>
      await apiClient.get(`${API_BASE}/reports/export?format=${format}`),
  },

  // ====== DASHBOARD ======
  dashboard: {
    getSummary: async () => await apiClient.get<DashboardSummary>(`${API_BASE}/dashboard/summary`),
  },

  // ====== PAYMENTS ======
  payments: {
    getById: async (id: number) => await apiClient.get(`${API_BASE}/payments/${id}`),
    getByOrder: async (orderId: number) => await apiClient.get(`${API_BASE}/payments/order/${orderId}`),
    verify: async (id: number) => await apiClient.get(`${API_BASE}/payments/${id}/verify`),
  },

  // ====== NOTIFICATIONS ======
  notifications: {
    getAll: async () => await apiClient.get<Notification[]>(`${API_BASE}/notifications`),
    getUnread: async () => await apiClient.get<Notification[]>(`${API_BASE}/notifications/unread`),
    getUnreadCount: async () => await apiClient.get<number>(`${API_BASE}/notifications/unread/count`),
    markRead: async (id: number) => await apiClient.post(`${API_BASE}/notifications/${id}/read`, {}),
    markAllRead: async () => await apiClient.post(`${API_BASE}/notifications/read-all`, {}),
  },
};
