"use client";

import { useState } from "react";
import { type DateRange } from "react-day-picker";
import { PageShell } from "@/components/common/PageShell";
import { PageHeader } from "@/components/common/PageHeader";
import {
  AdminTopActions,
  Cell,
  DataCard,
  DetailGrid,
  DetailItem,
  DetailModal,
  DateField,
  FilterActions,
  FilterPanel,
  PaginationFooter,
  Row,
  RowActions,
  SelectField,
  SimpleTable,
  StatusBadge,
  TableActions,
} from "@/components/common/AdminKit";
import { useOrders, useCancelOrder } from "@/hooks/useAdmin";
import { Order } from "@/features/dashboard/api/dashboardApi";

const ORDER_TABLE_HEADERS = [
  "No",
  "Image",
  "Order ID",
  "Type",
  "Items",
  "Total Price",
  "Orders Date",
  "Status",
  "Action",
] as const;

/** Static preview rows for UI matching design mockup when API has no orders */
const STATIC_ORDER_ROWS = [
  {
    id: "static-1",
    orderId: "#2f494o45",
    type: "Takeaway",
    items: "x1 Coca",
    totalPrice: "$1.00 USD",
    orderDate: "10 Feb,2025 10:00 AM",
    status: "Served",
  },
  {
    id: "static-2",
    orderId: "#2f494o45",
    type: "Delivery - Toul Kork",
    items: "x1 Hot-White-Russian-R...",
    totalPrice: "$1.00 USD",
    orderDate: "10 Feb,2025 10:00 AM",
    status: "Served",
  },
  {
    id: "static-3",
    orderId: "#2f494o45",
    type: "Takeaway",
    items: "x1 Hanuman 1 Yur",
    totalPrice: "$1.00 USD",
    orderDate: "10 Feb,2025 10:00 AM",
    status: "Served",
  },
  {
    id: "static-4",
    orderId: "#2f494o45",
    type: "Takeaway",
    items: "x1 Gangzberg 1 Yur",
    totalPrice: "$1.00 USD",
    orderDate: "10 Feb,2025 10:00 AM",
    status: "Served",
  },
  {
    id: "static-5",
    orderId: "#2f494o45",
    type: "Takeaway",
    items: "x1 Cambodia 1 Kes",
    totalPrice: "$1.00 USD",
    orderDate: "10 Feb,2025 10:00 AM",
    status: "Served",
  },
] as const;

export default function Orders() {
  const { orders = [], isLoading, refetch } = useOrders();
  const { cancel: cancelOrder, isLoading: isCanceling } = useCancelOrder();

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const hasApiData = orders && orders.length > 0;
  const displayCount = hasApiData ? orders.length : STATIC_ORDER_ROWS.length;

  const handleViewDetail = (order: Order) => {
    setSelectedOrder(order);
    setDetailOpen(true);
  };

  const handleCancelOrder = async (orderId: number) => {
    if (confirm("Are you sure you want to cancel this order?")) {
      try {
        await cancelOrder(orderId);
        refetch();
      } catch (error) {
        console.error("Error canceling order:", error);
      }
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

      <FilterPanel>
        <SelectField
          label="Status"
          placeholder="Select Method"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PREPARING">Preparing</option>
          <option value="READY">Ready</option>
          <option value="SERVED">Served</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </SelectField>

        <DateField
          label="Orders Date Range"
          value={dateRange}
          onChange={setDateRange}
        />

        <FilterActions />
      </FilterPanel>

      <DataCard
        title="Orders History"
        meta={`Recent Transactions: ${displayCount}`}
        actions={<TableActions showRegister={false} />}
      >
        <SimpleTable headers={[...ORDER_TABLE_HEADERS]}>
          {hasApiData
            ? orders.map((order, index) => (
                <Row key={order.id} striped={index % 2 === 1}>
                  <Cell>{index + 1}</Cell>
                  <Cell>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900 text-white shadow-xs">
                      <span className="text-xs font-semibold text-[#befe35]">🥤</span>
                    </div>
                  </Cell>
                  <Cell className="font-medium">{order.orderNumber}</Cell>
                  <Cell>{order.type}</Cell>
                  <Cell>{order.items?.length ? `${order.items.length} items` : "-"}</Cell>
                  <Cell className="font-semibold">{order.totalAmount.toLocaleString()} KHR</Cell>
                  <Cell>{new Date(order.createdAt).toLocaleDateString()}</Cell>
                  <Cell>
                    <StatusBadge
                      label={order.status}
                      variant={
                        order.status === "COMPLETED" || order.status === "SERVED"
                          ? "success"
                          : order.status === "CANCELLED"
                          ? "destructive"
                          : "default"
                      }
                    />
                  </Cell>
                  <Cell>
                    <RowActions
                      onView={() => handleViewDetail(order)}
                      onEdit={() => undefined}
                      onDelete={() => handleCancelOrder(order.id)}
                      isLoading={isCanceling}
                    />
                  </Cell>
                </Row>
              ))
            : STATIC_ORDER_ROWS.map((order, index) => (
                <Row key={order.id} striped={index % 2 === 1}>
                  <Cell>{index + 1}</Cell>
                  <Cell>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900 text-white shadow-xs">
                      <span className="text-xs font-semibold text-[#befe35]">🥤</span>
                    </div>
                  </Cell>
                  <Cell className="font-medium">{order.orderId}</Cell>
                  <Cell>{order.type}</Cell>
                  <Cell>{order.items}</Cell>
                  <Cell className="font-semibold">{order.totalPrice}</Cell>
                  <Cell>{order.orderDate}</Cell>
                  <Cell>
                    <StatusBadge label={order.status} tone="success" />
                  </Cell>
                  <Cell>
                    <RowActions
                      onView={() => undefined}
                      onEdit={() => undefined}
                      onDelete={() => undefined}
                    />
                  </Cell>
                </Row>
              ))}
        </SimpleTable>
        <PaginationFooter />
      </DataCard>

      <DetailModal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        title="Order Details"
      >
        {selectedOrder && (
          <div className="admin_modal_form_wrap">
            <h3 className="mb-6 text-lg font-semibold text-[#1E1E1E]">Order Information</h3>
            <DetailGrid>
              <DetailItem label="Order Number">{selectedOrder.orderNumber}</DetailItem>
              <DetailItem label="Status">
                <StatusBadge label={selectedOrder.status} />
              </DetailItem>
              <DetailItem label="Total Amount">
                {selectedOrder.totalAmount.toLocaleString()} KHR
              </DetailItem>
              <DetailItem label="Type">{selectedOrder.type}</DetailItem>
              <DetailItem label="Items">
                {selectedOrder.items?.length || 0} items
              </DetailItem>
              <DetailItem label="Created">
                {new Date(selectedOrder.createdAt).toLocaleString()}
              </DetailItem>
            </DetailGrid>

            {selectedOrder.items && selectedOrder.items.length > 0 && (
              <div className="mt-6">
                <h4 className="mb-3 font-semibold text-[#1E1E1E]">Order Items</h4>
                <SimpleTable headers={["Product", "Qty", "Price", "Total"]}>
                  {selectedOrder.items.map((item) => (
                    <Row key={item.id}>
                      <Cell>Product #{item.productId}</Cell>
                      <Cell>{item.quantity}</Cell>
                      <Cell>{item.price.toLocaleString()} KHR</Cell>
                      <Cell>{(item.quantity * item.price).toLocaleString()} KHR</Cell>
                    </Row>
                  ))}
                </SimpleTable>
              </div>
            )}
          </div>
        )}
      </DetailModal>
    </PageShell>
  );
}
