import type { OrderResponse } from "@/store/api/types";

export function OrderFulfillmentDetails({ order }: { order: OrderResponse }) {
  if (!order.fulfillmentMethod && !order.contactName) return null;
  return <div className="my-3 rounded-lg border bg-gray-50 p-3 text-xs text-gray-700">
    <p className="font-semibold">{order.fulfillmentMethod === "DELIVERY" ? "Delivery" : "Pickup"}
      {order.contactName ? ` · ${order.contactName}` : ""}</p>
    {order.contactPhone && <p className="mt-1">Phone: {order.contactPhone}</p>}
    {order.deliveryAddress && <p className="mt-1 whitespace-pre-wrap">{order.deliveryAddress}</p>}
    {Number(order.deliveryFee) > 0 && <p className="mt-1">Delivery fee included: ${Number(order.deliveryFee).toFixed(2)}</p>}
  </div>;
}
