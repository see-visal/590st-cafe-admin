"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/common/PageShell";
import { PageHeader } from "@/components/common/PageHeader";
import {
  AdminTopActions,
  Cell,
  DataCard,
  PaginationFooter,
  Row,
  RowActions,
  SimpleTable,
  StatTile,
  StatusBadge,
  TableState,
} from "@/components/common/AdminKit";
import { useListLowStockQuery } from "@/store/api/inventoryApi";
import { usePageSize } from "@/contexts/AdminPreferencesContext";

const STOCK_ALERT_HEADERS = [
  "No",
  "Product Name",
  "On Hand",
  "Unit",
  "Reorder Level",
  "Shortfall",
  "Severity",
  "Action",
] as const;

/**
 * Everything the API reports at or below its reorder level, straight from
 * /api/admin/inventory/low-stock — the same rule the inventory screen colours rows by.
 */
export default function StockAlertView() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [size, setSize] = usePageSize();

  const { data: alertPage, isFetching, error, refetch } = useListLowStockQuery({
    page,
    size,
  });

  const alerts = alertPage?.content ?? [];
  const outOfStock = alerts.filter((a) => Number(a.quantityOnHand) <= 0).length;

  return (
    <PageShell>
      <PageHeader
        title="Stock Alerts"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Inventory" },
          { label: "Stock Alerts" },
        ]}
        rightSlot={<AdminTopActions />}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <StatTile
          title="Products Needing Restock"
          value={String(alertPage?.totalElements ?? 0)}
          tone={(alertPage?.totalElements ?? 0) > 0 ? "orange" : "green"}
        />
        <StatTile
          title="Out of Stock (this page)"
          value={String(outOfStock)}
          tone={outOfStock > 0 ? "red" : "gray"}
        />
      </div>

      <DataCard
        title="Low Stock"
        meta={`At or below reorder level: ${alertPage?.totalElements ?? 0}`}
      >
        <SimpleTable headers={[...STOCK_ALERT_HEADERS]}>
          <TableState
            colSpan={STOCK_ALERT_HEADERS.length}
            isLoading={isFetching}
            error={error}
            isEmpty={alerts.length === 0}
            emptyLabel="Nothing is below its reorder level. Stock levels are healthy."
            onRetry={refetch}
          />
          {!isFetching &&
            !error &&
            alerts.map((alert, index) => {
              const onHand = Number(alert.quantityOnHand);
              const reorder = Number(alert.reorderLevel);
              const shortfall = Math.max(reorder - onHand, 0);
              const isOut = onHand <= 0;

              return (
                <Row key={alert.productId} striped={index % 2 === 1}>
                  <Cell>{(page - 1) * size + index + 1}</Cell>
                  <Cell className="font-semibold">{alert.productName}</Cell>
                  <Cell className={isOut ? "font-semibold text-red-600" : undefined}>
                    {onHand.toLocaleString()}
                  </Cell>
                  <Cell>{alert.unit}</Cell>
                  <Cell>{reorder.toLocaleString()}</Cell>
                  <Cell>{shortfall.toLocaleString()}</Cell>
                  <Cell>
                    <StatusBadge
                      label={isOut ? "Out of Stock" : "Low Stock"}
                      tone={isOut ? "danger" : "warning"}
                    />
                  </Cell>
                  <Cell>
                    <RowActions
                      onView={() => router.push(`/inventory/${alert.productId}`)}
                    />
                  </Cell>
                </Row>
              );
            })}
        </SimpleTable>
        <PaginationFooter
          page={alertPage?.page ?? page}
          totalPages={alertPage?.totalPages ?? 1}
          size={size}
          totalElements={alertPage?.totalElements}
          onPageChange={setPage}
          onSizeChange={(next) => {
            setSize(next);
            setPage(1);
          }}
        />
      </DataCard>
    </PageShell>
  );
}
