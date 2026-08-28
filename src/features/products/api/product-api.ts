import { apiClient } from "@/lib/api/axios";
import type {
  ProductRequest,
  ProductResponse,
} from "@/features/products/types/product.type";

const PRODUCT_ENDPOINT = "/api/v1/product";

export const productApi = {
  getAll: () => apiClient.get<ProductResponse[]>(PRODUCT_ENDPOINT),
  getById: (id: number) => apiClient.get<ProductResponse>(`${PRODUCT_ENDPOINT}/${id}`),
  create: (data: ProductRequest) => apiClient.post<ProductResponse>(PRODUCT_ENDPOINT, data),
  update: (id: number, data: ProductRequest) =>
    apiClient.put<ProductResponse>(`${PRODUCT_ENDPOINT}/${id}`, data),
  delete: (id: number) => apiClient.delete(`${PRODUCT_ENDPOINT}/${id}`),
  getByCategory: (categoryId: number) =>
    apiClient.get<ProductResponse[]>(`${PRODUCT_ENDPOINT}/category/${categoryId}`),
};
