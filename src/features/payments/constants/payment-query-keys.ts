export const paymentQueryKeys = {
  detail: (id: number) => ["admin", "payments", id] as const,
  byOrder: (orderId: number) => ["admin", "payments", "order", orderId] as const,
};
