"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { useListLowStockQuery } from "@/store/api/inventoryApi";
import { useListOrdersQuery } from "@/store/api/orderApi";
import { useListAllBaristaOrdersQuery } from "@/store/api/baristaOrderApi";
import { useCurrentRole } from "@/store/api/useCurrentRole";
import { apiErrorMessage } from "@/store/api/baseApi";
import { useListContactMessagesQuery } from "@/store/api/contactApi";

const polling = { pollingInterval: 30000, skipPollingIfUnfocused: true };

// How many alerts this browser has already been shown. Per-viewer and not worth a round trip,
// so it lives in localStorage; a browser that blocks it simply always shows the full count.
const SEEN_KEY = "alerts-seen-count";

function readSeen(): number {
  try {
    const stored = Number(window.localStorage.getItem(SEEN_KEY));
    return Number.isFinite(stored) && stored > 0 ? stored : 0;
  } catch {
    return 0;
  }
}

function writeSeen(value: number) {
  try {
    window.localStorage.setItem(SEEN_KEY, String(value));
  } catch {
    // Storage blocked — the badge just keeps showing everything.
  }
}

/**
 * Splits "how much work is outstanding" from "how much of it is new to this person".
 *
 * The count itself is live operational state — pending orders, low stock, unread messages —
 * and looking at the list does not make any of it go away. So the badge tracks only what has
 * arrived since the alerts were last opened: viewing them takes it to zero, and it comes back
 * when something genuinely new turns up.
 */
// null until hydrated from storage, so the server render and the first client render agree.
let seenValue: number | null = null;
const seenListeners = new Set<() => void>();

function publishSeen(next: number, persist: boolean) {
  if (seenValue === next) return;
  seenValue = next;
  if (persist) writeSeen(next);
  seenListeners.forEach((notify) => notify());
}

function subscribeSeen(notify: () => void) {
  seenListeners.add(notify);
  return () => { seenListeners.delete(notify); };
}

function useUnseenCount(count: number | undefined) {
  const seen = useSyncExternalStore(
    subscribeSeen,
    () => seenValue,
    () => null,
  );

  useEffect(() => {
    if (seenValue === null) publishSeen(readSeen(), false);
  }, []);

  // Work that has since been dealt with must not mask the next new alert, so the watermark
  // follows the count back down.
  useEffect(() => {
    if (count === undefined || seen === null || count >= seen) return;
    publishSeen(count, true);
  }, [count, seen]);

  const markSeen = useCallback(() => {
    if (count !== undefined) publishSeen(count, true);
  }, [count]);

  const unseen =
    count === undefined || seen === null ? undefined : Math.max(0, count - seen);

  return { unseen, markSeen };
}

export function useOperationalAlerts() {
  const { isAdmin, isBarista, isLoading: roleLoading } = useCurrentRole();
  const adminOrders = useListOrdersQuery({ status: "PENDING", page: 1, size: 5 }, { ...polling, skip: !isAdmin });
  const baristaOrders = useListAllBaristaOrdersQuery({ status: "PENDING", page: 1, size: 5 }, { ...polling, skip: !isBarista });
  const stock = useListLowStockQuery({ page: 1, size: 5 }, { ...polling, skip: !isAdmin && !isBarista });
  const messages = useListContactMessagesQuery({ status: "RECEIVED", page: 1, size: 1 }, { ...polling, skip: !isAdmin });
  const orders = isBarista ? baristaOrders : adminOrders;
  const error = orders.error || stock.error;
  const loading = roleLoading || orders.isLoading || stock.isLoading;
  const count = orders.data && stock.data && !error ? orders.data.totalElements + stock.data.totalElements + (messages.data?.totalElements ?? 0) : undefined;
  const { unseen, markSeen } = useUnseenCount(count);
  return { orders, stock, error, loading, count, unseen, markSeen, ordersHref: isBarista ? "/barista-queue" : "/orders", refresh: () => {
    if (isAdmin || isBarista) { void orders.refetch(); void stock.refetch(); }
  } };
}

export function OperationalAlertsContent({ alerts }: { alerts: ReturnType<typeof useOperationalAlerts> }) {
  if (alerts.loading) return <p role="status" className="p-4 text-sm">Loading current alerts...</p>;
  if (alerts.error) return <div role="alert" className="p-4 text-sm text-red-700">
    <p>{apiErrorMessage(alerts.error as never, "Could not load current alerts.")}</p>
    <button type="button" className="mt-2 underline" onClick={alerts.refresh}>Retry</button>
  </div>;
  return <div className="space-y-5 p-4 text-sm">
    <p className="text-muted-foreground">Current pending orders and low stock. Updates every 30 seconds.</p>
    <section>
      <h3 className="font-semibold">Pending orders ({alerts.orders.data?.totalElements ?? 0})</h3>
      {alerts.orders.data?.content.length ? alerts.orders.data.content.map((order) =>
        <Link key={order.id} href={alerts.ordersHref} className="mt-2 block rounded border p-3 hover:bg-muted">
          <span className="font-mono">#{order.id.slice(0, 8).toUpperCase()}</span>
          <span className="block">{order.customerName ?? "Walk-in"} · {order.paymentMethod} · ${Number(order.totalAmount).toFixed(2)}</span>
        </Link>) : <p className="mt-2 text-muted-foreground">No pending orders.</p>}
      <Link href={alerts.ordersHref} className="mt-2 inline-block underline">View all orders</Link>
    </section>
    <section>
      <h3 className="font-semibold">Low stock ({alerts.stock.data?.totalElements ?? 0})</h3>
      {alerts.stock.data?.content.length ? alerts.stock.data.content.map((item) =>
        <Link key={item.productId} href="/stock-alerts" className="mt-2 block rounded border p-3 hover:bg-muted">
          {item.productName}: {Number(item.quantityOnHand)} {item.unit}
        </Link>) : <p className="mt-2 text-muted-foreground">No low-stock items.</p>}
      <Link href="/stock-alerts" className="mt-2 inline-block underline">View stock alerts</Link>
    </section>
  </div>;
}
