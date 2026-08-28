import { apiClient } from "@/lib/api/axios";
import type { BackendSalesReport, Report } from "@/features/reports/types/report.type";

const REPORT_ENDPOINT = "/api/v1/reports";

function mapSalesReport(raw: BackendSalesReport): Report {
  return {
    period: raw.period,
    totalSales: Number(raw.totalSales),
    totalOrders: raw.totalOrders,
    averageOrderValue: Number(raw.averageOrderValue),
    topProducts: raw.topProducts ?? [],
    paymentMethods: raw.paymentMethods.map((payment) => ({
      method: payment.method,
      amount: Number(payment.amount),
    })),
  };
}

export const reportApi = {
  sales: async (startDate: string, endDate: string) =>
    mapSalesReport(await apiClient.get<BackendSalesReport>(
      `${REPORT_ENDPOINT}/sales?start=${startDate}&end=${endDate}`
    )),
  orders: (startDate: string, endDate: string) =>
    apiClient.get<Report>(`${REPORT_ENDPOINT}/orders?start=${startDate}&end=${endDate}`),
  inventory: () => apiClient.get<Report>(`${REPORT_ENDPOINT}/inventory`),
  export: (format: "PDF" | "EXCEL") =>
    apiClient.get(`${REPORT_ENDPOINT}/export?format=${format}`),
};
