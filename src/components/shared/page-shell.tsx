"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageShellProps {
  children: ReactNode;
  contentClassName?: string;
}

export function PageShell({ children, contentClassName }: PageShellProps) {
  return (
    <div className="page_shell">
      <div className={cn("page_shell_content", contentClassName)}>{children}</div>
    </div>
  );
}
