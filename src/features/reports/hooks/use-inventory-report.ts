import { useQuery } from "@tanstack/react-query";
import { reportApi } from "@/features/reports/api/report-api";
import { reportQueryKeys } from "@/features/reports/constants/report-query-keys";

export function useInventoryReport() {
  const query = useQuery({
    queryKey: reportQueryKeys.inventory,
    queryFn: reportApi.inventory,
  });
  return { report: query.data ?? null, isLoading: query.isLoading, refetch: query.refetch };
}
