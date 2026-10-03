import type { NotifyOptions } from "@/components/common/AppToast";
import { staffCallReasonLabel } from "@/lib/staffCall";
import { fulfillmentLabel, titleCase } from "@/lib/utils";
import type { OrderResponse, OrderUpdateMessage, StaffCallMessage } from "@/store/api/types";

type Notice = Omit<NotifyOptions, "icon">;

const shortId = (id: string) => `#${id.slice(0, 8).toUpperCase()}`;
const customerOf = (name: string | null | undefined) => (name ? titleCase(name) : "A customer");
const money = (value: number | string) => `$${Number(value).toFixed(2)}`;

function orderSummary(order: OrderResponse): string {
  const count = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const method =
    order.fulfillmentMethod === "DELIVERY" ? " · Delivery"
    : order.fulfillmentMethod === "DINE_IN" ? ` · ${fulfillmentLabel(order)}`
    : "";
  return `${shortId(order.id)} · ${count} item${count === 1 ? "" : "s"} · ${money(order.totalAmount)}${method}`;
}

export function orderNotice(
  { action, order }: OrderUpdateMessage,
  links: { orders: string; deliveryFee: string }
): Notice | null {
  if (order.customerId == null) return null;
  const id = `order-${action}-${order.id}`;
  const customer = customerOf(order.customerName);

  switch (action) {
    case "CREATED":
      return { id, title: `New order from ${customer}`, description: orderSummary(order), href: links.orders };
    case "LOCATION_PINNED":
      return {
        id,
        title: "Delivery fee needed",
        description: `${customer} pinned a location for ${shortId(order.id)}.`,
        href: links.deliveryFee,
        actionLabel: "Set fee",
      };
    case "BAKONG_CONFIRMED":
      return {
        id,
        tone: "success",
        title: "QR payment received",
        description: `${shortId(order.id)} · ${money(order.totalAmount)} — ready to prepare.`,
        href: links.orders,
      };
    case "CASH_SELECTED":
      return {
        id,
        title: `${customer} will pay cash`,
        description: `${shortId(order.id)} can be started now.`,
        href: links.orders,
      };
    default:
      return null;
  }
}

export const staffCallToastId = (orderId: string) => `staff-call-${orderId}`;

export function staffCallNotice(message: StaffCallMessage, href: string): Notice | null {
  if (message.type !== "CALLED") return null;
  const reason = staffCallReasonLabel(message.reason);
  return {
    id: staffCallToastId(message.orderId),
    tone: "urgent",
    title: `${customerOf(message.customerName)} is calling staff`,
    description: message.note ? `${reason} — “${message.note}”` : `${reason} · ${shortId(message.orderId)}`,
    href,
    actionLabel: "Respond",
    duration: 12000,
  };
}

export function lowStockNotice(total: number, href: string): Notice {
  return {
    id: `low-stock-${total}`,
    tone: "urgent",
    title: "Low stock alert",
    description: `${total} item${total === 1 ? " is" : "s are"} running low.`,
    href,
  };
}

export function newMessageNotice(id: string, href: string): Notice {
  return { id: `feedback-${id}`, title: "New customer message", description: "Someone sent a message from the contact page.", href };
}
