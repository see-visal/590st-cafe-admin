import { type PointRewardStatus } from "@/features/point/constants/point.mock";
import { cn } from "@/lib/utils";

export function PointRewardBadge({ status }: { status: PointRewardStatus }) {
  const toneClass = {
    Collecting: "is_collecting",
    Ready: "is_ready",
    Redeemed: "is_redeemed",
  }[status];

  const label = {
    Collecting: "Collecting",
    Ready: "Ready to Redeem",
    Redeemed: "Recently Redeemed",
  }[status];

  return <span className={cn("point_reward_badge", toneClass)}>{label}</span>;
}

export function PointProgramStatusBadge({
  status,
}: {
  status: "Active" | "Paused";
}) {
  const toneClass = status === "Active" ? "is_active" : "is_paused";

  return <span className={cn("point_program_badge", toneClass)}>{status}</span>;
}

export function PointHistoryBadge({
  type,
}: {
  type: "Earned" | "Redeemed" | "Adjusted" | "Expired";
}) {
  const toneClass = {
    Earned: "is_earned",
    Redeemed: "is_redeemed",
    Adjusted: "is_adjusted",
    Expired: "is_expired",
  }[type];

  return <span className={cn("point_history_badge", toneClass)}>{type}</span>;
}
