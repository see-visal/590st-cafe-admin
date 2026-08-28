import { apiClient } from "@/lib/api/axios";
import type { Payment } from "@/features/payments/types/payment.type";

const PAYMENT_ENDPOINT = "/api/v1/payments";

export const paymentApi = {
  getById: (id: number) => apiClient.get<Payment>(`${PAYMENT_ENDPOINT}/${id}`),
  getByOrder: (orderId: number) =>
    apiClient.get<Payment>(`${PAYMENT_ENDPOINT}/order/${orderId}`),
  verify: (id: number) => apiClient.get<Payment>(`${PAYMENT_ENDPOINT}/${id}/verify`),
};
