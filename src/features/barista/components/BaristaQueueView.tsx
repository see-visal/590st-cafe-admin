"use client";
import { OrderFulfillmentDetails } from "@/components/common/OrderFulfillmentDetails";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  ChefHat,
  ChevronDown,
  Clock,
  Eye,
  Loader2,
  MessageSquareText,
  X,
} from "lucide-react";
import { PageShell } from "@/components/common/PageShell";
import { PageHeader } from "@/components/common/PageHeader";
import {
  AdminTopActions,
  DetailGrid,
  DetailItem,
  DetailModal,
  FormInput,
  FormModal,
  ModalGrid,
  StatTile,
} from "@/components/common/AdminKit";
import { apiErrorMessage } from "@/store/api/baseApi";
import {
  useCancelBaristaOrderMutation,
  useCompleteBaristaOrderMutation,
  useDispatchBaristaOrderMutation,
  useMarkDeliveredBaristaOrderMutation,
  useConfirmBakongPaymentMutation,
  useListAllBaristaOrdersQuery,
  usePayOrderCashMutation,
  useStartPreparingBaristaOrderMutation,
} from "@/store/api/baristaOrderApi";
import {
  useAcceptBakongPaymentMutation,
  useCancelOrderMutation,
  useCollectCashMutation,
  useCompleteOrderMutation,
  useDispatchAdminOrderMutation,
  useMarkDeliveredAdminOrderMutation,
  useListOrdersQuery,
  useStartPreparingOrderMutation,
} from "@/store/api/orderApi";
import { useCurrentRole } from "@/store/api/useCurrentRole";
import type { OrderResponse, OrderStatus } from "@/store/api/types";
import { cn } from "@/lib/utils";

const money = (value: number | null | undefined) =>
  value == null ? "-" : `$${Number(value).toFixed(2)}`;

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

function timeAgo(value: string) {
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return "";
  const minutes = Math.max(0, Math.round((Date.now() - then) / 60000));
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.floor(hours / 24)} d ago`;
}

const STATUS_CLASSES: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  PAID: "bg-blue-100 text-blue-700",
  PREPARING: "bg-violet-100 text-violet-700",
  OUT_FOR_DELIVERY: "bg-cyan-100 text-cyan-700",
  COMPLETED: "bg-green-100 text-green-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

// PENDING reads as "unpaid" on this screen: to a barista the interesting thing about that
// column is that no money has come in, not that the API calls it pending.
const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "UNPAID",
  PAID: "PAID",
  PREPARING: "PREPARING",
  OUT_FOR_DELIVERY: "OUT FOR DELIVERY",
  COMPLETED: "COMPLETED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
};

function OrderCard({
  order,
  actionLabel,
  onAction,
  onCancel,
  onOpen,
  isBusy,
  highlight,
}: {
  order: OrderResponse;
  actionLabel?: string;
  onAction?: () => void;
  onCancel?: () => void;
  onOpen?: () => void;
  isBusy?: boolean;
  highlight?: boolean;
}) {
  return (
    <article
      className={cn(
        "rounded-xl border bg-white p-4 shadow-xs",
        highlight ? "border-blue-300 ring-1 ring-blue-100" : "border-gray-200"
      )}
    >
      <div className="flex items-start justify-between">
        {/* The heading doubles as the affordance for the detail view, in every column —
            completed and cancelled orders carry no action buttons, so without this there would
            be no way to inspect them. */}
        <button
          type="button"
          onClick={onOpen}
          className="group min-w-0 text-left"
          aria-label={`View order ${order.id.slice(0, 8).toUpperCase()}`}
        >
          <h4 className="inline-flex items-center gap-1.5 text-base font-bold text-gray-900 group-hover:underline">
            {order.customerName ?? "Walk-in"}
            <Eye className="h-3.5 w-3.5 shrink-0 text-gray-400" />
          </h4>
          <p className="font-mono text-xs text-gray-400">
            #{order.id.slice(0, 8).toUpperCase()}
          </p>
        </button>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold",
              STATUS_CLASSES[order.status]
            )}
          >
            {STATUS_LABELS[order.status]}
          </span>
          {/* Only ever passed for unpaid orders — see the board below. */}
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isBusy}
              aria-label="Cancel order"
              className="text-red-500 hover:text-red-700 disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
        <span>{formatDateTime(order.createdAt)}</span>
        <span className="flex items-center gap-1">
          {timeAgo(order.createdAt)} <Clock className="h-3.5 w-3.5" />
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {order.items.map((item) => (
          <div key={item.id} className="border-b border-dashed border-gray-200 pb-3">
            <p className="text-xs font-semibold text-gray-900">
              {[
                item.sizeOptionName,
                item.sugarLevel && `Sugar ${item.sugarLevel}`,
                item.iceLevel && `Ice ${item.iceLevel}`,
                item.milkType && item.milkType !== "NONE" ? item.milkType : null,
              ]
                .filter(Boolean)
                .join(" · ") || "Standard"}
            </p>
            <div className="mt-1 flex items-center justify-between text-sm">
              <span className="text-gray-500">
                <span className="font-bold text-gray-900">{item.quantity}x</span>{" "}
                {item.productName}
              </span>
              <span className="font-bold text-gray-900">{money(item.subtotal)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* What the customer typed at checkout. On the card rather than only in the detail
          modal: it is an instruction to whoever makes the drink, and nobody opens a modal per
          order mid-rush. */}
      <OrderFulfillmentDetails order={order} />
      {order.note ? (
        <div className="mt-3 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5">
          <MessageSquareText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
          {/* pre-line: the note is the customer's own words on one line and the pickup or
              delivery logistics on the next. */}
          <p className="min-w-0 text-xs font-medium whitespace-pre-line wrap-break-word text-amber-900">
            {order.note}
          </p>
        </div>
      ) : null}

      <div className="mt-4 flex flex-col items-end gap-3">
        <p className="text-sm text-gray-500">
          Total : <span className="font-bold text-gray-900">{money(order.totalAmount)}</span>
        </p>
        {actionLabel && (
          <button
            type="button"
            onClick={onAction}
            disabled={isBusy}
            className="btn_primary_black text-xs font-medium disabled:opacity-50"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </article>
  );
}

function QueueColumn({
  title,
  accent,
  orders,
  isLoading,
  emptyLabel,
  renderCard,
}: {
  title: string;
  accent: string;
  orders: OrderResponse[];
  isLoading: boolean;
  emptyLabel: string;
  renderCard: (order: OrderResponse) => React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <span className={cn("h-2.5 w-6 rounded-full", accent)} />
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
        <span className="text-sm text-gray-400">({orders.length})</span>
      </div>
      <div className="space-y-4">
        {isLoading ? (
          <p className="flex items-center gap-2 py-8 text-sm text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading...
          </p>
        ) : orders.length === 0 ? (
          <p className="py-8 text-sm text-gray-400">{emptyLabel}</p>
        ) : (
          orders.map(renderCard)
        )}
      </div>
    </div>
  );
}

/**
 * One column's worth of orders.
 *
 * Admins are 403 on /api/barista/** and baristas are 403 on /api/admin/**, so each column has
 * to read through whichever endpoint set matches the signed-in role. Both hooks are always
 * called — rules of hooks — and the one for the wrong role is skipped, so only a single
 * request per column actually goes out.
 */
function useQueue(
  status: OrderStatus,
  {
    isAdmin,
    isBarista,
    size,
    pollingInterval,
  }: {
    isAdmin: boolean;
    isBarista: boolean;
    size: number;
    pollingInterval?: number;
  }
) {
  const params = { status, page: 1, size } as const;
  const admin = useListOrdersQuery(params, { skip: !isAdmin, pollingInterval });
  const barista = useListAllBaristaOrdersQuery(params, {
    skip: !isBarista,
    pollingInterval,
  });
  return isAdmin ? admin : barista;
}

/**
 * The live order board, one column per stage of an order's life:
 * unpaid -> paid -> preparing -> completed (see OrderStatus).
 *
 * The split that matters is between the first column and the rest. Everything under "Awaiting
 * Payment" is money the shop has not taken yet, so those are the only orders that can be
 * cancelled and the only ones showing a payment button. Everything to the right of it is
 * already paid for — stock has moved, the customer has an invoice — and cancelling is no
 * longer a cancellation but a refund, which the API refuses.
 *
 * The customer's own order screen reads the same status off the same order, so pressing
 * "Start Preparing" here is what advances their tracker.
 *
 * Polls so a second till's sales, and customers paying by QR on their phones, show up without
 * anyone hitting refresh.
 */
export default function BaristaQueueView() {
  const { isAdmin, isBarista, isLoading: isLoadingRole } = useCurrentRole();
  const roles = { isAdmin, isBarista };

  // Unpaid and paid-but-unmade are what the barista is actively waiting on, so they poll
  // fastest; finished work can lag.
  const pendingQuery = useQueue("PENDING", { ...roles, size: 50, pollingInterval: 15000 });
  const paidQuery = useQueue("PAID", { ...roles, size: 50, pollingInterval: 10000 });
  const preparingQuery = useQueue("PREPARING", { ...roles, size: 50, pollingInterval: 15000 });
  const outForDeliveryQuery = useQueue("OUT_FOR_DELIVERY", { ...roles, size: 50, pollingInterval: 15000 });
  const completedQuery = useQueue("COMPLETED", { ...roles, size: 20, pollingInterval: 30000 });
  const deliveredQuery = useQueue("DELIVERED", { ...roles, size: 20, pollingInterval: 30000 });
  const cancelledQuery = useQueue("CANCELLED", { ...roles, size: 20 });

  const { error, refetch } = pendingQuery;

  const [baristaPayCash, { isLoading: isPayingBarista }] = usePayOrderCashMutation();
  const [adminCollectCash, { isLoading: isPayingAdmin }] = useCollectCashMutation();
  const [baristaConfirmBakong, { isLoading: isConfirmingBarista }] =
    useConfirmBakongPaymentMutation();
  const [adminAcceptBakong, { isLoading: isConfirmingAdmin }] =
    useAcceptBakongPaymentMutation();
  const [baristaCancel, { isLoading: isCancellingBarista }] =
    useCancelBaristaOrderMutation();
  const [adminCancel, { isLoading: isCancellingAdmin }] = useCancelOrderMutation();
  const [baristaStartPreparing, { isLoading: isStartingBarista }] =
    useStartPreparingBaristaOrderMutation();
  const [adminStartPreparing, { isLoading: isStartingAdmin }] =
    useStartPreparingOrderMutation();
  const [baristaComplete, { isLoading: isCompletingBarista }] =
    useCompleteBaristaOrderMutation();
  const [adminComplete, { isLoading: isCompletingAdmin }] = useCompleteOrderMutation();
  const [baristaDispatch, { isLoading: isDispatchingBarista }] =
    useDispatchBaristaOrderMutation();
  const [adminDispatch, { isLoading: isDispatchingAdmin }] = useDispatchAdminOrderMutation();
  const [baristaDeliver, { isLoading: isDeliveringBarista }] =
    useMarkDeliveredBaristaOrderMutation();
  const [adminDeliver, { isLoading: isDeliveringAdmin }] = useMarkDeliveredAdminOrderMutation();

  const payCash = isAdmin ? adminCollectCash : baristaPayCash;
  const confirmBakong = isAdmin ? adminAcceptBakong : baristaConfirmBakong;
  const cancelOrder = isAdmin ? adminCancel : baristaCancel;
  const startPreparing = isAdmin ? adminStartPreparing : baristaStartPreparing;
  const completeOrder = isAdmin ? adminComplete : baristaComplete;
  const dispatchOrder = isAdmin ? adminDispatch : baristaDispatch;
  const deliverOrder = isAdmin ? adminDeliver : baristaDeliver;

  const isPaying = isPayingAdmin || isPayingBarista;
  const isBusy =
    isPaying ||
    isConfirmingAdmin ||
    isConfirmingBarista ||
    isCancellingAdmin ||
    isCancellingBarista ||
    isStartingAdmin ||
    isStartingBarista ||
    isCompletingAdmin ||
    isCompletingBarista ||
    isDispatchingAdmin ||
    isDispatchingBarista ||
    isDeliveringAdmin ||
    isDeliveringBarista;

  const [cashOrder, setCashOrder] = useState<OrderResponse | null>(null);
  const [amountTendered, setAmountTendered] = useState("");
  const [detailOrder, setDetailOrder] = useState<OrderResponse | null>(null);
  const [showCancelled, setShowCancelled] = useState(false);

  const pending = pendingQuery.data?.content ?? [];
  const paid = paidQuery.data?.content ?? [];
  const preparing = preparingQuery.data?.content ?? [];
  const outForDelivery = outForDeliveryQuery.data?.content ?? [];
  const completed = [
    ...(completedQuery.data?.content ?? []),
    ...(deliveredQuery.data?.content ?? []),
  ];
  const cancelled = cancelledQuery.data?.content ?? [];

  const unpaidValue = pending.reduce((sum, order) => sum + Number(order.totalAmount), 0);
  const toMake =
    (paidQuery.data?.totalElements ?? 0) + (preparingQuery.data?.totalElements ?? 0);

  const handlePayCash = async () => {
    if (!cashOrder) return;
    const tendered = Number(amountTendered);
    if (!Number.isFinite(tendered) || tendered < Number(cashOrder.totalAmount)) {
      toast.error("Amount tendered must cover the total");
      return;
    }
    try {
      const updated = await payCash({
        id: cashOrder.id,
        body: { amountTendered: tendered },
      }).unwrap();
      toast.success(
        Number(updated.changeDue) > 0
          ? `Paid. Change: ${money(updated.changeDue)}`
          : "Payment recorded"
      );
      setCashOrder(null);
    } catch (err) {
      toast.error(apiErrorMessage(err as never, "Could not record the payment."));
    }
  };

  const handleConfirmBakong = async (order: OrderResponse) => {
    try {
      // The API answers "no transfer found yet" by handing back the order untouched rather
      // than by failing, so success here does not mean the money arrived — paidAt does.
      const updated = await confirmBakong(order.id).unwrap();
      if (updated.paidAt) {
        toast.success("Bakong payment confirmed");
      } else {
        toast.error("No payment received for this order yet.");
      }
    } catch (err) {
      toast.error(apiErrorMessage(err as never, "Could not confirm the payment."));
    }
  };

  const handleCancel = async (order: OrderResponse) => {
    if (
      !window.confirm(
        `Cancel order #${order.id
          .slice(0, 8)
          .toUpperCase()}? Only unpaid orders can be cancelled.`
      )
    ) {
      return;
    }
    try {
      await cancelOrder(order.id).unwrap();
      toast.success("Order cancelled");
    } catch (err) {
      toast.error(apiErrorMessage(err as never, "Could not cancel the order."));
    }
  };

  const handleStartPreparing = async (order: OrderResponse) => {
    try {
      await startPreparing(order.id).unwrap();
      toast.success("Started preparing — the customer can see this");
    } catch (err) {
      toast.error(apiErrorMessage(err as never, "Could not start this order."));
    }
  };

  // A pickup order is finished when it is handed over the counter; a delivery order still has
  // to leave the shop, so the same button dispatches it to a courier instead.
  const handleComplete = async (order: OrderResponse) => {
    const isDelivery = order.fulfillmentMethod === "DELIVERY";
    try {
      if (isDelivery) {
        await dispatchOrder(order.id).unwrap();
        toast.success("Out for delivery — the customer can see this");
      } else {
        await completeOrder(order.id).unwrap();
        toast.success("Order completed");
      }
    } catch (err) {
      toast.error(
        apiErrorMessage(
          err as never,
          isDelivery ? "Could not dispatch the order." : "Could not complete the order."
        )
      );
    }
  };

  const handleDelivered = async (order: OrderResponse) => {
    try {
      await deliverOrder(order.id).unwrap();
      toast.success("Marked as delivered");
    } catch (err) {
      toast.error(apiErrorMessage(err as never, "Could not mark the order delivered."));
    }
  };

  return (
    <PageShell>
      <PageHeader
        title="Order Queue"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Barista Queue" }]}
        rightSlot={<AdminTopActions />}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatTile
          title="Awaiting Payment"
          value={String(pendingQuery.data?.totalElements ?? 0)}
          tone={pending.length > 0 ? "orange" : "gray"}
        />
        <StatTile
          title="Drinks To Make"
          value={String(toMake)}
          tone={toMake > 0 ? "yellow" : "gray"}
        />
        <StatTile title="Unpaid Value" value={money(unpaidValue)} tone="gray" />
      </div>

      {!isLoadingRole && !isAdmin && !isBarista ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          Your account role cannot read orders. Sign in as an admin or a barista.
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {apiErrorMessage(error as never, "Could not load the queue.")}{" "}
          <button type="button" onClick={refetch} className="underline">
            Retry
          </button>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {/* Nothing in this column has been paid for, which is why it is the only one that
            offers cancel. */}
        <QueueColumn
          title="Awaiting Payment"
          accent="bg-amber-500"
          orders={pending}
          isLoading={isLoadingRole || pendingQuery.isFetching}
          emptyLabel="Nothing waiting to be paid."
          renderCard={(order) => (
            <OrderCard
              key={order.id}
              order={order}
              isBusy={isBusy}
              actionLabel={
                order.paymentMethod === "BAKONG" ? "Confirm Bakong" : "Take Cash"
              }
              onAction={() => {
                if (order.paymentMethod === "BAKONG") {
                  handleConfirmBakong(order);
                } else {
                  setCashOrder(order);
                  setAmountTendered(String(Number(order.totalAmount).toFixed(2)));
                }
              }}
              onCancel={() => handleCancel(order)}
              onOpen={() => setDetailOrder(order)}
            />
          )}
        />

        {/* Paid and untouched: the customer has been charged and is waiting on a drink
            nobody has started. Highlighted because this is the column that should never sit
            still. */}
        <QueueColumn
          title="New — Paid"
          accent="bg-blue-500"
          orders={paid}
          isLoading={isLoadingRole || paidQuery.isFetching}
          emptyLabel="No new paid orders."
          renderCard={(order) => (
            <OrderCard
              key={order.id}
              order={order}
              isBusy={isBusy}
              highlight
              actionLabel="Start Preparing"
              onAction={() => handleStartPreparing(order)}
              onOpen={() => setDetailOrder(order)}
            />
          )}
        />

        <QueueColumn
          title="Preparing"
          accent="bg-violet-500"
          orders={preparing}
          isLoading={isLoadingRole || preparingQuery.isFetching}
          emptyLabel="Nothing on the bar."
          renderCard={(order) => (
            <OrderCard
              key={order.id}
              order={order}
              isBusy={isBusy}
              actionLabel={
                order.fulfillmentMethod === "DELIVERY"
                  ? "Out for Delivery"
                  : "Mark Completed"
              }
              onAction={() => handleComplete(order)}
              onOpen={() => setDetailOrder(order)}
            />
          )}
        />

        {/* With a courier: made and paid for, but not yet in the customer's hands. Without
            this column a delivery order would look finished the moment it left the bar. */}
        <QueueColumn
          title="Out for Delivery"
          accent="bg-cyan-500"
          orders={outForDelivery}
          isLoading={isLoadingRole || outForDeliveryQuery.isFetching}
          emptyLabel="Nothing out for delivery."
          renderCard={(order) => (
            <OrderCard
              key={order.id}
              order={order}
              isBusy={isBusy}
              actionLabel="Mark Delivered"
              onAction={() => handleDelivered(order)}
              onOpen={() => setDetailOrder(order)}
            />
          )}
        />

        <QueueColumn
          title="Completed"
          accent="bg-green-500"
          orders={completed}
          isLoading={isLoadingRole || completedQuery.isFetching}
          emptyLabel="No completed orders yet."
          renderCard={(order) => (
            <OrderCard key={order.id} order={order} onOpen={() => setDetailOrder(order)} />
          )}
        />
      </div>

      {/* Cancelled orders are a record, not work — kept off the board so the four live
          columns stay readable, but one click away. */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <button
          type="button"
          onClick={() => setShowCancelled((prev) => !prev)}
          aria-expanded={showCancelled}
          className="flex w-full items-center gap-2 p-4 text-left"
        >
          <span className="h-2.5 w-6 rounded-full bg-red-500" />
          <h3 className="text-base font-bold text-gray-900">Cancelled</h3>
          <span className="text-sm text-gray-400">
            ({cancelledQuery.data?.totalElements ?? 0})
          </span>
          <ChevronDown
            className={cn(
              "ml-auto h-4 w-4 text-gray-400 transition-transform",
              showCancelled && "rotate-180"
            )}
          />
        </button>
        {showCancelled ? (
          <div className="grid grid-cols-1 gap-4 border-t border-gray-100 p-4 md:grid-cols-2 xl:grid-cols-4">
            {cancelled.length === 0 ? (
              <p className="text-sm text-gray-400">No cancelled orders.</p>
            ) : (
              cancelled.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onOpen={() => setDetailOrder(order)}
                />
              ))
            )}
          </div>
        ) : null}
      </div>

      <FormModal
        open={cashOrder !== null}
        onOpenChange={(open) => {
          if (!open) setCashOrder(null);
        }}
        title="Take Cash Payment"
        submitLabel="Confirm"
        onSubmit={handlePayCash}
        isLoading={isPaying}
      >
        <ModalGrid>
          <FormInput
            label="Total Due"
            value={cashOrder ? money(cashOrder.totalAmount) : ""}
            readOnly
          />
          <FormInput
            label="Amount Tendered (USD)"
            type="number"
            value={amountTendered}
            onChange={(e) => setAmountTendered(e.target.value)}
            required
          />
          <FormInput
            label="Change Due"
            value={
              cashOrder && Number(amountTendered) >= Number(cashOrder.totalAmount)
                ? money(Number(amountTendered) - Number(cashOrder.totalAmount))
                : "-"
            }
            readOnly
          />
        </ModalGrid>
      </FormModal>

      {/* Open from any column. Read-only: the board's own buttons are the only way to move an
          order along, so this is purely the full record of one order. */}
      <DetailModal
        open={detailOrder !== null}
        onOpenChange={(open) => {
          if (!open) setDetailOrder(null);
        }}
        title="Order Detail"
      >
        {detailOrder && (
          <div className="admin_modal_form_wrap">
            <DetailGrid>
              <DetailItem label="Order">
                <span className="font-mono">
                  #{detailOrder.id.slice(0, 8).toUpperCase()}
                </span>
              </DetailItem>
              <DetailItem label="Status">
                <span
                  className={cn(
                    "inline-block rounded-full px-3 py-1 text-xs font-semibold",
                    STATUS_CLASSES[detailOrder.status]
                  )}
                >
                  {STATUS_LABELS[detailOrder.status]}
                </span>
              </DetailItem>
              <DetailItem label="Customer">
                {detailOrder.customerName ?? "Walk-in"}
              </DetailItem>
              <DetailItem label="Placed">
                {formatDateTime(detailOrder.createdAt)}
              </DetailItem>
              <DetailItem label="Payment Method">
                {detailOrder.paymentMethod ?? "Not chosen yet"}
              </DetailItem>
              <DetailItem label="Paid At">
                {detailOrder.paidAt ? formatDateTime(detailOrder.paidAt) : "Not paid yet"}
              </DetailItem>
              <DetailItem label="Handled By">
                {detailOrder.handledByName
                  ? `${detailOrder.handledByName}${
                      detailOrder.handledByRole ? ` (${detailOrder.handledByRole})` : ""
                    }`
                  : "-"}
              </DetailItem>
              <DetailItem label="Total">{money(detailOrder.totalAmount)}</DetailItem>
              {detailOrder.paymentMethod === "CASH" ? (
                <>
                  <DetailItem label="Amount Tendered">
                    {money(detailOrder.amountTendered)}
                  </DetailItem>
                  <DetailItem label="Change Given">
                    {money(detailOrder.changeDue)}
                  </DetailItem>
                </>
              ) : null}
              {detailOrder.paymentMethod === "BAKONG" ? (
                <DetailItem label="Bakong Amount">
                  {detailOrder.bakongAmount == null
                    ? "-"
                    : `${Number(detailOrder.bakongAmount).toLocaleString()} ${
                        detailOrder.bakongCurrency ?? ""
                      }`}
                </DetailItem>
              ) : null}
            </DetailGrid>

            <OrderFulfillmentDetails order={detailOrder} />
            {detailOrder.note ? (
              <div className="mt-6 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
                <MessageSquareText className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-amber-900">Note from customer</p>
                  <p className="mt-0.5 text-sm whitespace-pre-line wrap-break-word text-amber-900">
                    {detailOrder.note}
                  </p>
                </div>
              </div>
            ) : null}

            <div className="mt-6">
              <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                <ChefHat className="h-4 w-4 text-gray-400" />
                Items ({detailOrder.items.length})
              </h4>
              <div className="space-y-3">
                {detailOrder.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-4 border-b border-dashed border-gray-200 pb-3 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {item.quantity}x {item.productName}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {[
                          item.sizeOptionName,
                          item.sugarLevel && `Sugar ${item.sugarLevel}`,
                          item.iceLevel && `Ice ${item.iceLevel}`,
                          item.milkType && item.milkType !== "NONE" ? item.milkType : null,
                        ]
                          .filter(Boolean)
                          .join(" · ") || "Standard"}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold text-gray-900">
                        {money(item.subtotal)}
                      </p>
                      <p className="text-xs text-gray-400">{money(item.unitPrice)} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </DetailModal>
    </PageShell>
  );
}
