import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { productApi } from "@/features/products/api/product-api";
import { productQueryKeys } from "@/features/products/constants/product-query-keys";
import type { ProductRequest } from "@/features/products/types/product.type";

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (data: ProductRequest) => productApi.create(data),
    onSuccess: () => {
      toast.success("Product created successfully");
      void queryClient.invalidateQueries({ queryKey: productQueryKeys.all });
    },
    onError: () => toast.error("Failed to create product"),
  });
  return { create: mutation.mutateAsync, isLoading: mutation.isPending, error: mutation.error };
}
