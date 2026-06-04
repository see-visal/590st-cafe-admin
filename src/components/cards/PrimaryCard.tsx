"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PrimaryCardProps {
  children: ReactNode;
  className?: string;
}

export function PrimaryCard({ children, className }: PrimaryCardProps) {
  return (
    <div className={cn("rounded-2xl border border-gray-200 bg-white shadow-sm", className)}>
      {children}
    </div>
  );
}
