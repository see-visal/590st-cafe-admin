"use client";
import { OrderFulfillmentDetails } from "@/components/common/OrderFulfillmentDetails";
import { OrderEstimateChip, OrderEstimateEditor } from "@/components/common/OrderEstimateEditor";

import { useCallback, useState, type ReactNode } from "react";
import toast from "react-hot-toast";
import {
  Armchair,
  Banknote,
  Bike,
  ChefHat,
  ChevronDown,
  Clock,
  Eye,
  Globe,
  MessageSquareText,
  QrCode,
  ShoppingBag,
  Store,
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
  FormSelect,
  ModalGrid,
  SkeletonBlock,
  StatTile,
  listLoadState,
  MoneyField,
} from "@/components/common/AdminKit";
import { apiErrorMessage } from "@/store/api/baseApi";
import {
  useCancelBaristaOrderMutation,
  useCompleteBaristaOrderMutation,
  useDispatchBaristaOrderMutation,
  useMarkDeliveredBaristaOrderMutation,
  useCollectBaristaCashMutation,
  useListAllBaristaOrdersQuery,
  usePayOrderCashMutation,
  useSetBaristaOrderDeliveryFeeMutation,
  useSetBaristaOrderEstimatedTimeMutation,
  useStartPreparingBaristaOrderMutation,
} from "@/store/api/baristaOrderApi";
import {
  useCancelOrderMutation,
  useCollectCashMutation,
  useCompleteOrderMutation,
  useDispatchAdminOrderMutation,
  useMarkDeliveredAdminOrderMutation,
  useListOrdersQuery,
  usePayAdminOrderCashMutation,
  useSetOrderDeliveryFeeMutation,
  useSetOrderEstimatedTimeMutation,
  useStartPreparingOrderMutation,
} from "@/store/api/orderApi";
import { useExchangeRate } from "@/hooks/useExchangeRate";
import { useCurrentRole } from "@/store/api/useCurrentRole";
import { useGetCurrentUserQuery } from "@/store/api/authApi";
import { useStaffOrderAlerts } from "@/hooks/useStaffOrderAlerts";
import type { Currency, OrderResponse, OrderStatus } from "@/store/api/types";
import { cn, formatByCurrency, formatLevel, fulfillmentLabel, humanise, timeAgo, titleCase } from "@/lib/utils";
import { InvoiceActions, PrintInvoiceIconButton, toastPaidWithInvoice } from "@/components/common/InvoiceActions";
import { useOrderInvoice } from "@/hooks/useOrderInvoice";
import { buildCashPaymentSchema, firstIssueMessage } from "@/lib/validation";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { usePersistentState } from "@/hooks/usePersistentState";

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

const STATUS_CLASSES: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  PAID: "bg-blue-100 text-blue-700",
  PREPARING: "bg-violet-100 text-violet-700",
  OUT_FOR_DELIVERY: "bg-cyan-100 text-cyan-700",
  COMPLETED: "bg-green-100 text-green-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

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
  hint,
  secondaryLabel,
  onSecondary,
}: {
  order: OrderResponse;
  actionLabel?: string;
  secondaryLabel?: string;
  onSecondary?: () => void;
  hint?: string;
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
        <button
          type="button"
          onClick={onOpen}
          className="group min-w-0 text-left"
          aria-label={`View order ${order.id.slice(0, 8).toUpperCase()}`}
        >
          <h4 className="inline-flex items-center gap-1.5 text-base font-bold text-gray-900 group-hover:underline">
            {order.customerName ? titleCase(order.customerName) : "Walk-in"}
            <Eye className="h-3.5 w-3.5 shrink-0 text-gray-400" />
          </h4>
          <p className="font-mono text-xs text-gray-400">
            #{order.id.slice(0, 8).toUpperCase()}
          </p>
        </button>
        <div className="flex items-center gap-2">
          <PrintInvoiceIconButton order={order} />
          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold",
              STATUS_CLASSES[order.status]
            )}
          >
            {STATUS_LABELS[order.status]}
          </span>
          {order.fulfillmentMethod === "DELIVERY" && order.deliveryFeeSetAt == null && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
              Fee needed
            </span>
          )}
          {order.paymentMethod === "CASH" &&
            order.paidAt == null &&
            order.status !== "PENDING" &&
            order.status !== "CANCELLED" && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                Cash due
              </span>
            )}
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

      <div className="mt-3 flex flex-wrap gap-1.5">
        <OrderChip icon={order.customerId ? Globe : Store}>{order.customerId ? "Online" : "Walk-in"}</OrderChip>
        {order.fulfillmentMethod ? (
          <OrderChip icon={order.fulfillmentMethod === "DELIVERY" ? Bike : order.fulfillmentMethod === "DINE_IN" ? Armchair : ShoppingBag}>
            {fulfillmentLabel(order)}
          </OrderChip>
        ) : null}
        <OrderChip icon={order.paymentMethod === "BAKONG" ? QrCode : Banknote}>
          {order.paymentMethod ? humanise(order.paymentMethod) : "Payment not chosen"}
        </OrderChip>
        <OrderEstimateChip order={order} />
      </div>

      <div className="mt-4 space-y-3">
        {order.items.map((item) => (
          <div key={item.id} className="border-b border-dashed border-gray-200 pb-3">
            <p className="text-xs font-semibold text-gray-900">
              {[
                item.variantName ? humanise(item.variantName) : null,
                item.sugarLevel && `Sugar ${formatLevel(item.sugarLevel)}`,
                item.iceLevel && `Ice ${formatLevel(item.iceLevel)}`,
                item.milkType && item.milkType !== "NONE" ? humanise(item.milkType) : null,
                ...item.extras.map((extra) => titleCase(extra.name)),
              ]
                .filter(Boolean)
                .join(" · ") || "Standard"}
            </p>
            <div className="mt-1 flex items-center justify-between text-sm">
              <span className="text-gray-500">
                <span className="font-bold text-gray-900">{item.quantity}x</span>{" "}
                {titleCase(item.productName)}
              </span>
              <span className="font-bold text-gray-900">{money(item.subtotal)}</span>
            </div>
          </div>
        ))}
      </div>

      <OrderFulfillmentDetails order={order} />
      {order.note ? (
        <div className="mt-3 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5">
          <MessageSquareText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
          <p className="min-w-0 text-xs font-medium whitespace-pre-line wrap-break-word text-amber-900">
            {order.note}
          </p>
        </div>
      ) : null}

      <div className="mt-4 flex flex-col items-end gap-3">
        <p className="text-sm text-gray-500">
          Total : <span className="font-bold text-gray-900">{money(order.totalAmount)}</span>
        </p>
        {actionLabel ? (
          <div className="flex flex-wrap justify-end gap-2">
            {secondaryLabel ? (
              <button
                type="button"
                onClick={onSecondary}
                disabled={isBusy}
                className="btn_outline_black text-xs font-medium disabled:opacity-50"
              >
                {secondaryLabel}
              </button>
            ) : null}
            <button
              type="button"
              onClick={onAction}
              disabled={isBusy}
              className="btn_primary_black text-xs font-medium disabled:opacity-50"
            >
              {actionLabel}
            </button>
          </div>
        ) : hint ? (
          <p className="w-full rounded-lg bg-gray-50 px-3 py-2 text-center text-xs text-gray-500">{hint}</p>
        ) : null}
      </div>
    </article>
  );
}

function OrderChip({ icon: Icon, children }: { icon: typeof Globe; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
      <Icon className="h-3 w-3" />
      {children}
    </span>
  );
}

function QueueColumn({
  title,
  accent,
  orders,
  isLoading,
  emptyLabel,
  renderCard,
  fullWidth = false,
}: {
  title: string;
  accent: string;
  orders: OrderResponse[];
  isLoading: boolean;
  emptyLabel: string;
  renderCard: (order: OrderResponse) => React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div className={cn(fullWidth && "col-span-full")}>
      <div className="mb-4 flex items-center gap-2">
        <span className={cn("h-2.5 w-6 rounded-full", accent)} />
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
        <span className="text-sm text-gray-400">({orders.length})</span>
      </div>
      <div className="space-y-4">
        {isLoading ? (
          <div role="status" aria-label={`Loading ${title}`} className="space-y-4">
            {[0, 1].map((i) => (
              <div key={i} className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
                <SkeletonBlock className="h-5 w-2/3" />
                <SkeletonBlock className="h-3 w-1/3" />
                <SkeletonBlock className="h-4 w-full" />
                <SkeletonBlock className="ml-auto h-9 w-32" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <p className="py-8 text-sm text-gray-400">{emptyLabel}</p>
        ) : fullWidth ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">{orders.map(renderCard)}</div>
        ) : (
          orders.map(renderCard)
        )}
      </div>
    </div>
  );
}

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

export default function BaristaQueueView() {
  const { isAdmin, isBarista, isLoading: isLoadingRole } = useCurrentRole();
  const { confirm, confirmDialog } = useConfirmDialog();
  const roles = { isAdmin, isBarista };

  const pendingQuery = useQueue("PENDING", { ...roles, size: 50, pollingInterval: 15000 });
  const paidQuery = useQueue("PAID", { ...roles, size: 50, pollingInterval: 10000 });
  const preparingQuery = useQueue("PREPARING", { ...roles, size: 50, pollingInterval: 15000 });
  const outForDeliveryQuery = useQueue("OUT_FOR_DELIVERY", { ...roles, size: 50, pollingInterval: 15000 });
  const completedQuery = useQueue("COMPLETED", { ...roles, size: 20, pollingInterval: 30000 });
  const deliveredQuery = useQueue("DELIVERED", { ...roles, size: 20, pollingInterval: 30000 });
  const cancelledQuery = useQueue("CANCELLED", { ...roles, size: 20 });

  useStaffOrderAlerts(
    useCallback(() => {
      void pendingQuery.refetch();
      void paidQuery.refetch();
      void preparingQuery.refetch();
      void outForDeliveryQuery.refetch();
      void completedQuery.refetch();
      void deliveredQuery.refetch();
      void cancelledQuery.refetch();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const { error, refetch } = pendingQuery;

  const [baristaPayCash, { isLoading: isPayingBarista }] = usePayOrderCashMutation();
  const [baristaCollectCash, { isLoading: isCollectingBarista }] = useCollectBaristaCashMutation();
  const [adminPayCash, { isLoading: isPayingAdmin }] = usePayAdminOrderCashMutation();
  const [adminCollectCash, { isLoading: isCollectingAdmin }] = useCollectCashMutation();
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
  const [baristaSetDeliveryFee, { isLoading: isSettingFeeBarista }] =
    useSetBaristaOrderDeliveryFeeMutation();
  const [adminSetDeliveryFee, { isLoading: isSettingFeeAdmin }] = useSetOrderDeliveryFeeMutation();
  const [baristaSetEstimate, { isLoading: isSettingEstimateBarista }] =
    useSetBaristaOrderEstimatedTimeMutation();
  const [adminSetEstimate, { isLoading: isSettingEstimateAdmin }] = useSetOrderEstimatedTimeMutation();
  const { printInvoice } = useOrderInvoice();

  const { data: currentUser } = useGetCurrentUserQuery();
  const cashMutationFor = (order: OrderResponse) =>
    order.paymentMethod === "CASH"
      ? isAdmin ? adminCollectCash : baristaCollectCash
      : isAdmin ? adminPayCash : baristaPayCash;
  const canCancel = (order: OrderResponse) =>
    isAdmin || (order.customerId == null && order.handledById === currentUser?.id);

  const awaitingPaymentStep = (
    order: OrderResponse
  ):
    | { kind: "fee" | "prepare" | "cash"; label: string }
    | { kind: "waiting"; hint: string } => {
    if (order.fulfillmentMethod === "DELIVERY" && order.deliveryFeeSetAt == null) {
      return { kind: "fee", label: "Set Delivery Fee" };
    }
    if (order.paymentMethod === "BAKONG") {
      return { kind: "waiting", hint: "Waiting for the customer's QR payment — it confirms automatically." };
    }
    if (order.paymentMethod === "CASH") {
      return order.customerId != null
        ? { kind: "prepare", label: "Start Preparing" }
        : { kind: "cash", label: "Take Cash" };
    }
    if (order.customerId == null && order.handledById === currentUser?.id) {
      return { kind: "cash", label: "Take Cash" };
    }
    return { kind: "waiting", hint: "Waiting for the customer to choose how to pay." };
  };
  const cancelOrder = isAdmin ? adminCancel : baristaCancel;
  const startPreparing = isAdmin ? adminStartPreparing : baristaStartPreparing;
  const completeOrder = isAdmin ? adminComplete : baristaComplete;
  const dispatchOrder = isAdmin ? adminDispatch : baristaDispatch;
  const deliverOrder = isAdmin ? adminDeliver : baristaDeliver;
  const setDeliveryFee = isAdmin ? adminSetDeliveryFee : baristaSetDeliveryFee;
  const isSettingFee = isSettingFeeAdmin || isSettingFeeBarista;
  const setEstimate = isAdmin ? adminSetEstimate : baristaSetEstimate;
  const isSettingEstimate = isSettingEstimateAdmin || isSettingEstimateBarista;

  const isPaying = isPayingAdmin || isPayingBarista || isCollectingAdmin || isCollectingBarista;
  const isBusy =
    isPaying ||
    isCancellingAdmin ||
    isCancellingBarista ||
    isStartingAdmin ||
    isStartingBarista ||
    isCompletingAdmin ||
    isCompletingBarista ||
    isDispatchingAdmin ||
    isDispatchingBarista ||
    isDeliveringAdmin ||
    isDeliveringBarista ||
    isSettingFee;

  const { exchangeRate } = useExchangeRate();
  const khrPerUsdRate = exchangeRate ? Number(exchangeRate.khrPerUsdRate) : null;

  const [cashOrder, setCashOrder] = useState<OrderResponse | null>(null);
  const [amountTendered, setAmountTendered] = useState("");
  const [cashCurrency, setCashCurrency] = useState<Currency>("USD");
  const [detailOrder, setDetailOrder] = useState<OrderResponse | null>(null);
  const [showCancelled, setShowCancelled] = usePersistentState("barista-queue:showCancelled", false);

  const payableDue = (order: OrderResponse, targetCurrency: Currency): number =>
    targetCurrency === "USD" || !khrPerUsdRate
      ? Number(order.totalAmount)
      : Number(order.totalAmount) * khrPerUsdRate;

  const exactAmountFor = (order: OrderResponse, targetCurrency: Currency): string => {
    const due = payableDue(order, targetCurrency);
    return targetCurrency === "KHR" ? String(Math.round(due)) : due.toFixed(2);
  };

  const openCashModal = (order: OrderResponse) => {
    setCashOrder(order);
    setCashCurrency("USD");
    setAmountTendered(exactAmountFor(order, "USD"));
  };

  const handleCashCurrencyChange = (next: Currency) => {
    setCashCurrency(next);
    if (cashOrder) setAmountTendered(exactAmountFor(cashOrder, next));
  };

  const cashDue = cashOrder ? payableDue(cashOrder, cashCurrency) : 0;

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
    const parsed = buildCashPaymentSchema(cashDue).safeParse({
      currency: cashCurrency,
      amountTendered,
    });
    if (!parsed.success) {
      toast.error(firstIssueMessage(parsed.error));
      return;
    }
    try {
      const updated = await cashMutationFor(cashOrder)({
        id: cashOrder.id,
        body: parsed.data,
      }).unwrap();
      toastPaidWithInvoice(
        Number(updated.changeDue) > 0
          ? `Paid. Change: ${formatByCurrency(updated.changeDue, updated.changeCurrency ?? cashCurrency)}`
          : "Payment recorded",
        updated.id,
        printInvoice
      );
      setCashOrder(null);
    } catch (err) {
      toast.error(apiErrorMessage(err as never, "Could not record the payment."));
    }
  };

  const handleCancel = async (order: OrderResponse) => {
    const confirmed = await confirm({
      title: "Cancel order",
      description: `Cancel order #${order.id.slice(0, 8).toUpperCase()}? Only unpaid orders can be cancelled.`,
      confirmLabel: "Cancel order",
      tone: "danger",
    });
    if (!confirmed) return;
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

  const handleSetDeliveryFee = async (order: OrderResponse, fee: number) => {
    try {
      await setDeliveryFee({ id: order.id, body: { fee } }).unwrap();
      toast.success("Delivery fee saved");
    } catch (err) {
      toast.error(apiErrorMessage(err as never, "Could not save the delivery fee."));
    }
  };

  const handleSetEstimate = async (order: OrderResponse, minutes: number) => {
    try {
      const updated = await setEstimate({ id: order.id, body: { minutes } }).unwrap();
      setDetailOrder((current) => (current?.id === updated.id ? updated : current));
      toast.success(`Estimated time set to ${minutes} min`);
    } catch (err) {
      toast.error(apiErrorMessage(err as never, "Could not save the estimated time."));
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
        <QueueColumn
          title="Awaiting Payment"
          accent="bg-amber-500"
          orders={pending}
          isLoading={isLoadingRole || listLoadState(pendingQuery).isLoading}
          emptyLabel="Nothing waiting to be paid."
          renderCard={(order) => {
            const step = awaitingPaymentStep(order);
            return (
              <OrderCard
                key={order.id}
                order={order}
                isBusy={isBusy}
                actionLabel={step.kind === "waiting" ? undefined : step.label}
                hint={step.kind === "waiting" ? step.hint : undefined}
                onAction={() => {
                  if (step.kind === "fee") setDetailOrder(order);
                  else if (step.kind === "prepare") handleStartPreparing(order);
                  else if (step.kind === "cash") openCashModal(order);
                }}
                secondaryLabel={step.kind === "prepare" ? "Take Cash" : undefined}
                onSecondary={() => openCashModal(order)}
                onCancel={canCancel(order) ? () => handleCancel(order) : undefined}
                onOpen={() => setDetailOrder(order)}
              />
            );
          }}
        />

        <QueueColumn
          title="New — Paid"
          accent="bg-blue-500"
          orders={paid}
          isLoading={isLoadingRole || listLoadState(paidQuery).isLoading}
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
          isLoading={isLoadingRole || listLoadState(preparingQuery).isLoading}
          emptyLabel="Nothing on the bar."
          renderCard={(order) => {
            const needsCash =
              order.paymentMethod === "CASH" &&
              order.paidAt == null &&
              order.fulfillmentMethod !== "DELIVERY";
            return (
              <OrderCard
                key={order.id}
                order={order}
                isBusy={isBusy}
                actionLabel={
                  needsCash
                    ? "Collect Cash"
                    : order.fulfillmentMethod === "DELIVERY"
                      ? "Out for Delivery"
                      : "Mark Completed"
                }
                onAction={() => {
                  if (needsCash) {
                    openCashModal(order);
                  } else {
                    handleComplete(order);
                  }
                }}
                onOpen={() => setDetailOrder(order)}
              />
            );
          }}
        />

        <QueueColumn
          title="Out for Delivery"
          accent="bg-cyan-500"
          orders={outForDelivery}
          isLoading={isLoadingRole || listLoadState(outForDeliveryQuery).isLoading}
          emptyLabel="Nothing out for delivery."
          renderCard={(order) => {
            const needsCash = order.paymentMethod === "CASH" && order.paidAt == null;
            return (
              <OrderCard
                key={order.id}
                order={order}
                isBusy={isBusy}
                actionLabel={needsCash ? "Collect Cash" : "Mark Delivered"}
                onAction={() => {
                  if (needsCash) {
                    openCashModal(order);
                  } else {
                    handleDelivered(order);
                  }
                }}
                onOpen={() => setDetailOrder(order)}
              />
            );
          }}
        />

        <QueueColumn
          fullWidth
          title="Completed"
          accent="bg-green-500"
          orders={completed}
          isLoading={isLoadingRole || listLoadState(completedQuery).isLoading}
          emptyLabel="No completed orders yet."
          renderCard={(order) => (
            <OrderCard key={order.id} order={order} onOpen={() => setDetailOrder(order)} />
          )}
        />
      </div>

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
            value={cashOrder ? formatByCurrency(cashDue, cashCurrency) : ""}
            readOnly
          />
          <FormSelect
            label="Currency"
            value={cashCurrency}
            onChange={(e) => handleCashCurrencyChange(e.target.value as Currency)}
          >
            <option value="USD">USD</option>
            <option value="KHR" disabled={!khrPerUsdRate}>
              KHR{!khrPerUsdRate ? " (rate unavailable)" : ""}
            </option>
          </FormSelect>
          <MoneyField
            label="Amount Tendered"
            currency={cashCurrency}
            value={amountTendered}
            onValueChange={setAmountTendered}
            required
          />
          <FormInput
            label="Change Due"
            value={
              cashOrder && Number(amountTendered) >= cashDue
                ? formatByCurrency(Number(amountTendered) - cashDue, cashCurrency)
                : "-"
            }
            readOnly
          />
        </ModalGrid>
      </FormModal>

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
                {detailOrder.customerName ? titleCase(detailOrder.customerName) : "Walk-in"}
              </DetailItem>
              <DetailItem label="Placed">
                {formatDateTime(detailOrder.createdAt)}
              </DetailItem>
              <DetailItem label="Payment Method">
                {detailOrder.paymentMethod ? humanise(detailOrder.paymentMethod) : "Not chosen yet"}
              </DetailItem>
              <DetailItem label="Paid At">
                {detailOrder.paidAt ? formatDateTime(detailOrder.paidAt) : "Not paid yet"}
              </DetailItem>
              <DetailItem label="Handled By">
                {detailOrder.handledByName
                  ? `${titleCase(detailOrder.handledByName)}${
                      detailOrder.handledByRole ? ` (${humanise(detailOrder.handledByRole)})` : ""
                    }`
                  : "-"}
              </DetailItem>
              <DetailItem label="Total">{money(detailOrder.totalAmount)}</DetailItem>
              {detailOrder.paymentMethod === "CASH" ? (
                <>
                  <DetailItem label="Amount Tendered">
                    {formatByCurrency(detailOrder.amountTendered, detailOrder.amountTenderedCurrency)}
                  </DetailItem>
                  <DetailItem label="Change Given">
                    {formatByCurrency(detailOrder.changeDue, detailOrder.changeCurrency)}
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

            <InvoiceActions order={detailOrder} className="mt-4" />

            <OrderFulfillmentDetails
              order={detailOrder}
              onSetDeliveryFee={(fee) => handleSetDeliveryFee(detailOrder, fee)}
              isSettingFee={isSettingFee}
            />
            <OrderEstimateEditor
              order={detailOrder}
              onSave={(minutes) => handleSetEstimate(detailOrder, minutes)}
              isSaving={isSettingEstimate}
            />
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
                        {item.quantity}x {titleCase(item.productName)}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {[
                          item.variantName ? humanise(item.variantName) : null,
                          item.sugarLevel && `Sugar ${formatLevel(item.sugarLevel)}`,
                          item.iceLevel && `Ice ${formatLevel(item.iceLevel)}`,
                          item.milkType && item.milkType !== "NONE" ? humanise(item.milkType) : null,
                          ...item.extras.map((extra) => titleCase(extra.name)),
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
      {confirmDialog}
    </PageShell>
  );
}
