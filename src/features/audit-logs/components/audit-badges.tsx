import type { AuditAction, AuditRole } from "@/features/audit-logs/types/audit.type";
import { cn } from "@/lib/utils";
import { PILL_BASE } from "@/components/shared/status-badge";

export function AuditRoleBadge({ role }: { role: AuditRole }) {
  const toneClass = {
    Admin: "bg-green-100 text-green-700",
    System: "bg-gray-100 text-gray-500",
    Barista: "bg-blue-100 text-blue-700",
    Manager: "bg-violet-100 text-violet-700",
  }[role];

  return <span className={cn(PILL_BASE, toneClass)}>{role}</span>;
}

export function AuditActionBadge({
  action,
  warning = false,
}: {
  action: AuditAction;
  warning?: boolean;
}) {
  const toneClass = {
    Updated: warning ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700",
    Created: "bg-green-100 text-green-700",
    Adjusted: "bg-red-100 text-red-600",
    Login: "bg-gray-100 text-gray-500",
  }[action];

  return <span className={cn(PILL_BASE, toneClass)}>{action}</span>;
}
