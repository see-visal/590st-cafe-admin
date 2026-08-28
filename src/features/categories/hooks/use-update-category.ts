import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { categoryApi } from "@/features/categories/api/category-api";
import { categoryQueryKeys } from "@/features/categories/constants/category-query-keys";
import type { CategoryRequest } from "@/features/categories/types/category.type";

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoryRequest }) => categoryApi.update(id, data),
    onSuccess: () => {
      toast.success("Category updated successfully");
      void queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all });
    },
    onError: () => toast.error("Failed to update category"),
  });
  return {
    update: (id: number, data: CategoryRequest) => mutation.mutateAsync({ id, data }),
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
