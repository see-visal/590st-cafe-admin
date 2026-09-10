import { AdminLayoutShell } from "@/components/layout/AdminLayoutShell";
import { AuthGuard } from "@/components/layout/AuthGuard";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AdminLayoutShell>{children}</AdminLayoutShell>
    </AuthGuard>
  );
}
