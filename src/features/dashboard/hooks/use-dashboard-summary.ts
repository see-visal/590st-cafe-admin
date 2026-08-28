import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/features/dashboard/api/dashboard-api";
import { dashboardQueryKeys } from "@/features/dashboard/constants/dashboard-query-keys";

export function useDashboardSummary() {
  const query = useQuery({
    queryKey: dashboardQueryKeys.summary,
    queryFn: dashboardApi.getSummary,
    refetchInterval: 30_000,
  });
  return { summary: query.data ?? null, isLoading: query.isLoading, refetch: query.refetch };
}
