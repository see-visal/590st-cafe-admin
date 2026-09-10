"use client";

import { useState } from "react";
import { PageShell } from "@/components/common/PageShell";
import { PageHeader } from "@/components/common/PageHeader";
import { AdminTopActions, DataCard, FilterActions, FilterPanel, StatTile, TextField } from "@/components/common/AdminKit";
import { useRefreshOptions } from "@/contexts/AdminPreferencesContext";
import { shopDate } from "@/lib/shopDate";
import { apiErrorMessage } from "@/store/api/baseApi";
import { useGetOwnDailyReportQuery } from "@/store/api/reportApi";
import type { Numeric } from "@/store/api/types";

export default function BaristaReportView() {
  const [date, setDate] = useState(shopDate);
  const refresh = useRefreshOptions();
  const { currentData: report, isFetching, error, refetch } = useGetOwnDailyReportQuery({ date }, refresh);
  const money = (value: Numeric | undefined) => `$${Number(value ?? 0).toFixed(2)}`;

  return (
    <PageShell>
      <PageHeader title="My Daily Report" breadcrumbs={[{ label: "Home", href: "/" }, { label: "Reports" }]} rightSlot={<AdminTopActions />} />
      <FilterPanel>
        <TextField label="Date" type="date" value={date} onChange={(event) => { if (event.target.value) setDate(event.target.value); }} />
        <FilterActions onClear={() => setDate(shopDate())} onSearch={refetch} />
      </FilterPanel>
      <DataCard title="My Sales" meta={date}>
        {error ? (
          <div role="alert" className="p-4">
            <p>{apiErrorMessage("status" in error ? error : undefined, "Could not load your daily report.")}</p>
            <button type="button" className="mt-2 underline" onClick={refetch}>Retry</button>
          </div>
        ) : isFetching || !report ? (
          <p role="status" className="p-4">Loading your daily report...</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-4">
            <StatTile title="Paid Orders" value={String(report.totalOrders)} tone="gray" />
            <StatTile title="Cash" value={money(report.cashTotal)} tone="gray" />
            <StatTile title="Bakong" value={money(report.bakongTotal)} tone="gray" />
            <StatTile title="Total Sales" value={money(report.grandTotal)} tone="green" />
          </div>
        )}
        <p className="px-4 pb-4 text-sm text-muted-foreground">Sales attributed to your account for the selected day.</p>
      </DataCard>
    </PageShell>
  );
}
