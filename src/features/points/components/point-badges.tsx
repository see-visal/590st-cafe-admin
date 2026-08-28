import type { PointRewardStatus } from "@/features/points/types/point.type";
import { cn } from "@/lib/utils";
import { PILL_BASE } from "@/components/shared/status-badge";

export function PointRewardBadge({ status }: { status: PointRewardStatus }) {
  const toneClass = {
    Collecting: "bg-blue-100 text-blue-700",
    Ready: "bg-green-100 text-green-700",
    Redeemed: "bg-gray-100 text-gray-500",
  }[status];

  const label = {
    Collecting: "Collecting",
    Ready: "Ready to Redeem",
    Redeemed: "Recently Redeemed",
  }[status];

  return <span className={cn(PILL_BASE, toneClass)}>{label}</span>;
}

export function PointProgramStatusBadge({
  status,
}: {
  status: "Active" | "Paused";
}) {
  const toneClass =
    status === "Active"
      ? "bg-green-100 text-green-700"
      : "bg-amber-100 text-amber-700";

  return <span className={cn(PILL_BASE, toneClass)}>{status}</span>;
}

export function PointHistoryBadge({
  type,
}: {
  type: "Earned" | "Redeemed" | "Adjusted" | "Expired";
}) {
  const toneClass = {
    Earned: "bg-green-100 text-green-700",
    Redeemed: "bg-blue-100 text-blue-700",
    Adjusted: "bg-amber-100 text-amber-700",
    Expired: "bg-red-100 text-red-600",
  }[type];

  return <span className={cn(PILL_BASE, toneClass)}>{type}</span>;
}
