"use client";

import { useState } from "react";
import { PageHeader } from "@/components/cafe/PageHeader";
import { PageShell } from "@/components/cafe/PageShell";
import {
  AdminTopActions,
  Cell,
  DataCard,
  FilterActions,
  FilterPanel,
  FormInput,
  FormModal,
  FormSelect,
  ModalGrid,
  PaginationFooter,
  Row,
  RowActions,
  SelectField,
  SimpleTable,
  StatusBadge,
  TableActions,
  TextField,
} from "@/components/cafe/AdminKit";
import { useStaff, useCreateStaff } from "@/hooks/useAdmin";
import { Staff as StaffMember } from "@/lib/services/adminService";

const ROLES = ["ADMIN", "MANAGER", "BARISTA", "CASHIER", "DELIVERY_RIDER"] as const;

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
        <TextField label="Search" placeholder="Name or email..." />
        <SelectField label="Role" />
        <SelectField label="Status" />
        <FilterActions />
      </FilterPanel>

      <DataCard
        title="Staff Directory"
        meta={`Staff found: ${staff.length}`}
        actions={<TableActions onRegister={() => setFormOpen(true)} primaryLabel="Add Staff" />}
      >
        {isLoading ? (
          <p className="p-4 text-sm text-gray-500">Loading staff...</p>
        ) : (
          <SimpleTable
            headers={["No", "Staff", "Role", "Joined", "Status", "Action"]}
          >
            {staff.map((member, index) => (
              <Row key={member.id} striped={index % 2 === 1}>
                <Cell>{index + 1}</Cell>
                <Cell>
                  <div className="flex items-center gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-md bg-black font-semibold text-[#befe35]">
                      {member.name.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <p>{member.name}</p>
                      <p className="text-xs text-gray-400">{member.email}</p>
                    </div>
                  </div>
                </Cell>
                <Cell>{member.role}</Cell>
                <Cell>{new Date(member.joinDate).toLocaleDateString()}</Cell>
                <Cell>
                  <StatusBadge label={member.status} />
                </Cell>
                <Cell>
                  <RowActions onEdit={() => setFormOpen(true)} />
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
