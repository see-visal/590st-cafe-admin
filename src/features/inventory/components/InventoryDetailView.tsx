"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Download } from "lucide-react";
import { PageShell } from "@/components/common/PageShell";
import { PageHeader } from "@/components/common/PageHeader";
import {
  AdminTopActions,
  Cell,
  DataCard,
  PaginationFooter,
  Row,
  SimpleTable,
  StatusBadge,
  Thumbnail,
} from "@/components/common/AdminKit";
import {
  getInventoryByProductId,
  STOCK_MOVEMENT_HISTORY,
  type StockMovementRow,
} from "@/features/inventory/constants/inventory.mock";
import { cn } from "@/lib/utils";

function getStatusTone(status: string): "success" | "danger" | "warning" {
  const normalized = status.toLowerCase();
  if (normalized.includes("low")) return "warning";
  if (normalized.includes("out")) return "danger";
  return "success";
}

function MovementTypeBadge({ type }: { type: StockMovementRow["type"] }) {
  const toneClass = {
    Purchase: "is_purchase",
    Sale: "is_sale",
    Adjustment: "is_adjustment",
  }[type];

  return <span className={cn("movement_type_badge", toneClass)}>{type}</span>;
}

function QuantityChange({ value }: { value: number }) {
  const prefix = value > 0 ? "+" : "";
  return (
    <span className={cn("qty_change", value >= 0 ? "is_positive" : "is_negative")}>
      {prefix}
      {value}
    </span>
  );
}

export default function InventoryDetailView({ productId }: { productId: string }) {
  const item = useMemo(() => getInventoryByProductId(productId), [productId]);

  if (!item) {
    return (
      <PageShell>
        <PageHeader
          title="Inventory Detail"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Inventory", href: "/inventory" },
            { label: "Inventory List", href: "/inventory" },
          ]}
          rightSlot={<AdminTopActions />}
          titleAction={
            <Link href="/inventory" className="btn_outline_black">
              Back to List
            </Link>
          }
        />
        <div className="py-12 text-center text-gray-500">Inventory item not found.</div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        title="Inventory Detail"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Inventory", href: "/inventory" },
          { label: "Inventory List", href: "/inventory" },
        ]}
        rightSlot={<AdminTopActions />}
        titleAction={
          <Link href="/inventory" className="btn_outline_black">
            Back to List
          </Link>
        }
      />

      <section className="inventory_detail_summary">
        <div className="inventory_detail_identity">
          <div className="inventory_detail_thumb">
            <Thumbnail />
          </div>
          <div className="inventory_detail_meta">
            <p className="inventory_detail_name">{item.name}</p>
            <p className="inventory_detail_sub">SKU: {item.sku}</p>
            <p className="inventory_detail_sub">Category: {item.category}</p>
          </div>
        </div>

        <div className="inventory_detail_metrics">
          <div className="inventory_detail_metric">
            <p className="inventory_detail_metric_label">Current Stock ({item.unit})</p>
            <p className="inventory_detail_metric_value">{item.stock}</p>
          </div>
          <div className="inventory_detail_metric">
            <p className="inventory_detail_metric_label">Reorder Level</p>
            <p className="inventory_detail_metric_value">{item.reorderLevel}</p>
          </div>
          <div className="inventory_detail_metric">
            <p className="inventory_detail_metric_label">Unit</p>
            <p className="inventory_detail_metric_value capitalize">{item.unit}</p>
          </div>
        </div>

        <div className="inventory_detail_status">
          <StatusBadge label={item.status} tone={getStatusTone(item.status)} />
        </div>
      </section>

      <DataCard
        title="Stock Movement History"
        actions={
          <button type="button" className="btn_outline_black">
            Export History
            <Download />
          </button>
        }
      >
        <SimpleTable
          headers={[
            "Date",
            "Type",
            "Quantity Change",
            "Previous Qty",
            "New Qty",
            "Adjusted By",
            "Reason/Note",
          ]}
        >
          {STOCK_MOVEMENT_HISTORY.map((movement, index) => (
            <Row key={movement.id} striped={index % 2 === 1}>
              <Cell>{movement.date}</Cell>
              <Cell>
                <MovementTypeBadge type={movement.type} />
              </Cell>
              <Cell>
                <QuantityChange value={movement.change} />
              </Cell>
              <Cell>{movement.previousQty}</Cell>
              <Cell>{movement.newQty}</Cell>
              <Cell>{movement.adjustedBy}</Cell>
              <Cell>{movement.reason}</Cell>
            </Row>
          ))}
        </SimpleTable>
        <PaginationFooter />
      </DataCard>
    </PageShell>
  );
}
