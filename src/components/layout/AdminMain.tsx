"use client";

import { ReactNode } from "react";

interface AdminMainProps {
  children: ReactNode;
}

export function AdminMain({ children }: AdminMainProps) {
  return <main className="admin_main">{children}</main>;
}
