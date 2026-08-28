import { useQuery } from "@tanstack/react-query";
import { paymentApi } from "@/features/payments/api/payment-api";
import { paymentQueryKeys } from "@/features/payments/constants/payment-query-keys";

export function usePayment(id: number) {
  return useQuery({
    queryKey: paymentQueryKeys.detail(id),
    queryFn: () => paymentApi.getById(id),
    enabled: id > 0,
  });
}
