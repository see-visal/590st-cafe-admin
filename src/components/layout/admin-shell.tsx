"use client";

import { ReactNode } from "react";
import { SidebarCollapseProvider } from "@/providers/sidebar-collapse-provider";
import { Sidebar as AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminMain } from "@/components/layout/admin-main";

interface AdminLayoutShellProps {
  children: ReactNode;
}

export function AdminLayoutShell({ children }: AdminLayoutShellProps) {
  return (
    <SidebarCollapseProvider>
      <div className="admin_shell">
        <AdminSidebar />
        <AdminMain>{children}</AdminMain>
      </div>
    </SidebarCollapseProvider>
  );
}
