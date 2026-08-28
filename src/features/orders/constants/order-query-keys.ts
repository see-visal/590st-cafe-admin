export const orderQueryKeys = {
  all: ["admin", "orders"] as const,
  detail: (id: number) => ["admin", "orders", id] as const,
};
