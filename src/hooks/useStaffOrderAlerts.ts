"use client";

import { useRealtimeTopic } from "./useRealtimeTopic";
import type { OrderUpdateMessage } from "@/store/api/types";

export function useStaffOrderAlerts(
  onMessage: (message: OrderUpdateMessage) => void,
) {
  useRealtimeTopic<OrderUpdateMessage>("/topic/orders", onMessage);
}
