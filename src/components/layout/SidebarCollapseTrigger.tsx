"use client";

import { PanelLeft } from "lucide-react";
import { useSidebarCollapse } from "@/contexts/SidebarCollapseContext";

export function SidebarCollapseTrigger() {
  const { isCollapsed, toggleSidebar } = useSidebarCollapse();

  return (
    <button
      type="button"
      onClick={toggleSidebar}
      className="sidebar_collapse_trigger"
      aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      aria-expanded={!isCollapsed}
    >
      <PanelLeft className="sidebar_collapse_icon" strokeWidth={2.2} />
    </button>
  );
}
