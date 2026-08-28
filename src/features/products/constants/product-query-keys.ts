export const productQueryKeys = {
  all: ["admin", "products"] as const,
  detail: (id: number) => ["admin", "products", id] as const,
  byCategory: (categoryId: number) => ["admin", "products", "category", categoryId] as const,
};
