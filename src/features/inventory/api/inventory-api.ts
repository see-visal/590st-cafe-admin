import { apiClient } from "@/lib/api/axios";
import type { Inventory } from "@/features/inventory/types/inventory.type";

const INVENTORY_ENDPOINT = "/api/v1/inventory";

export const inventoryApi = {
  getAll: () => apiClient.get<Inventory[]>(`${INVENTORY_ENDPOINT}/stocks`),
  getById: (id: number) => apiClient.get<Inventory>(`${INVENTORY_ENDPOINT}/${id}`),
  adjust: (id: number, quantity: number) =>
    apiClient.post(`${INVENTORY_ENDPOINT}/adjust`, { inventoryId: id, quantity }),
  getLowStock: () => apiClient.get<Inventory[]>(`${INVENTORY_ENDPOINT}/low-stock`),
};
