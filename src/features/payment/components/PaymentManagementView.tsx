"use client";

import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { PageShell } from "@/components/common/PageShell";
import { PageHeader } from "@/components/common/PageHeader";
import {
  AdminTopActions,
  Cell,
  DataCard,
  FormInput,
  FormModal,
  FormSelect,
  ModalGrid,
  PaginationFooter,
  Row,
  SimpleTable,
  StatTile,
  StatusBadge,
  TableState,
  listLoadState,
  MoneyField,
} from "@/components/common/AdminKit";
import { apiErrorMessage } from "@/store/api/baseApi";
import {
  useAcceptBakongFromReceiptMutation,
  useCollectCashMutation,
  useListAwaitingBakongConfirmationQuery,
  useListAwaitingDeliveryFeeQuery,
  useListAwaitingPickupQuery,
  useListDeliveryBoardQuery,
  useMarkDeliveredAdminOrderMutation,
  useSetOrderDeliveryFeeMutation,
} from "@/store/api/orderApi";
import { useExchangeRate } from "@/hooks/useExchangeRate";
import { useCurrentRole } from "@/store/api/useCurrentRole";
import {
  useAcceptBaristaBakongFromReceiptMutation,
  useCollectBaristaCashMutation,
  useListBaristaAwaitingBakongConfirmationQuery,
  useListBaristaAwaitingDeliveryFeeQuery,
  useListBaristaAwaitingPickupQuery,
  useListBaristaDeliveryBoardQuery,
  useMarkDeliveredBaristaOrderMutation,
  useSetBaristaOrderDeliveryFeeMutation,
} from "@/store/api/baristaOrderApi";
import type { Currency, OrderResponse } from "@/store/api/types";
import { formatByCurrency, titleCase } from "@/lib/utils";
import { buildCashPaymentSchema, deliveryFeeSchema, firstIssueMessage } from "@/lib/validation";
import { useDefaultPageSize, useRefreshOptions } from "@/contexts/AdminPreferencesContext";
import { useStaffOrderAlerts } from "@/hooks/useStaffOrderAlerts";
import { usePersistentState } from "@/hooks/usePersistentState";

const DELIVERY_FEE_HEADERS = [
  "No",
  "Order ID",
  "Customer",
  "Address",
  "Distance",
  "Ordered At",
  "Action",
] as const;

const PICKUP_HEADERS = [
  "No",
  "Order ID",
  "Customer",
  "Items",
  "Amount Due",
  "Status",
  "Ordered At",
  "Action",
] as const;

const BAKONG_HEADERS = [
  "No",
  "Order ID",
  "Customer",
  "Items",
  "Amount",
  "Currency",
  "Ordered At",
  "Status",
  "Action",
] as const;

const DELIVERY_BOARD_HEADERS = [
  "No",
  "Order ID",
  "Customer",
  "Address",
  "Payment",
  "Dispatched At",
  "Action",
] as const;

const money = (value: number | null | undefined) =>
  value == null ? "-" : `$${Number(value).toFixed(2)}`;

function formatDistance(meters: number): string {
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`;
}

function formatDateTime(value: string | null) {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const summarise = (order: OrderResponse) =>
  order.items.map((i) => `x${i.quantity} ${titleCase(i.productName)}`).join(", ") || "-";

export default function PaymentManagementView() {
  const [deliveryFeePage, setDeliveryFeePage] = usePersistentState("payments:deliveryFeePage", 1);
  const [pickupPage, setPickupPage] = usePersistentState("payments:pickupPage", 1);
  const [bakongPage, setBakongPage] = usePersistentState("payments:bakongPage", 1);
  const [deliveryBoardPage, setDeliveryBoardPage] = usePersistentState("payments:deliveryBoardPage", 1);
  const size = useDefaultPageSize();
  const refresh = useRefreshOptions();

  // Baristas handle payments too: same screen, served from the barista API.
  const { isAdmin, isBarista } = useCurrentRole();
  const asAdmin = { ...refresh, skip: !isAdmin };
  const asBarista = { ...refresh, skip: !isBarista };

  const adminDeliveryFee = useListAwaitingDeliveryFeeQuery({ page: deliveryFeePage, size }, asAdmin);
  const baristaDeliveryFee = useListBaristaAwaitingDeliveryFeeQuery({ page: deliveryFeePage, size }, asBarista);
  const deliveryFeeQuery = isBarista ? baristaDeliveryFee : adminDeliveryFee;
  const { data: deliveryFeeData, refetch: refetchDeliveryFee } = deliveryFeeQuery;
  const deliveryFeeList = listLoadState(deliveryFeeQuery);

  const adminPickup = useListAwaitingPickupQuery({ page: pickupPage, size }, asAdmin);
  const baristaPickup = useListBaristaAwaitingPickupQuery({ page: pickupPage, size }, asBarista);
  const pickupQuery = isBarista ? baristaPickup : adminPickup;
  const { data: pickupData, refetch: refetchPickup } = pickupQuery;
  const pickupList = listLoadState(pickupQuery);

  const adminBakong = useListAwaitingBakongConfirmationQuery({ page: bakongPage, size }, asAdmin);
  const baristaBakong = useListBaristaAwaitingBakongConfirmationQuery({ page: bakongPage, size }, asBarista);
  const bakongQuery = isBarista ? baristaBakong : adminBakong;
  const { data: bakongData, refetch: refetchBakong } = bakongQuery;
  const bakongList = listLoadState(bakongQuery);

  const adminDeliveryBoard = useListDeliveryBoardQuery({ page: deliveryBoardPage, size }, asAdmin);
  const baristaDeliveryBoard = useListBaristaDeliveryBoardQuery({ page: deliveryBoardPage, size }, asBarista);
  const deliveryBoardQuery = isBarista ? baristaDeliveryBoard : adminDeliveryBoard;
  const { data: deliveryBoardData, refetch: refetchDeliveryBoard } = deliveryBoardQuery;
  const deliveryBoardList = listLoadState(deliveryBoardQuery);

  useStaffOrderAlerts(
    useCallback(() => {
      void refetchDeliveryFee();
      void refetchPickup();
      void refetchBakong();
      void refetchDeliveryBoard();
    }, [refetchDeliveryFee, refetchPickup, refetchBakong, refetchDeliveryBoard])
  );

  const [adminCollectCash, adminCollectState] = useCollectCashMutation();
  const [baristaCollectCash, baristaCollectState] = useCollectBaristaCashMutation();
  const [adminSetFee, adminFeeState] = useSetOrderDeliveryFeeMutation();
  const [baristaSetFee, baristaFeeState] = useSetBaristaOrderDeliveryFeeMutation();
  const [adminMarkDelivered, adminDeliveredState] = useMarkDeliveredAdminOrderMutation();
  const [baristaMarkDelivered, baristaDeliveredState] = useMarkDeliveredBaristaOrderMutation();
  const collectCash = isBarista ? baristaCollectCash : adminCollectCash;
  const setDeliveryFee = isBarista ? baristaSetFee : adminSetFee;
  const markDelivered = isBarista ? baristaMarkDelivered : adminMarkDelivered;
  const isCollecting = adminCollectState.isLoading || baristaCollectState.isLoading;
  const isSettingFee = adminFeeState.isLoading || baristaFeeState.isLoading;
  const isMarkingDelivered = adminDeliveredState.isLoading || baristaDeliveredState.isLoading;
  const [adminAcceptReceipt, adminReceiptState] = useAcceptBakongFromReceiptMutation();
  const [baristaAcceptReceipt, baristaReceiptState] = useAcceptBaristaBakongFromReceiptMutation();
  const acceptFromReceipt = isBarista ? baristaAcceptReceipt : adminAcceptReceipt;
  const isAcceptingReceipt = adminReceiptState.isLoading || baristaReceiptState.isLoading;

  const [receiptOrder, setReceiptOrder] = useState<OrderResponse | null>(null);

  const bakongDue = (order: OrderResponse) =>
    order.bakongAmount != null
      ? formatByCurrency(order.bakongAmount, order.bakongCurrency ?? "USD")
      : money(order.totalAmount);

  const handleAcceptFromReceipt = async () => {
    if (!receiptOrder) return;
    try {
      await acceptFromReceipt(receiptOrder.id).unwrap();
      toast.success("QR payment confirmed — the order is ready to prepare.");
      setReceiptOrder(null);
    } catch (err) {
      toast.error(apiErrorMessage(err as never, "Could not confirm the payment."));
    }
  };

  const [feeOrder, setFeeOrder] = useState<OrderResponse | null>(null);
  const [feeInput, setFeeInput] = useState("");

  const openFeeModal = (order: OrderResponse) => {
    setFeeOrder(order);
    setFeeInput("");
  };

  const handleSetDeliveryFee = async () => {
    if (!feeOrder) return;
    const parsed = deliveryFeeSchema.safeParse({ fee: feeInput });
    if (!parsed.success) {
      toast.error(firstIssueMessage(parsed.error));
      return;
    }
    try {
      await setDeliveryFee({ id: feeOrder.id, body: parsed.data }).unwrap();
      toast.success("Delivery fee set — the customer can now choose how to pay.");
      setFeeOrder(null);
    } catch (err) {
      toast.error(apiErrorMessage(err as never, "Could not save the delivery fee."));
    }
  };

  const { khrPerUsdRate } = useExchangeRate();

  const [cashOrder, setCashOrder] = useState<OrderResponse | null>(null);
  const [amountTendered, setAmountTendered] = useState("");
  const [currency, setCurrency] = useState<Currency>("USD");

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
    setCurrency("USD");
    setAmountTendered(exactAmountFor(order, "USD"));
  };

  const handleCashCurrencyChange = (next: Currency) => {
    setCurrency(next);
    if (cashOrder) setAmountTendered(exactAmountFor(cashOrder, next));
  };

  const cashDue = cashOrder ? payableDue(cashOrder, currency) : 0;

  const handleCollectCash = async () => {
    if (!cashOrder) return;
    const parsed = buildCashPaymentSchema(cashDue).safeParse({
      currency,
      amountTendered,
    });
    if (!parsed.success) {
      toast.error(firstIssueMessage(parsed.error));
      return;
    }

    try {
      const updated = await collectCash({
        id: cashOrder.id,
        body: parsed.data,
      }).unwrap();
      toast.success(
        updated.changeDue && Number(updated.changeDue) > 0
          ? `Paid. Change due: ${formatByCurrency(updated.changeDue, updated.changeCurrency ?? currency)}`
          : "Payment collected"
      );
      setCashOrder(null);
    } catch (err) {
      toast.error(apiErrorMessage(err as never, "Could not record the cash payment."));
    }
  };

  const handleMarkDelivered = async (order: OrderResponse) => {
    try {
      await markDelivered(order.id).unwrap();
      toast.success("Order marked delivered");
    } catch (err) {
      toast.error(apiErrorMessage(err as never, "Could not mark the order delivered."));
    }
  };

  const deliveryFeeOrders = deliveryFeeData?.content ?? [];
  const pickupOrders = pickupData?.content ?? [];
  const bakongOrders = bakongData?.content ?? [];
  const deliveryBoardOrders = deliveryBoardData?.content ?? [];

  const pickupTotal = pickupOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
  const bakongTotal = bakongOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
  const unpaidOnBoard = deliveryBoardOrders.filter(
    (o) => o.paymentMethod === "CASH" && o.paidAt == null
  ).length;

  return (
    <PageShell>
      <PageHeader
        title="Payments"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Payments" },
        ]}
        rightSlot={<AdminTopActions />}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatTile
          title="Awaiting Delivery Fee"
          value={String(deliveryFeeData?.totalElements ?? 0)}
          hint="Customer pinned a location — quote a fee to unlock payment"
          tone={(deliveryFeeData?.totalElements ?? 0) > 0 ? "orange" : "gray"}
        />
        <StatTile
          title="Awaiting Cash Pickup"
          value={String(pickupData?.totalElements ?? 0)}
          hint="Unpaid cash orders, including ones being prepared"
          tone={(pickupData?.totalElements ?? 0) > 0 ? "orange" : "gray"}
        />
        <StatTile title="Cash Due (this page)" value={money(pickupTotal)} tone="green" />
        <StatTile
          title="Awaiting QR Payment"
          value={String(bakongData?.totalElements ?? 0)}
          hint="Confirmed automatically once the customer pays"
          tone={(bakongData?.totalElements ?? 0) > 0 ? "orange" : "gray"}
        />
        <StatTile title="QR Due (this page)" value={money(bakongTotal)} tone="green" />
        <StatTile
          title="Out for Delivery"
          value={String(deliveryBoardData?.totalElements ?? 0)}
          hint={unpaidOnBoard > 0 ? `${unpaidOnBoard} still owe cash on arrival` : "All out-for-delivery orders are paid"}
          tone={unpaidOnBoard > 0 ? "orange" : "gray"}
        />
      </div>

      <DataCard
        title="Awaiting Delivery Fee"
        meta={`Waiting: ${deliveryFeeData?.totalElements ?? 0}`}
      >
        <SimpleTable headers={[...DELIVERY_FEE_HEADERS]}>
          <TableState
            colSpan={DELIVERY_FEE_HEADERS.length}
            isLoading={deliveryFeeList.isLoading}
            error={deliveryFeeList.error}
            isEmpty={deliveryFeeOrders.length === 0}
            emptyLabel="No delivery orders are waiting for a fee."
            onRetry={refetchDeliveryFee}
          />
          {deliveryFeeList.showRows &&
            deliveryFeeOrders.map((order, index) => (
              <Row key={order.id} striped={index % 2 === 1}>
                <Cell>{(deliveryFeePage - 1) * size + index + 1}</Cell>
                <Cell className="font-mono text-xs">#{order.id.slice(0, 8)}</Cell>
                <Cell>{order.customerName ? titleCase(order.customerName) : "Walk-in"}</Cell>
                <Cell className="max-w-[16rem] truncate">{order.deliveryAddress || "-"}</Cell>
                <Cell>
                  {order.distanceMeters != null ? formatDistance(Number(order.distanceMeters)) : "-"}
                </Cell>
                <Cell>{formatDateTime(order.createdAt)}</Cell>
                <Cell>
                  <button
                    type="button"
                    className="btn_primary_yellow text-xs"
                    onClick={() => openFeeModal(order)}
                    disabled={isSettingFee}
                  >
                    Set Fee
                  </button>
                </Cell>
              </Row>
            ))}
        </SimpleTable>
        <PaginationFooter
          page={deliveryFeeData?.page ?? deliveryFeePage}
          totalPages={deliveryFeeData?.totalPages ?? 1}
          size={size}
          totalElements={deliveryFeeData?.totalElements}
          onPageChange={setDeliveryFeePage}
        />
      </DataCard>

      <DataCard
        title="Cash on Pickup"
        meta={`Waiting: ${pickupData?.totalElements ?? 0}`}
      >
        <SimpleTable headers={[...PICKUP_HEADERS]}>
          <TableState
            colSpan={PICKUP_HEADERS.length}
            isLoading={pickupList.isLoading}
            error={pickupList.error}
            isEmpty={pickupOrders.length === 0}
            emptyLabel="No unpaid cash orders."
            onRetry={refetchPickup}
          />
          {pickupList.showRows &&
            pickupOrders.map((order, index) => (
              <Row key={order.id} striped={index % 2 === 1}>
                <Cell>{(pickupPage - 1) * size + index + 1}</Cell>
                <Cell className="font-mono text-xs">#{order.id.slice(0, 8)}</Cell>
                <Cell>{order.customerName ? titleCase(order.customerName) : "Walk-in"}</Cell>
                <Cell className="max-w-[16rem] truncate">{summarise(order)}</Cell>
                <Cell className="font-semibold">{money(order.totalAmount)}</Cell>
                <Cell>
                  <StatusBadge
                    label={order.status === "PREPARING" ? "Preparing" : "Waiting"}
                    tone={order.status === "PREPARING" ? "info" : "warning"}
                  />
                </Cell>
                <Cell>{formatDateTime(order.createdAt)}</Cell>
                <Cell>
                  <button
                    type="button"
                    className="btn_primary_yellow text-xs"
                    onClick={() => openCashModal(order)}
                    disabled={isCollecting}
                  >
                    Collect Cash
                  </button>
                </Cell>
              </Row>
            ))}
        </SimpleTable>
        <PaginationFooter
          page={pickupData?.page ?? pickupPage}
          totalPages={pickupData?.totalPages ?? 1}
          size={size}
          totalElements={pickupData?.totalElements}
          onPageChange={setPickupPage}
        />
      </DataCard>

      <DataCard
        title="Bakong QR Payments"
        meta={`Auto-confirming: ${bakongData?.totalElements ?? 0}`}
      >
        <SimpleTable headers={[...BAKONG_HEADERS]}>
          <TableState
            colSpan={BAKONG_HEADERS.length}
            isLoading={bakongList.isLoading}
            error={bakongList.error}
            isEmpty={bakongOrders.length === 0}
            emptyLabel="No QR payments are pending."
            onRetry={refetchBakong}
          />
          {bakongList.showRows &&
            bakongOrders.map((order, index) => (
              <Row key={order.id} striped={index % 2 === 1}>
                <Cell>{(bakongPage - 1) * size + index + 1}</Cell>
                <Cell className="font-mono text-xs">#{order.id.slice(0, 8)}</Cell>
                <Cell>{order.customerName ? titleCase(order.customerName) : "Walk-in"}</Cell>
                <Cell className="max-w-[16rem] truncate">{summarise(order)}</Cell>
                <Cell className="font-semibold">{bakongDue(order)}</Cell>
                <Cell>
                  <StatusBadge
                    label={order.bakongCurrency ?? "USD"}
                    tone="info"
                  />
                </Cell>
                <Cell>{formatDateTime(order.createdAt)}</Cell>
                <Cell>
                  <StatusBadge label="Waiting for QR payment" tone="warning" />
                </Cell>
                <Cell>
                  <button
                    type="button"
                    className="btn_primary_yellow text-xs"
                    onClick={() => setReceiptOrder(order)}
                    disabled={isAcceptingReceipt}
                  >
                    Confirm from receipt
                  </button>
                </Cell>
              </Row>
            ))}
        </SimpleTable>
        <PaginationFooter
          page={bakongData?.page ?? bakongPage}
          totalPages={bakongData?.totalPages ?? 1}
          size={size}
          totalElements={bakongData?.totalElements}
          onPageChange={setBakongPage}
        />
      </DataCard>

      <DataCard
        title="Delivery Board"
        meta={`Out with a courier: ${deliveryBoardData?.totalElements ?? 0}`}
      >
        <SimpleTable headers={[...DELIVERY_BOARD_HEADERS]}>
          <TableState
            colSpan={DELIVERY_BOARD_HEADERS.length}
            isLoading={deliveryBoardList.isLoading}
            error={deliveryBoardList.error}
            isEmpty={deliveryBoardOrders.length === 0}
            emptyLabel="Nothing is out for delivery."
            onRetry={refetchDeliveryBoard}
          />
          {deliveryBoardList.showRows &&
            deliveryBoardOrders.map((order, index) => {
              const needsCash = order.paymentMethod === "CASH" && order.paidAt == null;
              return (
                <Row key={order.id} striped={index % 2 === 1}>
                  <Cell>{(deliveryBoardPage - 1) * size + index + 1}</Cell>
                  <Cell className="font-mono text-xs">#{order.id.slice(0, 8)}</Cell>
                  <Cell>{order.customerName ? titleCase(order.customerName) : "Walk-in"}</Cell>
                  <Cell className="max-w-[16rem] truncate">{order.deliveryAddress || "-"}</Cell>
                  <Cell>
                    <StatusBadge
                      label={needsCash ? "Cash due on arrival" : "Paid"}
                      tone={needsCash ? "warning" : "success"}
                    />
                  </Cell>
                  <Cell>{formatDateTime(order.dispatchedAt)}</Cell>
                  <Cell>
                    <button
                      type="button"
                      className="btn_primary_yellow text-xs"
                      onClick={() => (needsCash ? openCashModal(order) : handleMarkDelivered(order))}
                      disabled={needsCash ? isCollecting : isMarkingDelivered}
                    >
                      {needsCash ? "Collect Cash" : "Mark Delivered"}
                    </button>
                  </Cell>
                </Row>
              );
            })}
        </SimpleTable>
        <PaginationFooter
          page={deliveryBoardData?.page ?? deliveryBoardPage}
          totalPages={deliveryBoardData?.totalPages ?? 1}
          size={size}
          totalElements={deliveryBoardData?.totalElements}
          onPageChange={setDeliveryBoardPage}
        />
      </DataCard>

      <FormModal
        open={feeOrder !== null}
        onOpenChange={(open) => {
          if (!open) setFeeOrder(null);
        }}
        title="Set Delivery Fee"
        submitLabel="Save Fee"
        onSubmit={handleSetDeliveryFee}
        isLoading={isSettingFee}
      >
        <ModalGrid>
          <FormInput label="Customer" value={feeOrder?.customerName ? titleCase(feeOrder.customerName) : "Walk-in"} readOnly />
          <FormInput label="Address" value={feeOrder?.deliveryAddress ?? "-"} readOnly />
          <FormInput
            label="Distance"
            value={feeOrder?.distanceMeters != null ? formatDistance(Number(feeOrder.distanceMeters)) : "Not available"}
            readOnly
          />
          <FormInput label="Items Subtotal" value={feeOrder ? money(feeOrder.totalAmount) : ""} readOnly />
          <MoneyField
            label="Delivery Fee (USD)"
            value={feeInput}
            onValueChange={setFeeInput}
            required
          />
          <FormInput
            label="Customer's Grand Total"
            value={
              feeOrder && feeInput.trim() && Number.isFinite(Number(feeInput))
                ? money(Number(feeOrder.totalAmount) + Number(feeInput))
                : "-"
            }
            readOnly
          />
        </ModalGrid>
        {feeOrder?.deliveryLatitude != null && feeOrder?.deliveryLongitude != null && (
          <a
            href={`https://www.google.com/maps?q=${feeOrder.deliveryLatitude},${feeOrder.deliveryLongitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-xs underline"
          >
            View pinned location on map
          </a>
        )}
      </FormModal>

      <FormModal
        open={cashOrder !== null}
        onOpenChange={(open) => {
          if (!open) setCashOrder(null);
        }}
        title="Collect Cash"
        submitLabel="Confirm Payment"
        onSubmit={handleCollectCash}
        isLoading={isCollecting}
      >
        <ModalGrid>
          <FormInput
            label="Total Due"
            value={cashOrder ? formatByCurrency(cashDue, currency) : ""}
            readOnly
          />
          <FormSelect
            label="Currency"
            value={currency}
            onChange={(e) => handleCashCurrencyChange(e.target.value as Currency)}
          >
            <option value="USD">USD</option>
            <option value="KHR" disabled={!khrPerUsdRate}>
              KHR{!khrPerUsdRate ? " (rate unavailable)" : ""}
            </option>
          </FormSelect>
          <MoneyField
            label="Amount Tendered"
            currency={currency}
            value={amountTendered}
            onValueChange={setAmountTendered}
            required
          />
          <FormInput
            label="Change Due"
            value={
              cashOrder && Number(amountTendered) >= cashDue
                ? formatByCurrency(Number(amountTendered) - cashDue, currency)
                : "-"
            }
            readOnly
          />
        </ModalGrid>
      </FormModal>

      <FormModal
        open={receiptOrder !== null}
        onOpenChange={(open) => {
          if (!open) setReceiptOrder(null);
        }}
        title="Confirm QR Payment from Receipt"
        submitLabel="Mark as Paid"
        onSubmit={handleAcceptFromReceipt}
        isLoading={isAcceptingReceipt}
      >
        <p className="mb-4 text-sm text-gray-600">
          Use this only when automatic confirmation is paused. Check the customer&apos;s bank receipt (or your
          Bakong account) shows this exact amount paid to 590st Cafe before you mark it paid. Your name is
          recorded in the order history.
        </p>
        <ModalGrid>
          <FormInput label="Order" value={receiptOrder ? `#${receiptOrder.id.slice(0, 8)}` : ""} readOnly />
          <FormInput
            label="Customer"
            value={receiptOrder?.customerName ? titleCase(receiptOrder.customerName) : "Walk-in"}
            readOnly
          />
          <FormInput label="Amount Paid" value={receiptOrder ? bakongDue(receiptOrder) : ""} readOnly />
          <FormInput label="Ordered At" value={receiptOrder ? formatDateTime(receiptOrder.createdAt) : ""} readOnly />
        </ModalGrid>
      </FormModal>
    </PageShell>
  );
}
