import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { productApi } from "@/features/products/api/product-api";
import { productQueryKeys } from "@/features/products/constants/product-query-keys";

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: productApi.delete,
    onSuccess: () => {
      toast.success("Product deleted successfully");
      void queryClient.invalidateQueries({ queryKey: productQueryKeys.all });
    },
    onError: () => toast.error("Failed to delete product"),
  });
  return { delete: mutation.mutateAsync, isLoading: mutation.isPending, error: mutation.error };
}
