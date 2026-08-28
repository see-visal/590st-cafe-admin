"use client";

import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/shared/page-header";
import { PageShell } from "@/components/shared/page-shell";
import {
  AdminTopActions,
  DataCard,
  FilterActions,
  FilterPanel,
  FormInput,
  FormModal,
  FormSelect,
  LockedYnCell,
  ModalGrid,
  RowActions,
  SelectField,
  SelectItem,
  StaffIdentityCell,
  StatusBadge,
  TableActions,
  TextField,
} from "@/components/shared/admin-kit";
import { useStaff } from "@/features/staff/hooks/use-staff";
import { useCreateStaff } from "@/features/staff/hooks/use-create-staff";
import { DataTable } from "@/components/shared/data-table";
import { autoColumns, downloadCsv } from "@/lib/export-csv";

const ROLES = ["ADMIN", "MANAGER", "BARISTA", "CASHIER", "DELIVERY_RIDER"] as const;

const staffSchema = z.object({
  name: z.string().trim().min(2, "Enter at least 2 characters."),
  email: z.string().trim().email("Enter a valid email address."),
  phone: z.string().trim().min(6, "Enter a valid phone number."),
  username: z.string().trim(),
  password: z
    .string()
    .refine((value) => value.length === 0 || value.length >= 8, {
      message: "Use at least 8 characters.",
    }),
  role: z.enum(ROLES),
});

type StaffFormValues = z.infer<typeof staffSchema>;

type StaffRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  created: string;
  status: string;
  locked: boolean;
};

const STAFF_FORM_DEFAULTS: StaffFormValues = {
  name: "",
  email: "",
  phone: "",
  username: "",
  password: "",
  role: "BARISTA",
};

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
  const { staff, isLoading } = useStaff();
  const { create, isLoading: isCreating } = useCreateStaff();
  const [formOpen, setFormOpen] = useState(false);
  const {
    control,
    handleSubmit: submitForm,
    reset,
    formState: { errors },
  } = useForm<StaffFormValues>({
    resolver: zodResolver(staffSchema),
    defaultValues: STAFF_FORM_DEFAULTS,
  });

  const hasApiData = staff.length > 0;

  const [nameQuery, setNameQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [lockedFilter, setLockedFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const rows = useMemo<StaffRow[]>(
    () =>
      hasApiData
        ? staff.map((member) => ({
            id: String(member.id),
            name: member.name,
            email: member.email,
            role: member.role,
            created: formatCreatedDate(member.joinDate),
            status: member.status === "ACTIVE" ? "Enabled" : member.status,
            locked: member.status !== "ACTIVE",
          }))
        : STATIC_STAFF_ROWS.map((member) => ({ ...member })),
    [hasApiData, staff]
  );

  const columns = useMemo<ColumnDef<StaffRow>[]>(
    () => [
      {
        id: "number",
        header: "No",
        enableSorting: false,
        cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: "name",
        header: "Customer",
        cell: ({ row }) => (
          <StaffIdentityCell name={row.original.name} email={row.original.email} />
        ),
      },
      { accessorKey: "role", header: "Role" },
      { accessorKey: "created", header: "Created" },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge
            label={row.original.status}
            tone={row.original.status === "Enabled" ? "success" : "neutral"}
          />
        ),
      },
      {
        accessorKey: "locked",
        header: "Locked YN",
        cell: ({ row }) => <LockedYnCell locked={row.original.locked} />,
      },
      {
        id: "actions",
        header: "Action",
        enableSorting: false,
        cell: () => (
          <RowActions
            onView={() => undefined}
            onEdit={() => setFormOpen(true)}
            onDelete={() => undefined}
          />
        ),
      },
    ],
    []
  );

  const handleSubmit = submitForm(async (form) => {
    await create({
      name: form.name,
      email: form.email,
      phone: form.phone,
      username: form.username || form.email.split("@")[0],
      password: form.password || "ChangeMe123!",
      role: form.role,
    });
    setFormOpen(false);
    reset(STAFF_FORM_DEFAULTS);
  });

  const handleFormOpenChange = (open: boolean) => {
    setFormOpen(open);
    if (!open) reset(STAFF_FORM_DEFAULTS);
  };

  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        const matchesName =
          !nameQuery ||
          row.name.toLowerCase().includes(nameQuery.toLowerCase()) ||
          row.email.toLowerCase().includes(nameQuery.toLowerCase());
        const matchesRole = !roleFilter || row.role === roleFilter;
        const matchesLocked = !lockedFilter || (lockedFilter === "disabled") === row.locked;
        const matchesStatus =
          !statusFilter || row.status.toLowerCase() === statusFilter.toLowerCase();
        return matchesName && matchesRole && matchesLocked && matchesStatus;
      }),
    [rows, nameQuery, roleFilter, lockedFilter, statusFilter]
  );

  const handleClearFilters = () => {
    setNameQuery("");
    setRoleFilter("");
    setLockedFilter("");
    setStatusFilter("");
  };

  const handleExport = () =>
    downloadCsv("staff", filteredRows as never[], autoColumns(filteredRows as never[]));

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
        <TextField
          label="Staff"
          placeholder="Search name or email"
          value={nameQuery}
          onChange={(e) => setNameQuery(e.target.value)}
        />
        <SelectField label="Role" value={roleFilter} onValueChange={setRoleFilter}>
          <SelectItem value="ADMIN">Admin</SelectItem>
          <SelectItem value="MANAGER">Manager</SelectItem>
          <SelectItem value="BARISTA">Barista</SelectItem>
          <SelectItem value="CASHIER">Cashier</SelectItem>
          <SelectItem value="DELIVERY_RIDER">Delivery Rider</SelectItem>
        </SelectField>
        <SelectField label="Locked YN" value={lockedFilter} onValueChange={setLockedFilter}>
          <SelectItem value="enabled">Enabled</SelectItem>
          <SelectItem value="disabled">Disabled</SelectItem>
        </SelectField>
        <SelectField label="Status" value={statusFilter} onValueChange={setStatusFilter}>
          <SelectItem value="Enabled">Enabled</SelectItem>
          <SelectItem value="Disabled">Disabled</SelectItem>
        </SelectField>
        <FilterActions onClear={handleClearFilters} />
      </FilterPanel>

      <DataCard
        title="Customer Directory"
        meta={`Staff found: ${filteredRows.length}`}
        actions={
          <TableActions
            onExport={handleExport}
            onRegister={() => setFormOpen(true)}
            primaryLabel="Register"
          />
        }
      >
        {isLoading ? (
          <p className="p-4 text-sm text-gray-500">Loading staff...</p>
        ) : (
          <DataTable
            columns={columns}
            data={filteredRows}
            searchPlaceholder="Search staff..."
          />
        )}
      </DataCard>

      <FormModal
        open={formOpen}
        onOpenChange={handleFormOpenChange}
        title="Staff Register"
        onSubmit={handleSubmit}
        submitLabel="Save Staff"
        isLoading={isCreating}
      >
        <ModalGrid>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <FormInput
                label="Full Name"
                required
                error={errors.name?.message}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <FormInput
                label="Email"
                type="email"
                required
                error={errors.email?.message}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            name="username"
            control={control}
            render={({ field }) => (
              <FormInput
                label="Username"
                error={errors.username?.message}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <FormInput
                label="Phone"
                required
                error={errors.phone?.message}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <FormSelect
                label="Role"
                required
                error={errors.role?.message}
                value={field.value}
                onValueChange={field.onChange}
              >
                {ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </FormSelect>
            )}
          />
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <FormInput
                label="Password"
                type="password"
                error={errors.password?.message}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </ModalGrid>
      </FormModal>
    </PageShell>
  );
}
