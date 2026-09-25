"use client";

import UserManagementView from "@/features/user/components/UserManagementView";

/**
 * The API has no dedicated customer resource — customers are user accounts with role
 * CUSTOMER, served by /api/admin/users?role=CUSTOMER. So this screen is the account
 * directory scoped to that role rather than a separate data source.
 */
export default function CustomerManagementView() {
  return (
    <UserManagementView
      role="CUSTOMER"
      title="Customers"
      emptyLabel="No customer accounts yet. Customers appear here once they register."
    />
  );
}
