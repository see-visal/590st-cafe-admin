import {
  type AuditAction,
  type AuditRole,
} from "@/features/audit/constants/audit.mock";
import { cn } from "@/lib/utils";

export function AuditRoleBadge({ role }: { role: AuditRole }) {
  const toneClass = {
    Admin: "is_admin",
    System: "is_system",
    Barista: "is_barista",
    Manager: "is_manager",
  }[role];

  return <span className={cn("audit_role_badge", toneClass)}>{role}</span>;
}

export function AuditActionBadge({
  action,
  warning = false,
}: {
  action: AuditAction;
  warning?: boolean;
}) {
  const toneClass = {
    Updated: warning ? "is_updated_warn" : "is_updated",
    Created: "is_created",
    Adjusted: "is_adjusted",
    Login: "is_login",
  }[action];

  return <span className={cn("audit_action_badge", toneClass)}>{action}</span>;
}
