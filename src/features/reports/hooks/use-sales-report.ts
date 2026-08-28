import { useQuery } from "@tanstack/react-query";
import { reportApi } from "@/features/reports/api/report-api";
import { reportQueryKeys } from "@/features/reports/constants/report-query-keys";

export function useSalesReport(startDate: string, endDate: string) {
  const query = useQuery({
    queryKey: reportQueryKeys.sales(startDate, endDate),
    queryFn: () => reportApi.sales(startDate, endDate),
    enabled: Boolean(startDate && endDate),
  });
  return { report: query.data ?? null, isLoading: query.isLoading, refetch: query.refetch };
}
