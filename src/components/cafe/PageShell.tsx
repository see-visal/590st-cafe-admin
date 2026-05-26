"use client";

import { ReactNode } from "react";

interface PageShellProps {
  children: ReactNode;
}

export function PageShell({ children }: PageShellProps) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="px-4 pb-8 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6" style={{ fontFamily: "var(--font-montserrat), var(--font-poppins), sans-serif" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
