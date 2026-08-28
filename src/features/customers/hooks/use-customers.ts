import { useQuery } from "@tanstack/react-query";
import { customerApi } from "@/features/customers/api/customer-api";
import { customerQueryKeys } from "@/features/customers/constants/customer-query-keys";

export function useCustomers() {
  const query = useQuery({ queryKey: customerQueryKeys.all, queryFn: customerApi.getAll });
  return { customers: query.data ?? [], isLoading: query.isLoading, refetch: query.refetch };
}
