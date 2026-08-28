import { apiClient } from "@/lib/api/axios";
import type { Category, CategoryRequest } from "@/features/categories/types/category.type";

const CATEGORY_ENDPOINT = "/api/v1/category";

export const categoryApi = {
  getAll: () => apiClient.get<Category[]>(CATEGORY_ENDPOINT),
  create: (data: CategoryRequest) => apiClient.post<Category>(CATEGORY_ENDPOINT, data),
  update: (id: number, data: CategoryRequest) =>
    apiClient.put<Category>(`${CATEGORY_ENDPOINT}/${id}`, data),
  delete: (id: number) => apiClient.delete(`${CATEGORY_ENDPOINT}/${id}`),
};
