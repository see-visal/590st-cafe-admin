"use client";

import { ReactNode } from "react";
import { AdminPreferencesProvider } from "@/contexts/AdminPreferencesContext";
import { SidebarCollapseProvider } from "@/contexts/SidebarCollapseContext";
import { Sidebar as AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminMain } from "@/components/layout/AdminMain";

interface AdminLayoutShellProps {
  children: ReactNode;
}

export function AdminLayoutShell({ children }: AdminLayoutShellProps) {
  return (
    <AdminPreferencesProvider>
      <SidebarCollapseProvider>
        <div className="admin_shell">
          <AdminSidebar />
          <AdminMain>{children}</AdminMain>
        </div>
      </SidebarCollapseProvider>
    </AdminPreferencesProvider>
  );
}
