"use client";

import { PageShell } from "@/components/shared/page-shell";
import { PageHeader } from "@/components/shared/page-header";
import {
  AdminTopActions,
  Cell,
  DataCard,
  PaginationFooter,
  Row,
  SimpleTable,
  StatTile,
  TableActions,
} from "@/components/shared/admin-kit";
import {
  SETTLEMENT_HISTORY,
  SETTLEMENT_SUMMARY,
  type SettlementRow,
  type SettlementStatus,
} from "@/features/reports/constants/report.mock";
import { PILL_BASE } from "@/components/shared/status-badge";
import { formatUsd } from "@/lib/format-currency";
import { cn } from "@/lib/utils";
import { autoColumns, downloadCsv } from "@/lib/export-csv";
import { usePagination } from "@/hooks/use-pagination";

function SettlementStatusBadge({ status }: { status: SettlementStatus }) {
  const toneClass = {
    Pending: "bg-yellow-100 text-yellow-700",
    Settled: "bg-green-100 text-green-700",
    Discrepancy: "bg-red-100 text-red-600",
  }[status];

  return <span className={cn(PILL_BASE, toneClass)}>{status}</span>;
}

function MoneyCell({
  amount,
  tone = "default",
  signed = false,
}: {
  amount: number;
  tone?: "default" | "discount" | "refund" | "net";
  signed?: boolean;
}) {
  const prefix = signed && amount > 0 ? "-" : "";
  const toneClass = {
    default: "",
    discount: "font-medium text-orange-600",
    refund: "font-medium text-red-600",
    net: "font-semibold text-green-700",
  }[tone];
  return (
    <span className={cn("text-xs", toneClass)}>
      {prefix}
      {formatUsd(amount)}
    </span>
  );
}

const SETTLEMENT_TABLE_HEADERS = [
  "Date",
  "Gross Revenue",
  "Discounts",
  "Refunds",
  "Net Revenue",
  "Cash",
  "Digital",
  "Orders",
  "Avg Order",
  "Settled By",
  "Status",
] as const;

export default function Report() {
  const summary = SETTLEMENT_SUMMARY;
  const rows = SETTLEMENT_HISTORY;

  const activePage = usePagination(rows);

  const handleExport = () =>
    downloadCsv("settlement-report", rows as never[], autoColumns(rows as never[]));

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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          title="Gross Revenue"
          value={`${formatUsd(summary.grossRevenue)} USD`}
          tone="gray"
        />
        <StatTile
          title="Cash Revenue"
          value={`${formatUsd(summary.cashRevenue)} USD`}
          tone="gray"
        />
        <StatTile
          title="Digital Revenue"
          value={`${formatUsd(summary.digitalRevenue)} USD`}
          tone="gray"
        />
        <StatTile
          title="Net Revenue"
          value={`${formatUsd(summary.netRevenue)} USD`}
          tone="gray"
        />
      </div>

      <DataCard
        title="Method Orders"
        meta={`Settle Orders: ${summary.settleOrders}`}
        actions={<TableActions showRegister={false} onExport={handleExport} />}
      >
        <SimpleTable headers={[...SETTLEMENT_TABLE_HEADERS]}>
          {activePage.pageRows.map((row: SettlementRow, index) => (
            <Row key={row.id} striped={index % 2 === 1}>
              <Cell>{row.date}</Cell>
              <Cell>{formatUsd(row.grossRevenue)}</Cell>
              <Cell>
                <MoneyCell amount={row.discounts} tone="discount" signed />
              </Cell>
              <Cell>
                <MoneyCell amount={row.refunds} tone="refund" signed />
              </Cell>
              <Cell>
                <MoneyCell amount={row.netRevenue} tone="net" />
              </Cell>
              <Cell>{formatUsd(row.cash)}</Cell>
              <Cell>{formatUsd(row.digital)}</Cell>
              <Cell>{row.orders}</Cell>
              <Cell>{formatUsd(row.avgOrder)}</Cell>
              <Cell>{row.settledBy}</Cell>
              <Cell>
                <SettlementStatusBadge status={row.status} />
              </Cell>
            </Row>
          ))}
        </SimpleTable>

        <div className="mt-[30px] flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between [&_.table_pagination]:mt-0 [&_.table_pagination]:w-full sm:[&_.table_pagination]:w-auto">
          <span className="text-xs text-[#333333]">Showing {rows.length} items</span>
          <PaginationFooter
          page={activePage.page}
          totalPages={activePage.totalPages}
          pageSize={activePage.pageSize}
          onPageChange={activePage.setPage}
          onPageSizeChange={activePage.setPageSize}
        />
        </div>
      </DataCard>
    </PageShell>
  );
}
