"use client";

import { PageShell } from "@/components/shared/page-shell";
import { PageHeader } from "@/components/shared/page-header";
import { AdminTopActions, StatTile } from "@/components/shared/admin-kit";
import { Clock, ExternalLink, X } from "lucide-react";
import { useKitchenQueue } from "@/features/barista/hooks/use-kitchen-queue";
import { useUpdateKitchenQueue } from "@/features/barista/hooks/use-update-kitchen-queue";
import type { KitchenOrder } from "@/features/barista/types/kitchen-order.type";
import { cn } from "@/lib/utils";

interface QueueCardItem {
  code: string;
  qtyText: string;
  name: string;
  price: string;
}

interface OrderCardProps {
  customerName: string;
  orderNumber: string;
  date: string;
  timeAgo: string;
  status: string;
  statusType: "confirmed" | "preparing" | "ready";
  items: readonly QueueCardItem[];
  total: string;
  actionLabel?: string;
  onAction?: () => void;
  onClose?: () => void;
}

function OrderCard({
  customerName,
  orderNumber,
  date,
  timeAgo,
  status,
  statusType,
  items,
  total,
  actionLabel,
  onAction,
  onClose,
}: OrderCardProps) {
  const statusClasses = {
    confirmed: "bg-blue-100 text-blue-600",
    preparing: "bg-amber-100 text-amber-700",
    ready: "bg-green-100 text-green-700",
  };

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-base font-bold text-gray-900">{customerName}</h4>
          <p className="text-xs text-gray-400">#{orderNumber}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", statusClasses[statusType])}>
            {status}
          </span>
          {onClose && (
            <button type="button" onClick={onClose} className="text-red-500 hover:text-red-700">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Date & Time */}
      <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
        <span>{date}</span>
        <span className="flex items-center gap-1">
          {timeAgo} <Clock className="h-3.5 w-3.5" />
        </span>
      </div>

      {/* Items */}
      <div className="mt-4 space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="border-b border-dashed border-gray-200 pb-3">
            <p className="text-xs font-semibold text-gray-900">{item.code}</p>
            <div className="mt-1 flex items-center justify-between text-sm">
              <span className="text-gray-500">
                <span className="font-bold text-gray-900">{item.qtyText}</span> {item.name}
              </span>
              <span className="font-bold text-gray-900">{item.price}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 flex flex-col items-end gap-3">
        <p className="text-sm text-gray-500">
          Total : <span className="font-bold text-gray-900">{total}</span>
        </p>
        <div className="flex items-center gap-2">
          <button type="button" className="btn_outline_black text-xs font-medium">
            Receipt <ExternalLink className="h-3.5 w-3.5" />
          </button>
          {actionLabel && (
            <button type="button" onClick={onAction} className="btn_primary_black text-xs font-medium">
              {actionLabel}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

/** Static preview data matching design mockup */
const MOCK_ITEMS: readonly QueueCardItem[] = [
  { code: "093001940", qtyText: "1x", name: "Matcha Green Tea", price: "$5.00" },
  { code: "093001940", qtyText: "1x", name: "Matcha Green Tea", price: "$5.00" },
  { code: "093001940", qtyText: "1x", name: "Matcha Green Tea", price: "$5.00" },
];

const STATIC_CONFIRMED = {
  customerName: "Visal Soeurn",
  orderNumber: "57CB59E0",
  date: "May 22, 2026, 10:56 PM",
  timeAgo: "0 min ago",
  status: "Confirmed",
  statusType: "confirmed" as const,
  items: MOCK_ITEMS,
  total: "$5.00",
};

const STATIC_PREPARING = {
  customerName: "Visal Soeurn",
  orderNumber: "57CB59E0",
  date: "May 22, 2026, 10:56 PM",
  timeAgo: "0 min ago",
  status: "Preapring",
  statusType: "preparing" as const,
  items: MOCK_ITEMS,
  total: "$5.00",
};

const STATIC_READY = {
  customerName: "Visal Soeurn",
  orderNumber: "57CB59E0",
  date: "May 22, 2026, 10:56 PM",
  timeAgo: "0 min ago",
  status: "Ready",
  statusType: "ready" as const,
  items: MOCK_ITEMS,
  total: "$5.00",
};

const STATIC_COMPLETED_ORDERS = [
  {
    id: "c-1",
    customerName: "Visal Soeurn",
    orderNumber: "57CB59E0",
    date: "May 22, 2026, 10:56 PM",
    timeAgo: "0 min ago",
    status: "Confirmed",
    statusType: "confirmed" as const,
    items: MOCK_ITEMS,
    total: "$15.00",
  },
  {
    id: "c-2",
    customerName: "Delivery - Toul Kork",
    orderNumber: "57CB59E0",
    date: "May 22, 2026, 10:56 PM",
    timeAgo: "0 min ago",
    status: "Preapring",
    statusType: "preparing" as const,
    items: MOCK_ITEMS,
    total: "$15.00",
  },
];

export default function Barista() {
  const { queue = [], refetch } = useKitchenQueue();
  const { accept, markPreparing, markReady } = useUpdateKitchenQueue();

  const hasApiData = queue && queue.length > 0;

  const confirmedCount = hasApiData
    ? queue.filter((item) => ["CONFIRMED", "ACCEPTED"].includes(item.status)).length
    : 0;
  const readyCount = hasApiData
    ? queue.filter((item) => item.status === "READY").length
    : 0;
  const servedCount = 10;

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
      // Handled in hook
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

      {/* Metric Cards Top Row */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatTile
          title="Pending Payment"
          value="0"
          hint="Awaiting cashier confirmation"
        />
        <StatTile
          title="In Queue"
          value={String(confirmedCount)}
          hint="Confirmed and preparing drinks"
        />
        <StatTile
          title="Ready"
          value={String(readyCount)}
          hint="Waiting for pickup or handoff"
        />
        <StatTile
          title="Served"
          value={String(servedCount)}
          hint="Latest completed orders on screen"
        />
      </section>

      {/* Production Queue Section */}
      <section className="mt-4">
        <h2 className="title_box">Production Queue</h2>
        <p className="desc_box">
          Move drinks forward from confirmed to served without leaving the workstation.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Confirmed Column */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="h-2.5 w-6 rounded-full bg-blue-500" />
              <h3 className="text-base font-bold text-gray-900">Confirmed</h3>
            </div>
            {hasApiData ? (
              queue
                .filter((item) => ["CONFIRMED", "ACCEPTED"].includes(item.status))
                .map((order) => (
                  <OrderCard
                    key={order.id}
                    customerName={order.customerName || "Customer"}
                    orderNumber={order.orderNumber}
                    date={new Date(order.createdAt).toLocaleString()}
                    timeAgo="0 min ago"
                    status="Confirmed"
                    statusType="confirmed"
                    items={
                      order.items?.map((it) => ({
                        code: `ITEM-${it.productId}`,
                        qtyText: `${it.quantity}x`,
                        name: `Product #${it.productId}`,
                        price: `$${it.price}`,
                      })) || MOCK_ITEMS
                    }
                    total={order.totalAmount ? `$${order.totalAmount}` : "$5.00"}
                    actionLabel="Mark Preparing"
                    onAction={() => handleAdvance(order)}
                  />
                ))
            ) : (
              <OrderCard
                {...STATIC_CONFIRMED}
                actionLabel="Mark Preparing"
                onClose={() => undefined}
              />
            )}
          </div>

          {/* Preparing Column */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="h-2.5 w-6 rounded-full bg-amber-500" />
              <h3 className="text-base font-bold text-gray-900">Preparing</h3>
            </div>
            {hasApiData ? (
              queue
                .filter((item) => item.status === "PREPARING")
                .map((order) => (
                  <OrderCard
                    key={order.id}
                    customerName={order.customerName || "Customer"}
                    orderNumber={order.orderNumber}
                    date={new Date(order.createdAt).toLocaleString()}
                    timeAgo="0 min ago"
                    status="Preparing"
                    statusType="preparing"
                    items={
                      order.items?.map((it) => ({
                        code: `ITEM-${it.productId}`,
                        qtyText: `${it.quantity}x`,
                        name: `Product #${it.productId}`,
                        price: `$${it.price}`,
                      })) || MOCK_ITEMS
                    }
                    total={order.totalAmount ? `$${order.totalAmount}` : "$5.00"}
                    actionLabel="Mark Ready"
                    onAction={() => handleAdvance(order)}
                  />
                ))
            ) : (
              <OrderCard {...STATIC_PREPARING} actionLabel="Mark Ready" />
            )}
          </div>

          {/* Ready Column */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="h-2.5 w-6 rounded-full bg-green-500" />
              <h3 className="text-base font-bold text-gray-900">Ready</h3>
            </div>
            {hasApiData ? (
              queue
                .filter((item) => item.status === "READY")
                .map((order) => (
                  <OrderCard
                    key={order.id}
                    customerName={order.customerName || "Customer"}
                    orderNumber={order.orderNumber}
                    date={new Date(order.createdAt).toLocaleString()}
                    timeAgo="0 min ago"
                    status="Ready"
                    statusType="ready"
                    items={
                      order.items?.map((it) => ({
                        code: `ITEM-${it.productId}`,
                        qtyText: `${it.quantity}x`,
                        name: `Product #${it.productId}`,
                        price: `$${it.price}`,
                      })) || MOCK_ITEMS
                    }
                    total={order.totalAmount ? `$${order.totalAmount}` : "$5.00"}
                    actionLabel="Mark Served"
                    onAction={() => handleAdvance(order)}
                  />
                ))
            ) : (
              <OrderCard {...STATIC_READY} actionLabel="Mark Served" />
            )}
          </div>
        </div>
      </section>

      {/* Recent Completed Orders Section */}
      <section className="mt-8">
        <h2 className="title_box">Recent Completed Orders</h2>
        <p className="desc_box">
          Quick access for receipt reprint when a guest asks again.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {STATIC_COMPLETED_ORDERS.map((order) => (
            <OrderCard key={order.id} {...order} onClose={() => undefined} />
          ))}
        </div>
      </section>
    </PageShell>
  );
}
