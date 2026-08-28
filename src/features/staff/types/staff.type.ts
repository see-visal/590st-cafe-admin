export const STAFF_ROLES = [
  "ADMIN",
  "MANAGER",
  "BARISTA",
  "CASHIER",
  "DELIVERY_RIDER",
] as const;

export interface Staff {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: (typeof STAFF_ROLES)[number];
  status: "ACTIVE" | "INACTIVE";
  joinDate: string;
}

export interface StaffCreatePayload {
  name: string;
  email: string;
  phone: string;
  role: Staff["role"];
  username?: string;
  password?: string;
}

export interface BackendStaff {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: Staff["role"];
  status: Staff["status"];
  joinDate: string;
}
