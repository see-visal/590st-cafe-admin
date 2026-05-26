"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SubtleCardProps {
  children: ReactNode;
  className?: string;
}

export function SubtleCard({ children, className }: SubtleCardProps) {
  return (
    <div className={cn("rounded-xl border border-gray-200 bg-white p-4 shadow-sm", className)}>
      {children}
    </div>
  );
}
