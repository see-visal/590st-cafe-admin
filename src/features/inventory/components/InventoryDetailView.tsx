"use client";

import Link from "next/link";
import { useState } from "react";
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
  StatusBadge,
  TableState,
} from "@/components/common/AdminKit";
import {
  useGetInventoryByProductQuery,
  useListStockMovementsQuery,
} from "@/store/api/inventoryApi";
import { useGetProductQuery } from "@/store/api/productApi";
import { usePageSize } from "@/contexts/AdminPreferencesContext";
import type { StockMovementType } from "@/store/api/types";
import { cn } from "@/lib/utils";

const MOVEMENT_TABLE_HEADERS = [
  "Date",
  "Type",
  "Strategy",
  "Quantity",
  "Performed By",
  "Note",
] as const;

function MovementTypeBadge({ type }: { type: StockMovementType }) {
  return (
    <span
      className={cn(
        "movement_type_badge",
        type === "STOCK_IN" ? "is_purchase" : "is_sale"
      )}
    >
      {type === "STOCK_IN" ? "Stock In" : "Stock Out"}
    </span>
  );
}

/** Stock-in adds, stock-out subtracts — the API sends both as a positive magnitude. */
function QuantityChange({
  value,
  type,
}: {
  value: number;
  type: StockMovementType;
}) {
  const signed = type === "STOCK_IN" ? value : -value;
  return (
    <span className={cn("qty_change", signed >= 0 ? "is_positive" : "is_negative")}>
      {signed > 0 ? "+" : ""}
      {signed}
    </span>
  );
}

function formatDateTime(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function InventoryDetailView({ productId }: { productId: string }) {
  const [page, setPage] = useState(1);
  const [size, setSize] = usePageSize();

  const {
    data: item,
    isFetching: isLoadingItem,
    error: itemError,
  } = useGetInventoryByProductQuery(productId);

  const { data: product } = useGetProductQuery(productId);

  const {
    data: movementPage,
    isFetching: isLoadingMovements,
    error: movementError,
    refetch,
  } = useListStockMovementsQuery({ productId, page, size });

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Inventory", href: "/inventory" },
    { label: item?.productName ?? "Detail" },
  ];

  if (itemError) {
    return (
      <PageShell>
        <PageHeader
          title="Inventory Detail"
          breadcrumbs={breadcrumbs}
          rightSlot={<AdminTopActions />}
        />
        <DataCard title="Not Found">
          <p className="py-8 text-center text-sm text-muted-foreground">
            No inventory record for this product.{" "}
            <Link href="/inventory" className="underline">
              Back to inventory
            </Link>
          </p>
        </DataCard>
      </PageShell>
    );
  }

  const onHand = Number(item?.quantityOnHand ?? 0);
  const reorder = Number(item?.reorderLevel ?? 0);
  const level = onHand <= 0 ? "OUT" : onHand <= reorder ? "LOW" : "OK";

  return (
    <PageShell>
      <PageHeader
        title={item?.productName ?? "Inventory Detail"}
        breadcrumbs={breadcrumbs}
        rightSlot={<AdminTopActions />}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatTile
          title="On Hand"
          value={isLoadingItem ? "..." : `${onHand} ${item?.unit ?? ""}`}
          tone={level === "OK" ? "green" : level === "LOW" ? "orange" : "red"}
        />
        <StatTile
          title="Reorder Level"
          value={isLoadingItem ? "..." : `${reorder} ${item?.unit ?? ""}`}
          tone="gray"
        />
        <StatTile
          title="Unit Price"
          value={product ? `$${Number(product.price).toFixed(2)}` : "-"}
          tone="gray"
        />
        <StatTile title="SKU" value={product?.sku ?? "-"} tone="gray" />
      </div>

      <DataCard
        title="Stock Movements"
        meta={`Total Movements: ${movementPage?.totalElements ?? 0}`}
        actions={
          <StatusBadge
            label={
              level === "OK" ? "In Stock" : level === "LOW" ? "Low Stock" : "Out of Stock"
            }
            tone={level === "OK" ? "success" : level === "LOW" ? "warning" : "danger"}
          />
        }
      >
        <SimpleTable headers={[...MOVEMENT_TABLE_HEADERS]}>
          <TableState
            colSpan={MOVEMENT_TABLE_HEADERS.length}
            isLoading={isLoadingMovements}
            error={movementError}
            isEmpty={(movementPage?.content.length ?? 0) === 0}
            emptyLabel="No stock movements recorded for this product yet."
            onRetry={refetch}
          />
          {!isLoadingMovements &&
            !movementError &&
            (movementPage?.content ?? []).map((movement, index) => (
              <Row key={movement.id} striped={index % 2 === 1}>
                <Cell>{formatDateTime(movement.createdAt)}</Cell>
                <Cell>
                  <MovementTypeBadge type={movement.type} />
                </Cell>
                <Cell>{movement.strategy ?? "-"}</Cell>
                <Cell>
                  <QuantityChange
                    value={Number(movement.quantity)}
                    type={movement.type}
                  />
                </Cell>
                <Cell>
                  {movement.performedByName ?? "-"}
                  {movement.performedByRole ? ` (${movement.performedByRole})` : ""}
                </Cell>
                <Cell>{movement.note || "-"}</Cell>
              </Row>
            ))}
        </SimpleTable>
        <PaginationFooter
          page={movementPage?.page ?? page}
          totalPages={movementPage?.totalPages ?? 1}
          size={size}
          totalElements={movementPage?.totalElements}
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
