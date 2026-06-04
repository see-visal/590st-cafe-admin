import ClientProvider from "@/contexts/client-provider";
import { Sidebar as AdminSidebar } from "@/components/layout/AdminSidebar";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ClientProvider>
      <div className="flex h-screen overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto lg:ml-64 pt-16 lg:pt-0 min-h-screen transition-all duration-300">
          {children}
        </main>
      </div>
    </ClientProvider>
  );
}

