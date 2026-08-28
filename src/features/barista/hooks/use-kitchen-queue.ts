import { useQuery } from "@tanstack/react-query";
import { kitchenApi } from "@/features/barista/api/kitchen-api";
import { kitchenQueryKeys } from "@/features/barista/constants/kitchen-query-keys";
import { usePreferences } from "@/hooks/use-preferences";

export function useKitchenQueue() {
  const { autoRefreshInterval } = usePreferences();
  const seconds = Number(autoRefreshInterval) || 10;

  const query = useQuery({
    queryKey: kitchenQueryKeys.all,
    queryFn: kitchenApi.getActiveOrders,
    // Driven by the "Order queue refresh" setting.
    refetchInterval: seconds * 1000,
  });
  return { queue: query.data ?? [], isLoading: query.isLoading, refetch: query.refetch };
}
