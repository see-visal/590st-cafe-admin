import { useQuery } from "@tanstack/react-query";
import { productApi } from "@/features/products/api/product-api";
import { productQueryKeys } from "@/features/products/constants/product-query-keys";

export function useProducts() {
  const query = useQuery({ queryKey: productQueryKeys.all, queryFn: productApi.getAll });
  return {
    products: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
