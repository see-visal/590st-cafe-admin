export const reportQueryKeys = {
  sales: (startDate: string, endDate: string) =>
    ["admin", "reports", "sales", startDate, endDate] as const,
  inventory: ["admin", "reports", "inventory"] as const,
};
