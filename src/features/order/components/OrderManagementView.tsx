"use client";
import { OrderFulfillmentDetails } from "@/components/common/OrderFulfillmentDetails";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { PageShell } from "@/components/common/PageShell";
import { PageHeader } from "@/components/common/PageHeader";
import {
  AdminTopActions,
  Cell,
  DataCard,
  DetailGrid,
  DetailItem,
  DetailModal,
  FilterActions,
  FilterPanel,
  PaginationFooter,
  Row,
  RowActions,
  SelectField,
  SimpleTable,
  StatTile,
  StatusBadge,
  TableState,
} from "@/components/common/AdminKit";
import { apiErrorMessage } from "@/store/api/baseApi";
import { usePageSize, useRefreshOptions } from "@/contexts/AdminPreferencesContext";
import {
  useCancelOrderMutation,
  useGetOrderHistoryQuery,
  useListOrdersQuery,
} from "@/store/api/orderApi";
import type { OrderResponse, OrderStatus } from "@/store/api/types";

const ORDER_TABLE_HEADERS = [
  "No",
  "Order ID",
  "Customer",
  "Handled By",
  "Items",
  "Total",
  "Payment",
  "Order Date",
  "Status",
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
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusTone(status: OrderStatus): "success" | "warning" | "danger" | "info" {
  // DELIVERED is the delivery counterpart of COMPLETED: both mean the customer has it.
  if (status === "COMPLETED" || status === "DELIVERED") return "success";
  // Paid but not yet handed over — money is in, the drink is still owed.
  if (status === "PAID" || status === "PREPARING" || status === "OUT_FOR_DELIVERY") return "info";
  if (status === "PENDING") return "warning";
  return "danger";
}

/** "x2 Iced Latte, x1 Croissant" — the same summary the table and detail modal both want. */
function summariseItems(order: OrderResponse): string {
  if (order.items.length === 0) return "-";
  return order.items
    .map((item) => `x${item.quantity} ${item.productName}`)
    .join(", ");
}

export default function Orders() {
  const [page, setPage] = useState(1);
  const [size, setSize] = usePageSize();
  const refresh = useRefreshOptions();
  const [filterStatus, setFilterStatus] = useState("");

  const {
    data: orderPage,
    isFetching,
    error,
    refetch,
  } = useListOrdersQuery({
    page,
    size,
    ...(filterStatus ? { status: filterStatus as OrderStatus } : {}),
  }, refresh);

  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();

  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<OrderResponse | null>(null);
  const [historyFor, setHistoryFor] = useState<string | null>(null);

  // Only fetched while a history modal is actually open.
  const { currentData: history, isFetching: historyLoading, error: historyError, refetch: refetchHistory } = useGetOrderHistoryQuery(historyFor ?? "", {
    skip: !historyFor,
  });

  const orders = useMemo(() => orderPage?.content ?? [], [orderPage]);

  const pendingCount = orders.filter((o) => o.status === "PENDING").length;
  // Revenue counts every order that has been paid for, not only the ones already handed over:
  // a drink still on the bar has been charged for and belongs in the takings.
  const pageRevenue = orders
    .filter((o) => o.paidAt != null)
    .reduce((sum, o) => sum + Number(o.totalAmount), 0);

  const handleCancel = async (order: OrderResponse) => {
    if (!window.confirm(`Cancel order ${order.id.slice(0, 8)}?`)) return;
    try {
      await cancelOrder(order.id).unwrap();
      toast.success("Order cancelled");
    } catch (err) {
      toast.error(apiErrorMessage(err as never, "Could not cancel the order."));
    }
  };

  return (
    <PageShell>
      <PageHeader
        title="Orders List"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Orders" },
          { label: "Orders List" },
        ]}
        rightSlot={<AdminTopActions />}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatTile title="All Orders" value={String(orderPage?.totalElements ?? 0)} tone="gray" />
        <StatTile
          title="Unpaid (this page)"
          value={String(pendingCount)}
          tone={pendingCount > 0 ? "orange" : "gray"}
        />
        <StatTile title="Paid Value (this page)" value={money(pageRevenue)} tone="green" />
      </div>

      <FilterPanel>
        <SelectField
          label="Status"
          placeholder="All statuses"
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="PENDING">Unpaid</option>
          <option value="PAID">Paid</option>
          <option value="PREPARING">Preparing</option>
          <option value="OUT_FOR_DELIVERY">Out for delivery</option>
          <option value="COMPLETED">Completed</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </SelectField>
        <FilterActions onClear={() => { setFilterStatus(""); setPage(1); }} onSearch={refetch} />
      </FilterPanel>

      <DataCard title="Orders" meta={`Total Orders: ${orderPage?.totalElements ?? 0}`}>
        <SimpleTable headers={[...ORDER_TABLE_HEADERS]}>
          <TableState
            colSpan={ORDER_TABLE_HEADERS.length}
            isLoading={isFetching}
            error={error}
            isEmpty={orders.length === 0}
            emptyLabel="No orders match this filter."
            onRetry={refetch}
          />
          {!isFetching &&
            !error &&
            orders.map((order, index) => (
              <Row key={order.id} striped={index % 2 === 1}>
                <Cell>{(page - 1) * size + index + 1}</Cell>
                <Cell className="font-mono text-xs">#{order.id.slice(0, 8)}</Cell>
                <Cell>{order.customerName ?? "Walk-in"}</Cell>
                <Cell>{order.handledByName ?? "-"}</Cell>
                <Cell className="max-w-[16rem] truncate">{summariseItems(order)}</Cell>
                <Cell className="font-semibold">{money(order.totalAmount)}</Cell>
                <Cell>{order.paymentMethod ?? "-"}</Cell>
                <Cell>{formatDateTime(order.createdAt)}</Cell>
                <Cell>
                  <StatusBadge label={order.status} tone={statusTone(order.status)} />
                </Cell>
                <Cell>
                  <RowActions
                    onView={() => {
                      setSelected(order);
                      setDetailOpen(true);
                    }}
                    onHistory={() => setHistoryFor(order.id)}
                    onDelete={
                      order.status === "PENDING" ? () => handleCancel(order) : undefined
                    }
                    isLoading={isCancelling}
                  />
                </Cell>
              </Row>
            ))}
        </SimpleTable>
        <PaginationFooter
          page={orderPage?.page ?? page}
          totalPages={orderPage?.totalPages ?? 1}
          size={size}
          totalElements={orderPage?.totalElements}
          onPageChange={setPage}
          onSizeChange={(next) => {
            setSize(next);
            setPage(1);
          }}
        />
      </DataCard>

      <DetailModal
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) setSelected(null);
        }}
        title="Order Detail"
      >
        {selected && (
          <div className="admin_modal_form_wrap">
            <DetailGrid>
              <DetailItem label="Order ID">
                <span className="font-mono text-xs">{selected.id}</span>
              </DetailItem>
              <DetailItem label="Status">
                <StatusBadge label={selected.status} tone={statusTone(selected.status)} />
              </DetailItem>
              <DetailItem label="Customer">{selected.customerName ?? "Walk-in"}</DetailItem>
              <DetailItem label="Handled By">
                {selected.handledByName ?? "-"}
                {selected.handledByRole ? ` (${selected.handledByRole})` : ""}
              </DetailItem>
              <DetailItem label="Payment Method">
                {selected.paymentMethod ?? "Not paid"}
              </DetailItem>
              <DetailItem label="Total">{money(selected.totalAmount)}</DetailItem>
              <DetailItem label="Amount Tendered">
                {money(selected.amountTendered)}
              </DetailItem>
              <DetailItem label="Change Due">{money(selected.changeDue)}</DetailItem>
              <DetailItem label="Ordered At">
                {formatDateTime(selected.createdAt)}
              </DetailItem>
              <DetailItem label="Paid At">{formatDateTime(selected.paidAt)}</DetailItem>
              <DetailItem label="Note">{selected.note || "-"}</DetailItem>
              <DetailItem label="Fulfillment"><OrderFulfillmentDetails order={selected} /></DetailItem>
            </DetailGrid>

            <div className="mt-6">
              <p className="detail_item_label mb-2">Items :</p>
              <table className="data_table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Options</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.productName}</td>
                      <td className="text-xs text-muted-foreground">
                        {[
                          item.sizeOptionName,
                          item.sugarLevel && `Sugar ${item.sugarLevel}`,
                          item.iceLevel && `Ice ${item.iceLevel}`,
                          item.milkType !== "NONE" ? item.milkType : null,
                        ]
                          .filter(Boolean)
                          .join(" · ") || "-"}
                      </td>
                      <td>{item.quantity}</td>
                      <td>{money(item.unitPrice)}</td>
                      <td>{money(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </DetailModal>

      <DetailModal
        open={historyFor !== null}
        onOpenChange={(open) => {
          if (!open) setHistoryFor(null);
        }}
        title="Order History"
      >
        <div className="admin_modal_form_wrap">
          {historyLoading ? <p role="status">Loading history...</p> : historyError ? <div role="alert">
            {apiErrorMessage(historyError as never, "Could not load order history.")} <button className="underline" onClick={() => refetchHistory()}>Retry</button>
          </div> : history && history.length > 0 ? (
            <table className="data_table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Actor</th>
                  <th>When</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.action}</td>
                    <td>
                      {entry.actorName ?? "-"}
                      {entry.actorRole ? ` (${entry.actorRole})` : ""}
                    </td>
                    <td>{formatDateTime(entry.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No history recorded for this order.
            </p>
          )}
        </div>
      </DetailModal>
    </PageShell>
  );
}
