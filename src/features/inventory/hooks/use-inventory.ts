import { useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/features/inventory/api/inventory-api";
import { inventoryQueryKeys } from "@/features/inventory/constants/inventory-query-keys";

export function useInventory() {
  const query = useQuery({ queryKey: inventoryQueryKeys.all, queryFn: inventoryApi.getAll });
  return { inventory: query.data ?? [], isLoading: query.isLoading, refetch: query.refetch };
}
