"use client";

import UserManagementView from "@/features/user/components/UserManagementView";

export default function CustomerManagementView() {
  return (
    <UserManagementView
      role="CUSTOMER"
      title="Customers"
      emptyLabel="No customer accounts yet. Customers appear here once they register."
    />
  );
}
