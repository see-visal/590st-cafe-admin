import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { productApi } from "@/features/products/api/product-api";
import { productQueryKeys } from "@/features/products/constants/product-query-keys";
import type { ProductRequest } from "@/features/products/types/product.type";

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductRequest }) => productApi.update(id, data),
    onSuccess: (product) => {
      toast.success("Product updated successfully");
      queryClient.setQueryData(productQueryKeys.detail(product.id), product);
      void queryClient.invalidateQueries({ queryKey: productQueryKeys.all });
    },
    onError: () => toast.error("Failed to update product"),
  });
  return {
    update: (id: number, data: ProductRequest) => mutation.mutateAsync({ id, data }),
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
