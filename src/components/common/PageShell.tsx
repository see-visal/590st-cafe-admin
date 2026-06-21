"use client";

import { ReactNode } from "react";

interface PageShellProps {
  children: ReactNode;
}

export function PageShell({ children }: PageShellProps) {
  return (
    <div className="page_shell">
      <div className="page_shell_content">{children}</div>
    </div>
  );
}
