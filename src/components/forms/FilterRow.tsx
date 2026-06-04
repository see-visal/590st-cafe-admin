"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FilterRowProps {
  children: ReactNode;
  className?: string;
}

export function FilterRow({ children, className }: FilterRowProps) {
  return (
    <div className={cn("grid grid-cols-1 gap-3 md:grid-cols-4", className)}>
      {children}
    </div>
  );
}
