import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { orderApi } from "@/features/orders/api/order-api";
import { orderQueryKeys } from "@/features/orders/constants/order-query-keys";

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: string }) =>
      orderApi.updateStatus(orderId, status),
    onSuccess: () => {
      toast.success("Order status updated");
      void queryClient.invalidateQueries({ queryKey: orderQueryKeys.all });
    },
    onError: () => toast.error("Failed to update order"),
  });
  return {
    update: (orderId: number, status: string) => mutation.mutateAsync({ orderId, status }),
    isLoading: mutation.isPending,
  };
}
