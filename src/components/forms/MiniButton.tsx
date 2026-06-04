"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MiniButtonProps {
  children: ReactNode;
  className?: string;
}

export function MiniButton({ children, className }: MiniButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "rounded-md border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50",
        className
      )}
    >
      {children}
    </button>
  );
}
