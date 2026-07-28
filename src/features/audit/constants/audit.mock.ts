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

export const AUDIT_TOTAL_COUNT = 248;

export const STATIC_AUDIT_ROWS: AuditLogRow[] = [
  {
    id: "1",
    auditId: "AUD-0248",
    timestamp: "22-Jan-2025 14:30:25",
    actor: "Ream Chan",
    role: "Admin",
    entity: "Product",
    action: "Updated",
    description: "Updated price of 'Arabica Coffee Beans' from $8.50 to $9.00",
    ipAddress: "192.168.1.10",
  },
  {
    id: "2",
    auditId: "AUD-0247",
    timestamp: "22-Jan-2025 13:58:11",
    actor: "System",
    role: "System",
    entity: "Order",
    action: "Created",
    description: "Auto-generated order #ORD-1042 from POS terminal 02",
    ipAddress: "127.0.0.1",
  },
  {
    id: "3",
    auditId: "AUD-0246",
    timestamp: "22-Jan-2025 13:12:44",
    actor: "Sok Rath",
    role: "Barista",
    entity: "Inventory",
    action: "Updated",
    description: "Updated stock level for 'Oat Milk' from 18 to 24 units",
    ipAddress: "192.168.1.24",
  },
  {
    id: "4",
    auditId: "AUD-0245",
    timestamp: "22-Jan-2025 12:40:03",
    actor: "Ream Chan",
    role: "Admin",
    entity: "Promotion",
    action: "Created",
    description: "Created promotion 'COFFEE20' with 20% discount on drinks",
    ipAddress: "192.168.1.10",
  },
  {
    id: "5",
    auditId: "AUD-0244",
    timestamp: "22-Jan-2025 11:05:19",
    actor: "Sok Rath",
    role: "Barista",
    entity: "Inventory",
    action: "Adjusted",
    description: "Adjusted stock for 'Paper Cups' due to wastage (-12 units)",
    ipAddress: "192.168.1.24",
  },
  {
    id: "6",
    auditId: "AUD-0243",
    timestamp: "22-Jan-2025 10:22:57",
    actor: "Ream Chan",
    role: "Admin",
    entity: "Settings",
    action: "Updated",
    description: "Updated store operating hours for weekend service",
    ipAddress: "192.168.1.10",
  },
  {
    id: "7",
    auditId: "AUD-0242",
    timestamp: "22-Jan-2025 09:18:36",
    actor: "Dara Lim",
    role: "Manager",
    entity: "Staff",
    action: "Updated",
    description: "Updated role permissions for staff account 'sok.rath'",
    ipAddress: "192.168.1.18",
  },
  {
    id: "8",
    auditId: "AUD-0241",
    timestamp: "22-Jan-2025 08:01:02",
    actor: "Sok Rath",
    role: "Barista",
    entity: "Settings",
    action: "Login",
    description: "Successful login from POS workstation",
    ipAddress: "192.168.1.24",
  },
];
