import type { PromotionStatus, PromotionType } from "@/features/promotions/types/promotion.type";
import { PILL_BASE } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";

export function PromotionTypeBadge({ type }: { type: PromotionType }) {
  const toneClass = {
    Percentage: "bg-blue-100 text-blue-700",
    "Fixed Amount": "bg-violet-100 text-violet-700",
    "Buy X Get Y": "bg-orange-100 text-orange-700",
  }[type];

  return <span className={cn(PILL_BASE, toneClass)}>{type}</span>;
}

export function PromotionStatusBadge({ status }: { status: PromotionStatus }) {
  const toneClass = {
    Active: "bg-green-100 text-green-700",
    Expired: "bg-red-100 text-red-600",
    Scheduled: "bg-slate-200 text-slate-600",
  }[status];

  return <span className={cn(PILL_BASE, toneClass)}>{status}</span>;
}
