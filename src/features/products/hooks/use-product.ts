import { useQuery } from "@tanstack/react-query";
import { productApi } from "@/features/products/api/product-api";
import { productQueryKeys } from "@/features/products/constants/product-query-keys";

export function useProduct(id: number) {
  return useQuery({
    queryKey: productQueryKeys.detail(id),
    queryFn: () => productApi.getById(id),
    enabled: id > 0,
  });
}
