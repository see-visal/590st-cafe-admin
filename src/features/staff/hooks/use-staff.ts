import { useQuery } from "@tanstack/react-query";
import { staffApi } from "@/features/staff/api/staff-api";
import { staffQueryKeys } from "@/features/staff/constants/staff-query-keys";

export function useStaff() {
  const query = useQuery({ queryKey: staffQueryKeys.all, queryFn: staffApi.getAll });
  return { staff: query.data ?? [], isLoading: query.isLoading, refetch: query.refetch };
}
