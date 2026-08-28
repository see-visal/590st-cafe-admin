export const customerQueryKeys = {
  all: ["admin", "customers"] as const,
  detail: (id: number) => ["admin", "customers", id] as const,
};
