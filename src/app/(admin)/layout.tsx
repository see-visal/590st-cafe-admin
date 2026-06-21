import { AdminLayoutShell } from "@/components/layout/AdminLayoutShell";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutShell>{children}</AdminLayoutShell>;
}
