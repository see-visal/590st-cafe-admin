"use client";

import { PageShell } from "@/components/common/PageShell";
import { PageHeader } from "@/components/common/PageHeader";
import {
  AdminTopActions,
  Cell,
  DataCard,
  PaginationFooter,
  Row,
  SimpleTable,
  StatTile,
  TableActions,
} from "@/components/common/AdminKit";
import {
  formatUsd,
  SETTLEMENT_HISTORY,
  SETTLEMENT_SUMMARY,
  type SettlementRow,
  type SettlementStatus,
} from "@/features/report/constants/report.mock";
import { cn } from "@/lib/utils";

function SettlementStatusBadge({ status }: { status: SettlementStatus }) {
  const toneClass = {
    Pending: "is_pending",
    Settled: "is_settled",
    Discrepancy: "is_discrepancy",
  }[status];

  return (
    <span className={cn("settlement_status_badge", toneClass)}>{status}</span>
  );
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
  return (
    <span className={cn("settlement_amount", tone !== "default" && `is_${tone}`)}>
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
        actions={<TableActions showRegister={false} />}
      >
        <SimpleTable headers={[...SETTLEMENT_TABLE_HEADERS]}>
          {rows.map((row: SettlementRow, index) => (
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

        <div className="settlement_table_footer">
          <span className="settlement_table_count">Showing {rows.length} items</span>
          <PaginationFooter />
        </div>
      </DataCard>
    </PageShell>
  );
}
