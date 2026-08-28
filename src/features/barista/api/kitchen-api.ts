import { apiClient } from "@/lib/api/axios";
import type {
  BackendKitchenOrder,
  KitchenOrder,
} from "@/features/barista/types/kitchen-order.type";

const KITCHEN_ENDPOINT = "/api/v1/kitchen";

function mapKitchenOrder(raw: BackendKitchenOrder): KitchenOrder {
  return {
    id: raw.id,
    orderId: raw.orderId,
    orderNumber: raw.orderNumber,
    customerName: raw.customerName,
    totalAmount: raw.totalAmount != null ? Number(raw.totalAmount) : undefined,
    status: raw.status,
    assignedBarista: raw.baristaName,
    items: raw.items?.map((item) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      price: Number(item.price),
    })),
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt ?? raw.createdAt,
  };
}

export const kitchenApi = {
  getActiveOrders: async () =>
    (await apiClient.get<BackendKitchenOrder[]>(`${KITCHEN_ENDPOINT}/active-orders`)).map(mapKitchenOrder),
  getQueueItem: async (id: number) =>
    mapKitchenOrder(await apiClient.get<BackendKitchenOrder>(`${KITCHEN_ENDPOINT}/${id}`)),
  accept: (id: number) => apiClient.post(`${KITCHEN_ENDPOINT}/${id}/accept`, {}),
  markPreparing: (id: number) => apiClient.post(`${KITCHEN_ENDPOINT}/${id}/preparing`, {}),
  markReady: (id: number) => apiClient.post(`${KITCHEN_ENDPOINT}/${id}/ready`, {}),
};
