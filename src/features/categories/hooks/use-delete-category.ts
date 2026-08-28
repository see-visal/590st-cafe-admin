import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { categoryApi } from "@/features/categories/api/category-api";
import { categoryQueryKeys } from "@/features/categories/constants/category-query-keys";

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: categoryApi.delete,
    onSuccess: () => {
      toast.success("Category deleted successfully");
      void queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all });
    },
    onError: () => toast.error("Failed to delete category"),
  });
  return { delete: mutation.mutateAsync, isLoading: mutation.isPending, error: mutation.error };
}
