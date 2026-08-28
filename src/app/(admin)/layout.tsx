import { AdminLayoutShell } from "@/components/layout/admin-shell";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutShell>{children}</AdminLayoutShell>;
}
