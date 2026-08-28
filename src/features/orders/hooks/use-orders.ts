import { useQuery } from "@tanstack/react-query";
import { orderApi } from "@/features/orders/api/order-api";
import { orderQueryKeys } from "@/features/orders/constants/order-query-keys";
import { ApiError } from "@/lib/api/axios";

export function useOrders() {
  const query = useQuery({ queryKey: orderQueryKeys.all, queryFn: orderApi.getAll });
  return {
    orders: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error instanceof ApiError ? query.error : null,
    refetch: query.refetch,
  };
}
