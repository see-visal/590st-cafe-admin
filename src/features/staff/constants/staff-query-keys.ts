export const staffQueryKeys = {
  all: ["admin", "staff"] as const,
  detail: (id: number) => ["admin", "staff", id] as const,
};
