"use client";

import { useMemo } from "react";
import { PageShell } from "@/components/common/PageShell";
import { PageHeader } from "@/components/common/PageHeader";
import {
  AdminTopActions,
  DataCard,
  StatTile,
  TableActions,
} from "@/components/common/AdminKit";
import { useSalesReport } from "@/hooks/useAdmin";

function formatKhr(amount: number) {
  return `${amount.toLocaleString()} KHR`;
}

export default function Report() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 30);

  const startDate = start.toISOString().slice(0, 10);
  const endDate = end.toISOString().slice(0, 10);

  const { report, isLoading } = useSalesReport(startDate, endDate);

  const cashTotal = useMemo(() => {
    if (!report) return 0;
    return report.paymentMethods
      .filter((p) => p.method === "CASH")
      .reduce((sum, p) => sum + p.amount, 0);
  }, [report]);

  const digitalTotal = useMemo(() => {
    if (!report) return 0;
    return report.paymentMethods
      .filter((p) => p.method !== "CASH")
      .reduce((sum, p) => sum + p.amount, 0);
  }, [report]);

  return (
    <PageShell>
      <PageHeader
        title="Daily Settlement"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Report" },
          { label: "Daily Settlement" },
        ]}
        rightSlot={<AdminTopActions />}
      />

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading report...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatTile
              title="Gross Revenue"
              value={formatKhr(report?.totalSales ?? 0)}
            />
            <StatTile title="Cash Revenue" value={formatKhr(cashTotal)} />
            <StatTile title="Digital Revenue" value={formatKhr(digitalTotal)} />
            <StatTile
              title="Total Orders"
              value={String(report?.totalOrders ?? 0)}
            />
          </div>

          <DataCard
            title="Top Products"
            meta={report?.period ?? `${startDate} to ${endDate}`}
            actions={<TableActions />}
          >
            <div className="space-y-3 p-4">
              {(report?.topProducts ?? []).length === 0 ? (
                <p className="text-sm text-gray-400">No product sales in this period.</p>
              ) : (
                report?.topProducts.map((product) => (
                  <div
                    key={product.name}
                    className="flex items-center justify-between border-b border-gray-100 pb-2"
                  >
                    <span>{product.name}</span>
                    <span className="font-semibold">{product.count} sold</span>
                  </div>
                ))
              )}
            </div>
          </DataCard>

          <DataCard title="Payment Methods" meta="Breakdown by method">
            <div className="space-y-3 p-4">
              {(report?.paymentMethods ?? []).map((method) => (
                <div
                  key={method.method}
                  className="flex items-center justify-between border-b border-gray-100 pb-2"
                >
                  <span>{method.method}</span>
                  <span className="font-semibold">{formatKhr(method.amount)}</span>
                </div>
              ))}
            </div>
          </DataCard>
        </>
      )}
    </PageShell>
  );
}
