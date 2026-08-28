import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { kitchenApi } from "@/features/barista/api/kitchen-api";
import { kitchenQueryKeys } from "@/features/barista/constants/kitchen-query-keys";

export function useUpdateKitchenQueue() {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: kitchenQueryKeys.all });
  const acceptMutation = useMutation({
    mutationFn: kitchenApi.accept,
    onSuccess: () => { toast.success("Order accepted"); void refresh(); },
    onError: () => toast.error("Failed to accept order"),
  });
  const preparingMutation = useMutation({
    mutationFn: kitchenApi.markPreparing,
    onSuccess: () => { toast.success("Marked as preparing"); void refresh(); },
    onError: () => toast.error("Failed to update status"),
  });
  const readyMutation = useMutation({
    mutationFn: kitchenApi.markReady,
    onSuccess: () => { toast.success("Order ready!"); void refresh(); },
    onError: () => toast.error("Failed to mark as ready"),
  });
  return {
    accept: acceptMutation.mutateAsync,
    markPreparing: preparingMutation.mutateAsync,
    markReady: readyMutation.mutateAsync,
    isLoading: acceptMutation.isPending || preparingMutation.isPending || readyMutation.isPending,
  };
}
