"use client";

import { ReactNode } from "react";

interface SummaryRowProps {
  children: ReactNode;
}

export function SummaryRow({ children }: SummaryRowProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">{children}</div>
  );
}
