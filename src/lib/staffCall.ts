import type { StaffCallReason } from "@/store/api/types";

export const STAFF_CALL_REASON_LABELS: Record<StaffCallReason, string> = {
  PAYMENT_HELP: "Help with payment",
  CHANGE_ORDER: "Change order",
  ORDER_DELAY: "Order taking too long",
  WRONG_OR_MISSING_ITEM: "Wrong or missing item",
  NAPKINS_UTENSILS: "Napkins, straws or cutlery",
  DELIVERY_HELP: "Delivery help",
  OTHER: "Something else",
};

export function staffCallReasonLabel(reason: StaffCallReason | null | undefined): string {
  return reason ? STAFF_CALL_REASON_LABELS[reason] : "Needs assistance";
}
