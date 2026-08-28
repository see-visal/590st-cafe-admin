import { apiClient } from "@/lib/api/axios";
import type { DashboardSummary } from "@/features/dashboard/types/dashboard.type";

export const dashboardApi = {
  getSummary: () => apiClient.get<DashboardSummary>("/api/v1/dashboard/summary"),
};
