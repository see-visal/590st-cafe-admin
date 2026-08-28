import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { inventoryApi } from "@/features/inventory/api/inventory-api";
import { inventoryQueryKeys } from "@/features/inventory/constants/inventory-query-keys";

export function useAdjustInventory() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ inventoryId, quantity }: { inventoryId: number; quantity: number }) =>
      inventoryApi.adjust(inventoryId, quantity),
    onSuccess: () => {
      toast.success("Inventory adjusted");
      void queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.all });
    },
    onError: () => toast.error("Failed to adjust inventory"),
  });
  return {
    adjust: (inventoryId: number, quantity: number) => mutation.mutateAsync({ inventoryId, quantity }),
    isLoading: mutation.isPending,
  };
}
