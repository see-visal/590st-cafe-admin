import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { categoryApi } from "@/features/categories/api/category-api";
import { categoryQueryKeys } from "@/features/categories/constants/category-query-keys";
import type { CategoryRequest } from "@/features/categories/types/category.type";

export function useCreateCategory() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (data: CategoryRequest) => categoryApi.create(data),
    onSuccess: () => {
      toast.success("Category created successfully");
      void queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all });
    },
    onError: () => toast.error("Failed to create category"),
  });
  return { create: mutation.mutateAsync, isLoading: mutation.isPending, error: mutation.error };
}
