export const inventoryQueryKeys = {
  all: ["admin", "inventory"] as const,
  detail: (id: number) => ["admin", "inventory", id] as const,
};
