import { apiClient } from "@/lib/api/axios";
import type {
  Customer,
  CustomerCreatePayload,
} from "@/features/customers/types/customer.type";

const CUSTOMER_ENDPOINT = "/api/v1/customer";

export const customerApi = {
  getAll: () => apiClient.get<Customer[]>(CUSTOMER_ENDPOINT),
  getById: (id: number) => apiClient.get<Customer>(`${CUSTOMER_ENDPOINT}/${id}`),
  create: (data: CustomerCreatePayload) => apiClient.post<Customer>(CUSTOMER_ENDPOINT, data),
  update: (id: number, data: Partial<Customer>) =>
    apiClient.put<Customer>(`${CUSTOMER_ENDPOINT}/${id}`, data),
  delete: (id: number) => apiClient.delete(`${CUSTOMER_ENDPOINT}/${id}`),
};
