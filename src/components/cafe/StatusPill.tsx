"use client";

import { cn } from "@/lib/utils";

interface StatusPillProps {
  label: string;
  tone?: "success" | "warning" | "info" | "neutral";
}

const toneStyles: Record<NonNullable<StatusPillProps["tone"]>, string> = {
  success: "bg-green-100 text-green-700",
  warning: "bg-orange-100 text-orange-700",
  info: "bg-blue-100 text-blue-700",
  neutral: "bg-gray-100 text-gray-600",
};

export function StatusPill({ label, tone = "neutral" }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        toneStyles[tone]
      )}
    >
      {label}
    </span>
  );
}
