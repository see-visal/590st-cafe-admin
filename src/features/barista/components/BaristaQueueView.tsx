"use client";

import { PageShell } from "@/components/common/PageShell";
import { PageHeader } from "@/components/common/PageHeader";
import { AdminTopActions, StatTile } from "@/components/common/AdminKit";
import { FileText, Timer } from "lucide-react";
import { useKitchenQueue, useUpdateKitchenQueue } from "@/hooks/useAdmin";
import { KitchenOrder } from "@/features/dashboard/api/dashboardApi";

const columns = [
  { title: "Confirmed", color: "bg-blue-500", statuses: ["CONFIRMED", "ACCEPTED"] },
  { title: "Preparing", color: "bg-orange-500", statuses: ["PREPARING"] },
  { title: "Ready", color: "bg-green-500", statuses: ["READY"] },
] as const;

function QueueCard({
  order,
  onAdvance,
}: {
  order: KitchenOrder;
  onAdvance: (order: KitchenOrder) => void;
}) {
  const actionLabel =
    order.status === "CONFIRMED" || order.status === "ACCEPTED"
      ? "Mark Preparing"
      : order.status === "PREPARING"
        ? "Mark Ready"
        : "Complete";

  return (
    <article className="rounded-lg bg-white shadow-sm">
      <div className="flex items-start justify-between border-b border-gray-100 p-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            {order.customerName || "Customer"}
          </h3>
          <p className="mt-1 text-xs text-gray-400">#{order.orderNumber}</p>
        </div>
        <span className="rounded-full bg-lime-100 px-3 py-1 text-xs font-semibold text-blue-500">
          {order.status}
        </span>
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{new Date(order.createdAt).toLocaleString()}</span>
          <span className="inline-flex items-center gap-1">
            {order.assignedBarista || "Unassigned"}
            <Timer className="h-4 w-4 text-gray-700" />
          </span>
        </div>
        <p className="text-right font-semibold text-gray-800">
          Total:{" "}
          <span className="text-gray-400">
            {order.totalAmount != null ? `${order.totalAmount.toLocaleString()} KHR` : "—"}
          </span>
        </p>
        <div className="flex justify-end gap-3 pt-2">
          <button className="inline-flex h-10 items-center gap-2 rounded-md border border-black px-4 text-sm font-semibold">
            Receipt
            <FileText className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onAdvance(order)}
            className="h-10 rounded-md bg-black px-4 text-sm font-semibold text-white"
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function Barista() {
  const { queue, isLoading, refetch } = useKitchenQueue();
  const { accept, markPreparing, markReady } = useUpdateKitchenQueue();

  const confirmedCount = queue.filter((item) =>
    ["CONFIRMED", "ACCEPTED"].includes(item.status),
  ).length;
  const preparingCount = queue.filter((item) => item.status === "PREPARING").length;
  const readyCount = queue.filter((item) => item.status === "READY").length;

  const handleAdvance = async (order: KitchenOrder) => {
    try {
      if (order.status === "CONFIRMED") {
        await accept(order.id);
      } else if (order.status === "ACCEPTED") {
        await markPreparing(order.id);
      } else if (order.status === "PREPARING") {
        await markReady(order.id);
      }
      refetch();
    } catch {
      // toast handled in hook
    }
  };

  return (
    <PageShell>
      <PageHeader
        title="Barista List"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Barista" },
          { label: "Barista List" },
        ]}
        rightSlot={<AdminTopActions />}
      />

      <section className="grid grid-cols-1 gap-4 rounded-lg bg-white p-4 shadow-sm md:grid-cols-2 xl:grid-cols-4">
        <StatTile title="In Queue" value={String(confirmedCount)} hint="Confirmed orders" />
        <StatTile title="Preparing" value={String(preparingCount)} hint="Currently being made" />
        <StatTile title="Ready" value={String(readyCount)} hint="Waiting for pickup" />
        <StatTile title="Total Active" value={String(queue.length)} hint="All active kitchen orders" />
      </section>

      <section className="px-2">
        <h2 className="text-xl font-semibold text-gray-800">Production Queue</h2>
        <p className="mt-2 text-sm text-gray-400">
          Move drinks forward from confirmed to ready without leaving the workstation.
        </p>

        {isLoading && queue.length === 0 ? (
          <p className="mt-6 text-sm text-gray-500">Loading kitchen queue...</p>
        ) : null}

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          {columns.map((column) => {
            const items = queue.filter((item) =>
              (column.statuses as readonly string[]).includes(item.status),
            );

            return (
              <div key={column.title}>
                <div className="mb-5 flex items-center gap-3">
                  <span className={`h-2 w-5 rounded ${column.color}`} />
                  <h3 className="text-lg font-semibold">{column.title}</h3>
                  <span className="text-sm text-gray-400">({items.length})</span>
                </div>
                <div className="space-y-4">
                  {items.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-gray-200 p-6 text-sm text-gray-400">
                      No orders in this stage
                    </p>
                  ) : (
                    items.map((order) => (
                      <QueueCard key={order.id} order={order} onAdvance={handleAdvance} />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </PageShell>
  );
}
