"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Download } from "lucide-react";
import { PageShell } from "@/components/shared/page-shell";
import { PageHeader } from "@/components/shared/page-header";
import {
  AdminTopActions,
  Cell,
  DataCard,
  PaginationFooter,
  Row,
  SimpleTable,
  StatusBadge,
  Thumbnail,
} from "@/components/shared/admin-kit";
import {
  getInventoryByProductId,
  STOCK_MOVEMENT_HISTORY,
  type StockMovementRow,
} from "@/features/inventory/constants/inventory.mock";
import { PILL_BASE } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";
import { usePagination } from "@/hooks/use-pagination";

function getStatusTone(status: string): "success" | "danger" | "warning" {
  const normalized = status.toLowerCase();
  if (normalized.includes("low")) return "warning";
  if (normalized.includes("out")) return "danger";
  return "success";
}

function MovementTypeBadge({ type }: { type: StockMovementRow["type"] }) {
  const toneClass = {
    Purchase: "bg-blue-100 text-blue-700",
    Sale: "bg-orange-100 text-orange-700",
    Adjustment: "bg-violet-100 text-violet-700",
  }[type];

  return <span className={cn(PILL_BASE, toneClass)}>{type}</span>;
}

function QuantityChange({ value }: { value: number }) {
  const prefix = value > 0 ? "+" : "";
  return (
    <span
      className={cn(
        "text-xs font-semibold",
        value >= 0 ? "text-green-700" : "text-red-600"
      )}
    >
      {prefix}
      {value}
    </span>
  );
}

export default function InventoryDetailView({ productId }: { productId: string }) {
  const item = useMemo(() => getInventoryByProductId(productId), [productId]);

  const activePage = usePagination(STOCK_MOVEMENT_HISTORY);

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

      <section className="flex flex-col gap-5 rounded-lg bg-white p-5 shadow-[0px_19px_38px_0px_rgba(32,33,36,0.04)] lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex size-[72px] shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-200 [&>span]:size-full">
            <Thumbnail />
          </div>
          <div>
            <p className="text-[length:var(--text-card-title)] font-semibold text-[#1E1E1E]">{item.name}</p>
            <p className="mt-1 text-sm leading-[1.4] text-gray-500">SKU: {item.sku}</p>
            <p className="mt-1 text-sm leading-[1.4] text-gray-500">Category: {item.category}</p>
          </div>
        </div>

        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3 lg:w-auto lg:min-w-[420px]">
          <div className="rounded-lg border border-[#EDEDED] bg-[#F4F4F4] px-4 py-3">
            <p className="text-xs text-gray-500">Current Stock ({item.unit})</p>
            <p className="mt-1.5 text-2xl font-bold leading-tight text-[#1E1E1E]">{item.stock}</p>
          </div>
          <div className="rounded-lg border border-[#EDEDED] bg-[#F4F4F4] px-4 py-3">
            <p className="text-xs text-gray-500">Reorder Level</p>
            <p className="mt-1.5 text-2xl font-bold leading-tight text-[#1E1E1E]">{item.reorderLevel}</p>
          </div>
          <div className="rounded-lg border border-[#EDEDED] bg-[#F4F4F4] px-4 py-3">
            <p className="text-xs text-gray-500">Unit</p>
            <p className="mt-1.5 text-2xl font-bold capitalize leading-tight text-[#1E1E1E]">{item.unit}</p>
          </div>
        </div>

        <div className="shrink-0 self-start">
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
          {activePage.pageRows.map((movement, index) => (
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
        <PaginationFooter
              page={activePage.page}
              totalPages={activePage.totalPages}
              pageSize={activePage.pageSize}
              onPageChange={activePage.setPage}
              onPageSizeChange={activePage.setPageSize}
            />
      </DataCard>
    </PageShell>
  );
}
