"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TableFrameProps {
  header?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function TableFrame({ header, children, className }: TableFrameProps) {
  return (
    <div className={cn("rounded-xl border border-gray-200 bg-white shadow-sm", className)}>
      {header && <div className="border-b border-gray-100 px-4 py-3">{header}</div>}
      <div className="px-4 py-3">{children}</div>
    </div>
  );
}
