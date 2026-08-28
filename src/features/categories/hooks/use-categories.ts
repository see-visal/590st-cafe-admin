import { useQuery } from "@tanstack/react-query";
import { categoryApi } from "@/features/categories/api/category-api";
import { categoryQueryKeys } from "@/features/categories/constants/category-query-keys";

export function useCategories() {
  const query = useQuery({ queryKey: categoryQueryKeys.all, queryFn: categoryApi.getAll });
  return {
    categories: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
