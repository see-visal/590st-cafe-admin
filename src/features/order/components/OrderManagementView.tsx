"use client";

import { useState } from "react";
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
  StatusBadge,
  TableActions,
  TextField,
} from "@/components/common/AdminKit";
import { useOrders, useCancelOrder } from "@/hooks/useAdmin";
import { Order } from "@/features/dashboard/api/dashboardApi";

export default function Orders() {
  const { orders, isLoading, refetch } = useOrders();
  const { cancel: cancelOrder, isLoading: isCanceling } = useCancelOrder();

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

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

  const getTotalValue = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);

  return (
    <PageShell>
      <PageHeader
        title="Orders Management"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Orders" },
          { label: "Orders List" },
        ]}
        rightSlot={<AdminTopActions />}
      />

      <FilterPanel>
        <TextField label="Order Number" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
        <SelectField label="Status" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PREPARING">Preparing</option>
          <option value="READY">Ready</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </SelectField>
        <FilterActions />
      </FilterPanel>

      <DataCard
        title="Orders History"
        meta={`Total Orders: ${filteredOrders.length} | Total Value: ${getTotalValue.toLocaleString()} KHR`}
        actions={<TableActions primaryLabel="New Order" />}
      >
        {isLoading ? (
          <div className="py-8 text-center text-gray-500">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No orders found</div>
        ) : (
          <>
            <SimpleTable
              headers={[
                "No",
                "Order #",
                "Amount",
                "Type",
                "Status",
                "Date",
                "Action",
              ]}
            >
              {filteredOrders.map((order, index) => (
                <Row key={order.id} striped={index % 2 === 1}>
                  <Cell>{index + 1}</Cell>
                  <Cell className="font-semibold">{order.orderNumber}</Cell>
                  <Cell>{order.totalAmount.toLocaleString()} KHR</Cell>
                  <Cell>{order.type}</Cell>
                  <Cell>
                    <StatusBadge
                      label={order.status}
                      variant={
                        order.status === "COMPLETED"
                          ? "success"
                          : order.status === "CANCELLED"
                          ? "destructive"
                          : "default"
                      }
                    />
                  </Cell>
                  <Cell>{new Date(order.createdAt).toLocaleDateString()}</Cell>
                  <Cell>
                    <RowActions
                      onView={() => handleViewDetail(order)}
                      onDelete={() => handleCancelOrder(order.id)}
                      isLoading={isCanceling}
                    />
                  </Cell>
                </Row>
              ))}
            </SimpleTable>
            <PaginationFooter />
          </>
        )}
      </DataCard>

      <DetailModal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        title="Order Details"
      >
        {selectedOrder && (
          <div className="rounded-lg bg-white p-4">
            <h3 className="mb-6 text-lg font-semibold">Order Information</h3>
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
                <h4 className="mb-3 font-semibold">Order Items</h4>
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
