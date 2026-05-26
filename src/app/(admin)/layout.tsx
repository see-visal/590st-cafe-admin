import NotificationWrapper from "@/components/NotificationWrapper";
import ClientProvider from "@/components/provider/ClientProvider";
import { Sidebar } from "@/components/Sidebar";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ClientProvider>
      <NotificationWrapper />

      <Sidebar />
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen transition-all duration-300">
        {children}
      </main>
    </ClientProvider>
  );
}
