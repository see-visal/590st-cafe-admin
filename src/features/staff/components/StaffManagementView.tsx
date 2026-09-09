"use client";

import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { PageShell } from "@/components/common/PageShell";
import {
  AdminTopActions,
  Cell,
  DataCard,
  FilterActions,
  FilterPanel,
  FormInput,
  FormModal,
  FormSelect,
  LockedYnCell,
  ModalGrid,
  PaginationFooter,
  Row,
  RowActions,
  SelectField,
  SimpleTable,
  StaffIdentityCell,
  StatusBadge,
  TableActions,
  TextField,
} from "@/components/common/AdminKit";
import { useStaff, useCreateStaff } from "@/hooks/useAdmin";
import { Staff as StaffMember } from "@/features/dashboard/api/dashboardApi";

const ROLES = ["ADMIN", "MANAGER", "BARISTA", "CASHIER", "DELIVERY_RIDER"] as const;

const STAFF_TABLE_HEADERS = [
  "No",
  "Customer",
  "Role",
  "Created",
  "Status",
  "Locked YN",
  "Action",
] as const;

/** Static preview rows for UI when API has no staff yet */
const STATIC_STAFF_ROWS = [
  {
    id: "static-1",
    name: "Barista",
    email: "barista@gmail.com",
    role: "Barista",
    created: "10-Feb-2025",
    status: "Enabled",
    locked: false,
  },
  {
    id: "static-2",
    name: "Admin Shop",
    email: "admin@gmail.com",
    role: "Admin",
    created: "10-Feb-2025",
    status: "Enabled",
    locked: false,
  },
] as const;

function formatCreatedDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .replace(/ /g, "-");
}

export default function Staff() {
  const { staff, isLoading, refetch } = useStaff();
  const { create, isLoading: isCreating } = useCreateStaff();
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    username: "",
    password: "",
    role: "BARISTA" as StaffMember["role"],
  });

  const hasApiData = staff.length > 0;
  const displayCount = hasApiData ? staff.length : STATIC_STAFF_ROWS.length;

  const handleSubmit = async () => {
    await create({
      name: form.name,
      email: form.email,
      phone: form.phone,
      username: form.username || form.email.split("@")[0],
      password: form.password || "ChangeMe123!",
      role: form.role,
    });
    setFormOpen(false);
    refetch();
  };

  return (
    <PageShell>
      <PageHeader
        title="Staff List"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Staffs" },
          { label: "Staff List" },
        ]}
        rightSlot={<AdminTopActions />}
      />

      <FilterPanel>
        <TextField label="Customer" placeholder="Placeholder" />
        <SelectField label="Role" placeholder="Select Method">
          <option value="ADMIN">Admin</option>
          <option value="MANAGER">Manager</option>
          <option value="BARISTA">Barista</option>
          <option value="CASHIER">Cashier</option>
          <option value="DELIVERY_RIDER">Delivery Rider</option>
        </SelectField>
        <SelectField label="Locked YN" placeholder="Select Method">
          <option value="enabled">Enabled</option>
          <option value="disabled">Disabled</option>
        </SelectField>
        <SelectField label="Status" placeholder="Select Method">
          <option value="Enabled">Enabled</option>
          <option value="Disabled">Disabled</option>
        </SelectField>
        <FilterActions />
      </FilterPanel>

      <DataCard
        title="Customer Directory"
        meta={`Customer found: ${displayCount}`}
        actions={
          <TableActions
            onRegister={() => setFormOpen(true)}
            primaryLabel="Register"
          />
        }
      >
        {isLoading ? (
          <p className="p-4 text-sm text-gray-500">Loading staff...</p>
        ) : (
          <SimpleTable headers={[...STAFF_TABLE_HEADERS]}>
            {hasApiData
              ? staff.map((member, index) => (
                  <Row key={member.id} striped={index % 2 === 1}>
                    <Cell>{index + 1}</Cell>
                    <Cell>
                      <StaffIdentityCell
                        name={member.name}
                        email={member.email}
                      />
                    </Cell>
                    <Cell>{member.role}</Cell>
                    <Cell>{formatCreatedDate(member.joinDate)}</Cell>
                    <Cell>
                      <StatusBadge
                        label={member.status === "ACTIVE" ? "Enabled" : member.status}
                        tone={member.status === "ACTIVE" ? "success" : "neutral"}
                      />
                    </Cell>
                    <Cell>
                      <LockedYnCell locked={member.status !== "ACTIVE"} />
                    </Cell>
                    <Cell>
                      <RowActions
                        onView={() => undefined}
                        onEdit={() => setFormOpen(true)}
                        onDelete={() => undefined}
                      />
                    </Cell>
                  </Row>
                ))
              : STATIC_STAFF_ROWS.map((member, index) => (
                  <Row key={member.id} striped={index % 2 === 1}>
                    <Cell>{index + 1}</Cell>
                    <Cell>
                      <StaffIdentityCell
                        name={member.name}
                        email={member.email}
                      />
                    </Cell>
                    <Cell>{member.role}</Cell>
                    <Cell>{member.created}</Cell>
                    <Cell>
                      <StatusBadge label={member.status} tone="success" />
                    </Cell>
                    <Cell>
                      <LockedYnCell locked={member.locked} />
                    </Cell>
                    <Cell>
                      <RowActions
                        onView={() => undefined}
                        onEdit={() => setFormOpen(true)}
                        onDelete={() => undefined}
                      />
                    </Cell>
                  </Row>
                ))}
          </SimpleTable>
        )}
        <PaginationFooter />
      </DataCard>

      <FormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        title="Staff Register"
        onSubmit={handleSubmit}
        submitLabel={isCreating ? "Saving..." : "Save Staff"}
      >
        <ModalGrid>
          <FormInput
            label="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <FormInput
            label="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <FormInput
            label="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
          <FormInput
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <FormSelect
            label="Role"
            value={form.role}
            onChange={(e) =>
              setForm({ ...form, role: e.target.value as StaffMember["role"] })
            }
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </FormSelect>
          <FormInput
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </ModalGrid>
      </FormModal>
    </PageShell>
  );
}
