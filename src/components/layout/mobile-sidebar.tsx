"use client";

import { SidebarUser } from "@/components/layout/sidebar-user";

interface SidebarProfileProps {
  isMobile?: boolean;
}

function SidebarProfile({ isMobile = false }: SidebarProfileProps) {
  return (
    <div className={`${isMobile ? "px-4 py-4" : "px-4 pb-4"} text-white`}>
      <SidebarUser name="ADMIN" role="Admin Mjas Kfe" />
    </div>
  );
}

export default SidebarProfile;
