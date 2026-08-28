export type AuditRole = "Admin" | "System" | "Barista" | "Manager";
export type AuditAction = "Updated" | "Created" | "Adjusted" | "Login";
export type AuditEntity =
  | "Product"
  | "Order"
  | "Promotion"
  | "Inventory"
  | "Settings"
  | "Staff";

export type AuditLogRow = {
  id: string;
  auditId: string;
  timestamp: string;
  actor: string;
  role: AuditRole;
  entity: AuditEntity;
  action: AuditAction;
  description: string;
  ipAddress: string;
};
