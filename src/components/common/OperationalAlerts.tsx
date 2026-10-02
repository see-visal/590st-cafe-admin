"use client";

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { ConciergeBell, PackageMinus, PhoneCall, ShoppingBag, MessageSquareText } from "lucide-react";
import { useListLowStockQuery } from "@/store/api/inventoryApi";
import {
  useAnswerStaffCallMutation,
  useListOrdersQuery,
  useListStaffCallsQuery,
} from "@/store/api/orderApi";
import {
  useAnswerBaristaStaffCallMutation,
  useListAllBaristaOrdersQuery,
  useListBaristaStaffCallsQuery,
} from "@/store/api/baristaOrderApi";
import { useCurrentRole } from "@/store/api/useCurrentRole";
import { apiErrorMessage } from "@/store/api/baseApi";
import { useListContactMessagesQuery } from "@/store/api/contactApi";
import { useStaffOrderAlerts } from "@/hooks/useStaffOrderAlerts";
import { useStaffCallAlerts } from "@/hooks/useStaffCallAlerts";
import { useInventoryAlerts } from "@/hooks/useInventoryAlerts";
import { useFeedbackAlerts } from "@/hooks/useFeedbackAlerts";
import { humanise, timeAgo, titleCase } from "@/lib/utils";
import { notify } from "@/components/common/AppToast";
import { staffCallReasonLabel } from "@/lib/staffCall";
import { lowStockNotice, newMessageNotice, orderNotice, staffCallNotice } from "@/lib/liveNotifications";

const polling = { pollingInterval: 30000, skipPollingIfUnfocused: true };

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
  }
}

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
  return () => {
    seenListeners.delete(notify);
  };
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

  useEffect(() => {
    if (count === undefined || seen === null || count >= seen) return;
    publishSeen(count, true);
  }, [count, seen]);

  const markSeen = useCallback(() => {
    if (count !== undefined) publishSeen(count, true);
  }, [count]);

  const unseen =
    count === undefined || seen === null
      ? undefined
      : Math.max(0, count - seen);

  return { unseen, markSeen };
}

export function useOperationalAlerts() {
  const { isAdmin, isBarista, isLoading: roleLoading } = useCurrentRole();
  const adminOrders = useListOrdersQuery(
    { status: "PENDING", page: 1, size: 5 },
    { ...polling, skip: !isAdmin },
  );
  const baristaOrders = useListAllBaristaOrdersQuery(
    { status: "PENDING", page: 1, size: 5 },
    { ...polling, skip: !isBarista },
  );
  const stock = useListLowStockQuery(
    { page: 1, size: 5 },
    { ...polling, skip: !isAdmin && !isBarista },
  );
  const messages = useListContactMessagesQuery(
    { status: "NEW", page: 1, size: 1 },
    { ...polling, skip: !isAdmin },
  );
  const adminStaffCalls = useListStaffCallsQuery(undefined, {
    ...polling,
    skip: !isAdmin,
  });
  const baristaStaffCalls = useListBaristaStaffCallsQuery(undefined, {
    ...polling,
    skip: !isBarista,
  });
  const orders = isBarista ? baristaOrders : adminOrders;
  const staffCalls = isBarista ? baristaStaffCalls : adminStaffCalls;
  const [adminAnswerStaffCall, { isLoading: isAnsweringAdmin }] =
    useAnswerStaffCallMutation();
  const [baristaAnswerStaffCall, { isLoading: isAnsweringBarista }] =
    useAnswerBaristaStaffCallMutation();
  const answerStaffCallMutation = isBarista
    ? baristaAnswerStaffCall
    : adminAnswerStaffCall;
  const error = orders.error || stock.error || staffCalls.error;
  const loading =
    roleLoading || orders.isLoading || stock.isLoading || staffCalls.isLoading;
  const count =
    orders.data && stock.data && !error
      ? orders.data.totalElements +
        stock.data.totalElements +
        (messages.data?.totalElements ?? 0) +
        (staffCalls.data?.length ?? 0)
      : undefined;
  const { unseen, markSeen } = useUnseenCount(count);

  useStaffOrderAlerts(
    useCallback(
      (message) => {
        if (!isAdmin && !isBarista) return;
        void orders.refetch();
        const notice = orderNotice(message, {
          orders: isBarista ? "/barista-queue" : "/orders",
          deliveryFee: isBarista ? "/barista-queue" : "/payments",
        });
        if (notice) notify({ ...notice, icon: <ShoppingBag /> });
      },
      [isAdmin, isBarista, orders],
    ),
  );

  useStaffCallAlerts(
    useCallback(
      (message) => {
        if (!isAdmin && !isBarista) return;
        void staffCalls.refetch();
        const notice = staffCallNotice(message, "/notifications");
        if (notice) notify({ ...notice, icon: <ConciergeBell /> });
      },
      [isAdmin, isBarista, staffCalls],
    ),
  );

  useInventoryAlerts(
    useCallback(() => {
      if (isAdmin || isBarista) void stock.refetch();
    }, [isAdmin, isBarista, stock]),
  );
  useFeedbackAlerts(
    useCallback(
      (message) => {
        if (!isAdmin) return;
        void messages.refetch();
        if (message.change === "CREATED") {
          notify({ ...newMessageNotice(message.id, "/notifications"), icon: <MessageSquareText /> });
        }
      },
      [isAdmin, messages],
    ),
  );

  const lowStockTotal = stock.data?.totalElements;
  const previousLowStock = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (lowStockTotal === undefined) return;
    const previous = previousLowStock.current;
    previousLowStock.current = lowStockTotal;
    if (previous !== undefined && lowStockTotal > previous) {
      notify({ ...lowStockNotice(lowStockTotal, "/stock-alerts"), icon: <PackageMinus /> });
    }
  }, [lowStockTotal]);

  const answerStaffCall = useCallback(
    async (orderId: string) => {
      try {
        await answerStaffCallMutation(orderId).unwrap();
      } catch (err) {
        toast.error(
          apiErrorMessage(err as never, "Could not answer the call."),
        );
      }
    },
    [answerStaffCallMutation],
  );

  return {
    orders,
    stock,
    staffCalls,
    answerStaffCall,
    isAnsweringStaffCall: isAnsweringAdmin || isAnsweringBarista,
    error,
    loading,
    count,
    unseen,
    markSeen,
    ordersHref: isBarista ? "/barista-queue" : "/orders",
    refresh: () => {
      if (isAdmin || isBarista) {
        void orders.refetch();
        void stock.refetch();
        void staffCalls.refetch();
      }
      if (isAdmin) void messages.refetch();
    },
  };
}

export function OperationalAlertsContent({
  alerts,
}: {
  alerts: ReturnType<typeof useOperationalAlerts>;
}) {
  if (alerts.loading)
    return (
      <p role="status" className="p-4 text-sm">
        Loading current alerts...
      </p>
    );
  if (alerts.error)
    return (
      <div role="alert" className="p-4 text-sm text-red-700">
        <p>
          {apiErrorMessage(
            alerts.error as never,
            "Could not load current alerts.",
          )}
        </p>
        <button
          type="button"
          className="mt-2 underline"
          onClick={alerts.refresh}
        >
          Retry
        </button>
      </div>
    );
  return (
    <div className="space-y-5 p-4 text-sm">
      <p className="text-muted-foreground">
        Current staff calls, pending orders and low stock. Updates every 30
        seconds.
      </p>
      <section>
        <h3 className="font-semibold flex items-center gap-1.5">
          <PhoneCall className="h-4 w-4" /> Staff calls (
          {alerts.staffCalls.data?.length ?? 0})
        </h3>
        {alerts.staffCalls.data?.length ? (
          alerts.staffCalls.data.map((call) => (
            <div
              key={call.orderId}
              className="mt-2 flex items-center justify-between gap-3 rounded border border-amber-200 bg-amber-50 p-3"
            >
              <div className="min-w-0">
                <span className="flex items-center gap-2">
                  <span className="font-mono">
                    #{call.orderId.slice(0, 8).toUpperCase()}
                  </span>
                  <span className="text-xs text-amber-800">
                    {timeAgo(call.calledAt)}
                  </span>
                </span>
                <span className="mt-1 inline-block rounded-full bg-amber-200 px-2 py-0.5 text-xs font-semibold text-amber-900">
                  {staffCallReasonLabel(call.reason)}
                </span>
                {call.note && (
                  <span className="mt-1 block break-words text-xs italic text-amber-900">
                    &ldquo;{call.note}&rdquo;
                  </span>
                )}
                <span className="block truncate">
                  {call.customerName ? titleCase(call.customerName) : "Walk-in"}{" "}
                  · {humanise(call.orderStatus)}
                  {call.fulfillmentMethod
                    ? ` · ${humanise(call.fulfillmentMethod)}`
                    : ""}
                </span>
              </div>
              <button
                type="button"
                className="shrink-0 rounded bg-black px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                disabled={alerts.isAnsweringStaffCall}
                onClick={() => alerts.answerStaffCall(call.orderId)}
              >
                Answer
              </button>
            </div>
          ))
        ) : (
          <p className="mt-2 text-muted-foreground">No open staff calls.</p>
        )}
      </section>
      <section>
        <h3 className="font-semibold">
          Pending orders ({alerts.orders.data?.totalElements ?? 0})
        </h3>
        {alerts.orders.data?.content.length ? (
          alerts.orders.data.content.map((order) => (
            <Link
              key={order.id}
              href={alerts.ordersHref}
              className="mt-2 block rounded border p-3 hover:bg-muted"
            >
              <span className="flex items-center gap-2">
                <span className="font-mono">
                  #{order.id.slice(0, 8).toUpperCase()}
                </span>
                {order.fulfillmentMethod === "DELIVERY" &&
                  order.deliveryFeeSetAt == null && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                      Needs delivery fee
                    </span>
                  )}
              </span>
              <span className="block">
                {order.customerName ? titleCase(order.customerName) : "Walk-in"}{" "}
                ·{" "}
                {order.paymentMethod ? humanise(order.paymentMethod) : "Unpaid"}{" "}
                · ${Number(order.totalAmount).toFixed(2)}
              </span>
            </Link>
          ))
        ) : (
          <p className="mt-2 text-muted-foreground">No pending orders.</p>
        )}
        <Link href={alerts.ordersHref} className="mt-2 inline-block underline">
          View all orders
        </Link>
      </section>
      <section>
        <h3 className="font-semibold">
          Low stock ({alerts.stock.data?.totalElements ?? 0})
        </h3>
        {alerts.stock.data?.content.length ? (
          alerts.stock.data.content.map((item) => (
            <Link
              key={item.productId}
              href="/stock-alerts"
              className="mt-2 block rounded border p-3 hover:bg-muted"
            >
              {titleCase(item.productName)}: {Number(item.quantityOnHand)}{" "}
              {item.unit}
            </Link>
          ))
        ) : (
          <p className="mt-2 text-muted-foreground">No low-stock items.</p>
        )}
        <Link href="/stock-alerts" className="mt-2 inline-block underline">
          View stock alerts
        </Link>
      </section>
    </div>
  );
}
