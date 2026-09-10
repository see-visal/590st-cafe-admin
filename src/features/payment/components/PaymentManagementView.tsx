"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { PageShell } from "@/components/common/PageShell";
import { PageHeader } from "@/components/common/PageHeader";
import {
  AdminTopActions,
  Cell,
  DataCard,
  FormInput,
  FormModal,
  ModalGrid,
  PaginationFooter,
  Row,
  SimpleTable,
  StatTile,
  StatusBadge,
  TableState,
} from "@/components/common/AdminKit";
import { apiErrorMessage } from "@/store/api/baseApi";
import {
  useAcceptBakongPaymentMutation,
  useCollectCashMutation,
  useListAwaitingBakongConfirmationQuery,
  useListAwaitingPickupQuery,
} from "@/store/api/orderApi";
import type { OrderResponse } from "@/store/api/types";
import { useDefaultPageSize, useRefreshOptions } from "@/contexts/AdminPreferencesContext";

const PICKUP_HEADERS = [
  "No",
  "Order ID",
  "Customer",
  "Items",
  "Amount Due",
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
  "Action",
] as const;

const money = (value: number | null | undefined) =>
  value == null ? "-" : `$${Number(value).toFixed(2)}`;

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
  order.items.map((i) => `x${i.quantity} ${i.productName}`).join(", ") || "-";

/**
 * The two payment queues the API exposes: cash-on-pickup orders waiting for staff to take
 * the money, and Bakong transfers the customer says they have sent, pending confirmation.
 */
export default function PaymentManagementView() {
  const [pickupPage, setPickupPage] = useState(1);
  const [bakongPage, setBakongPage] = useState(1);
  const size = useDefaultPageSize();
  const refresh = useRefreshOptions();

  const {
    data: pickupData,
    isFetching: isLoadingPickup,
    error: pickupError,
    refetch: refetchPickup,
  } = useListAwaitingPickupQuery({ page: pickupPage, size }, refresh);

  const {
    data: bakongData,
    isFetching: isLoadingBakong,
    error: bakongError,
    refetch: refetchBakong,
  } = useListAwaitingBakongConfirmationQuery({ page: bakongPage, size }, refresh);

  const [collectCash, { isLoading: isCollecting }] = useCollectCashMutation();
  const [acceptBakong, { isLoading: isAccepting }] = useAcceptBakongPaymentMutation();

  const [cashOrder, setCashOrder] = useState<OrderResponse | null>(null);
  const [amountTendered, setAmountTendered] = useState("");

  const openCashModal = (order: OrderResponse) => {
    setCashOrder(order);
    // Pre-fill with the exact amount — the common case is the customer paying to the cent.
    setAmountTendered(String(Number(order.totalAmount).toFixed(2)));
  };

  const handleCollectCash = async () => {
    if (!cashOrder) return;
    const tendered = Number(amountTendered);
    if (!Number.isFinite(tendered) || tendered <= 0) {
      toast.error("Enter the amount handed over");
      return;
    }
    if (tendered < Number(cashOrder.totalAmount)) {
      toast.error("Amount tendered is less than the total due");
      return;
    }

    try {
      const updated = await collectCash({
        id: cashOrder.id,
        body: { amountTendered: tendered },
      }).unwrap();
      toast.success(
        updated.changeDue && Number(updated.changeDue) > 0
          ? `Paid. Change due: ${money(updated.changeDue)}`
          : "Payment collected"
      );
      setCashOrder(null);
    } catch (err) {
      toast.error(apiErrorMessage(err as never, "Could not record the cash payment."));
    }
  };

  const handleAcceptBakong = async (order: OrderResponse) => {
    if (!window.confirm(`Confirm the Bakong payment for #${order.id.slice(0, 8)}?`)) return;
    try {
      await acceptBakong(order.id).unwrap();
      toast.success("Bakong payment confirmed");
    } catch (err) {
      toast.error(apiErrorMessage(err as never, "Could not confirm the payment."));
    }
  };

  const pickupOrders = pickupData?.content ?? [];
  const bakongOrders = bakongData?.content ?? [];

  const pickupTotal = pickupOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);

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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatTile
          title="Awaiting Cash Pickup"
          value={String(pickupData?.totalElements ?? 0)}
          tone={(pickupData?.totalElements ?? 0) > 0 ? "orange" : "gray"}
        />
        <StatTile
          title="Awaiting Bakong Confirmation"
          value={String(bakongData?.totalElements ?? 0)}
          tone={(bakongData?.totalElements ?? 0) > 0 ? "orange" : "gray"}
        />
        <StatTile title="Cash Due (this page)" value={money(pickupTotal)} tone="green" />
      </div>

      <DataCard
        title="Cash on Pickup"
        meta={`Waiting: ${pickupData?.totalElements ?? 0}`}
      >
        <SimpleTable headers={[...PICKUP_HEADERS]}>
          <TableState
            colSpan={PICKUP_HEADERS.length}
            isLoading={isLoadingPickup}
            error={pickupError}
            isEmpty={pickupOrders.length === 0}
            emptyLabel="No orders are waiting for cash collection."
            onRetry={refetchPickup}
          />
          {!isLoadingPickup &&
            !pickupError &&
            pickupOrders.map((order, index) => (
              <Row key={order.id} striped={index % 2 === 1}>
                <Cell>{(pickupPage - 1) * size + index + 1}</Cell>
                <Cell className="font-mono text-xs">#{order.id.slice(0, 8)}</Cell>
                <Cell>{order.customerName ?? "Walk-in"}</Cell>
                <Cell className="max-w-[16rem] truncate">{summarise(order)}</Cell>
                <Cell className="font-semibold">{money(order.totalAmount)}</Cell>
                <Cell>{formatDateTime(order.createdAt)}</Cell>
                <Cell>
                  <button
                    type="button"
                    className="pagination_btn is_active"
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
        title="Bakong Confirmations"
        meta={`Waiting: ${bakongData?.totalElements ?? 0}`}
      >
        <SimpleTable headers={[...BAKONG_HEADERS]}>
          <TableState
            colSpan={BAKONG_HEADERS.length}
            isLoading={isLoadingBakong}
            error={bakongError}
            isEmpty={bakongOrders.length === 0}
            emptyLabel="No Bakong payments are waiting for confirmation."
            onRetry={refetchBakong}
          />
          {!isLoadingBakong &&
            !bakongError &&
            bakongOrders.map((order, index) => (
              <Row key={order.id} striped={index % 2 === 1}>
                <Cell>{(bakongPage - 1) * size + index + 1}</Cell>
                <Cell className="font-mono text-xs">#{order.id.slice(0, 8)}</Cell>
                <Cell>{order.customerName ?? "Walk-in"}</Cell>
                <Cell className="max-w-[16rem] truncate">{summarise(order)}</Cell>
                <Cell className="font-semibold">
                  {order.bakongAmount != null
                    ? Number(order.bakongAmount).toLocaleString()
                    : money(order.totalAmount)}
                </Cell>
                <Cell>
                  <StatusBadge
                    label={order.bakongCurrency ?? "USD"}
                    tone="info"
                  />
                </Cell>
                <Cell>{formatDateTime(order.createdAt)}</Cell>
                <Cell>
                  <button
                    type="button"
                    className="pagination_btn is_active"
                    onClick={() => handleAcceptBakong(order)}
                    disabled={isAccepting}
                  >
                    Confirm
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
            value={cashOrder ? money(cashOrder.totalAmount) : ""}
            readOnly
          />
          <FormInput
            label="Amount Tendered (USD)"
            type="number"
            placeholder="0.00"
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
    </PageShell>
  );
}
