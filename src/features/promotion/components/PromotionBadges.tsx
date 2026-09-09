import {
  type PromotionStatus,
  type PromotionType,
} from "@/features/promotion/constants/promotion.mock";
import { cn } from "@/lib/utils";

export function PromotionTypeBadge({ type }: { type: PromotionType }) {
  const toneClass = {
    Percentage: "is_percentage",
    "Fixed Amount": "is_fixed",
    "Buy X Get Y": "is_bogo",
  }[type];

  return (
    <span className={cn("promotion_type_badge", toneClass)}>{type}</span>
  );
}

export function PromotionStatusBadge({ status }: { status: PromotionStatus }) {
  const toneClass = {
    Active: "is_active",
    Expired: "is_expired",
    Scheduled: "is_scheduled",
  }[status];

  return (
    <span className={cn("promotion_status_badge", toneClass)}>{status}</span>
  );
}
