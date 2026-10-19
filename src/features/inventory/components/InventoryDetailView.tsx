"use client";

import Link from "next/link";
import { useCallback } from "react";
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
  listLoadState,
} from "@/components/common/AdminKit";
import {
  useGetInventoryByProductQuery,
  useListStockMovementsQuery,
} from "@/store/api/inventoryApi";
import { useGetProductQuery } from "@/store/api/productApi";
import { usePageSize } from "@/contexts/AdminPreferencesContext";
import { useI18n } from "@/contexts/I18nContext";
import type { StockMovementType } from "@/store/api/types";
import { cn, formatSku, productPriceLabel, titleCase } from "@/lib/utils";
import { formatLocalDate } from "@/lib/dateFormat";
import { enumLabel } from "@/lib/enumLabel";
import { useInventoryAlerts } from "@/hooks/useInventoryAlerts";
import { usePersistentState } from "@/hooks/usePersistentState";

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
  return formatLocalDate(parsed, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function InventoryDetailView({ productId }: { productId: string }) {
  const { t } = useI18n();
  const [page, setPage] = usePersistentState(`inventory-${productId}:page`, 1);
  const [size, setSize] = usePageSize();

  const {
    data: item,
    isLoading: isLoadingItem,
    error: itemError,
    refetch: refetchItem,
  } = useGetInventoryByProductQuery(productId);

  const { data: product } = useGetProductQuery(productId);

  const movementsQuery = useListStockMovementsQuery({ productId, page, size });
  const { data: movementPage, refetch } = movementsQuery;
  const movements = listLoadState(movementsQuery);

  useInventoryAlerts(
    useCallback(
      (message) => {
        if (message.id !== productId) return;
        void refetchItem();
        void refetch();
      },
      [productId, refetchItem, refetch]
    )
  );

  const movementTableHeaders = [
    t("fields.date", "Date"),
    t("fields.type", "Type"),
    t("inventory.detail.table.strategy", "Strategy"),
    t("fields.quantity", "Quantity"),
    t("inventory.detail.table.performed_by", "Performed By"),
    t("fields.note", "Note"),
  ];

  const breadcrumbs = [
    { label: t("breadcrumb.home", "Home"), href: "/" },
    { label: t("inventory.breadcrumb.inventory", "Inventory"), href: "/inventory" },
    { label: item?.productName ? titleCase(item.productName) : t("inventory.breadcrumb.detail", "Detail") },
  ];

  if (itemError) {
    return (
      <PageShell>
        <PageHeader
          title={t("inventory.detail.title", "Inventory Detail")}
          breadcrumbs={breadcrumbs}
          rightSlot={<AdminTopActions />}
        />
        <DataCard title={t("inventory.detail.not_found.title", "Not Found")}>
          <p className="py-8 text-center text-sm text-muted-foreground">
            {t("inventory.detail.not_found.message", "No inventory record for this product.")}{" "}
            <Link href="/inventory" className="underline">
              {t("inventory.detail.not_found.back", "Back to inventory")}
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
        title={item?.productName ? titleCase(item.productName) : t("inventory.detail.title", "Inventory Detail")}
        breadcrumbs={breadcrumbs}
        rightSlot={<AdminTopActions />}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatTile
          title={t("inventory.detail.stats.on_hand", "On Hand")}
          value={isLoadingItem ? "..." : `${onHand} ${item?.unit ? enumLabel(t, "unit", item.unit) : ""}`}
          tone={level === "OK" ? "green" : level === "LOW" ? "orange" : "red"}
        />
        <StatTile
          title={t("inventory.fields.reorder_level", "Reorder Level")}
          value={isLoadingItem ? "..." : `${reorder} ${item?.unit ? enumLabel(t, "unit", item.unit) : ""}`}
          tone="gray"
        />
        <StatTile
          title={t("fields.price", "Price")}
          value={product ? productPriceLabel(product.variants) : "-"}
          tone="gray"
        />
        <StatTile
          title={t("fields.sku", "SKU")}
          value={product?.sku ? formatSku(product.sku) : "-"}
          tone="gray"
        />
      </div>

      <DataCard
        title={t("inventory.detail.movements.title", "Stock Movements")}
        meta={t("inventory.detail.movements.meta", "Total Movements: {count}", { count: movementPage?.totalElements ?? 0 })}
        actions={
          <StatusBadge
            label={
              level === "OK"
                ? t("inventory.levels.ok", "In Stock")
                : level === "LOW"
                  ? t("inventory.levels.low", "Low Stock")
                  : t("inventory.levels.out", "Out of Stock")
            }
            tone={level === "OK" ? "success" : level === "LOW" ? "warning" : "danger"}
          />
        }
      >
        <SimpleTable headers={movementTableHeaders}>
          <TableState
            colSpan={movementTableHeaders.length}
            isLoading={movements.isLoading}
            error={movements.error}
            isEmpty={(movementPage?.content.length ?? 0) === 0}
            emptyLabel={t("inventory.detail.movements.empty", "No stock movements recorded for this product yet.")}
            onRetry={refetch}
          />
          {movements.showRows &&
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
                  {movement.performedByName ? titleCase(movement.performedByName) : "-"}
                  {movement.performedByRole ? ` (${enumLabel(t, "role", movement.performedByRole)})` : ""}
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
