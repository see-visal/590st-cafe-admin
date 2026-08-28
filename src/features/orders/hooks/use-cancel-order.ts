import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { orderApi } from "@/features/orders/api/order-api";
import { orderQueryKeys } from "@/features/orders/constants/order-query-keys";

export function useCancelOrder() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: orderApi.cancel,
    onSuccess: () => {
      toast.success("Order cancelled");
      void queryClient.invalidateQueries({ queryKey: orderQueryKeys.all });
    },
    onError: () => toast.error("Failed to cancel order"),
  });
  return { cancel: mutation.mutateAsync, isLoading: mutation.isPending };
}
