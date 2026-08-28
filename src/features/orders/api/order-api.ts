import { apiClient } from "@/lib/api/axios";
import type { BackendOrder, Order } from "@/features/orders/types/order.type";

const ORDER_ENDPOINT = "/api/v1/orders";

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

export const orderApi = {
  getAll: async () => (await apiClient.get<BackendOrder[]>(ORDER_ENDPOINT)).map(mapOrder),
  getById: async (id: number) => mapOrder(await apiClient.get<BackendOrder>(`${ORDER_ENDPOINT}/${id}`)),
  updateStatus: (id: number, status: string) =>
    apiClient.put<Order>(`${ORDER_ENDPOINT}/${id}/status`, { status }),
  cancel: (id: number) => apiClient.delete(`${ORDER_ENDPOINT}/${id}/cancel`),
};
