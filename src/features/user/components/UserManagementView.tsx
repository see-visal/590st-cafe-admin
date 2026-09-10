"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { PageShell } from "@/components/common/PageShell";
import { PageHeader } from "@/components/common/PageHeader";
import {
  AdminTopActions,
  Cell,
  DataCard,
  DetailGrid,
  DetailItem,
  DetailModal,
  FilterActions,
  FilterPanel,
  FormModal,
  FormInput,
  FormSelect,
  ModalGrid,
  PaginationFooter,
  Row,
  RowActions,
  SelectField,
  SimpleTable,
  StatTile,
  StatusBadge,
  TableState,
  TextField,
  Thumbnail,
} from "@/components/common/AdminKit";
import { apiErrorMessage } from "@/store/api/baseApi";
import { usePageSize, useRefreshOptions } from "@/contexts/AdminPreferencesContext";
import { useListUsersQuery, useUpdateUserStatusMutation, useUpdateUserMutation, useDeleteUserMutation } from "@/store/api/userApi";
import type { Gender, Role, UserResponse, UserStatus } from "@/store/api/types";

const USER_TABLE_HEADERS = [
  "No",
  "Avatar",
  "Full Name",
  "Email",
  "Phone",
  "Role",
  "Telegram",
  "Status",
  "Action",
] as const;

const USER_STATUSES: UserStatus[] = [
  "ACTIVE",
  "PENDING_VERIFICATION",
  "DEACTIVATED",
  "SUSPENDED",
  "BANNED",
  "DELETED",
];

export function statusTone(
  status: UserStatus
): "success" | "warning" | "danger" | "neutral" {
  if (status === "ACTIVE") return "success";
  if (status === "PENDING_VERIFICATION") return "warning";
  if (status === "DEACTIVATED") return "neutral";
  return "danger";
}

/** PENDING_VERIFICATION -> "Pending Verification" */
export function humanise(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Super admins can view, edit and delete stored accounts here.
 * New staff accounts are created on the Staff screen.
 */
export default function UserManagementView({
  role,
  title = "Users",
  emptyLabel = "No user accounts found.",
}: {
  role?: Role;
  title?: string;
  emptyLabel?: string;
} = {}) {
  const [page, setPage] = useState(1);
  const [size, setSize] = usePageSize();
  const refresh = useRefreshOptions();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>(role ?? "");

  const effectiveRole = (role ?? roleFilter) || undefined;

  const {
    data: userPage,
    isFetching,
    error,
    refetch,
  } = useListUsersQuery({
    page,
    size,
    ...(effectiveRole ? { role: effectiveRole as Role } : {}),
  }, refresh);

  const [updateStatus, { isLoading: isUpdating }] = useUpdateUserStatusMutation();
  const [updateUser, { isLoading: isSavingProfile }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const [detailOpen, setDetailOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState<Gender | "">("");
  const [selected, setSelected] = useState<UserResponse | null>(null);
  const [nextStatus, setNextStatus] = useState<UserStatus>("ACTIVE");

  const users = useMemo(() => userPage?.content ?? [], [userPage]);

  const visibleUsers = useMemo(
    () =>
      users.filter((user) => {
        const term = searchTerm.trim().toLowerCase();
        const matchesSearch =
          !term ||
          user.fullName.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term);
        const matchesStatus = !statusFilter || user.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [users, searchTerm, statusFilter]
  );

  const activeCount = users.filter((u) => u.status === "ACTIVE").length;

  const handleSaveProfile = async () => {
    if (!selected) return;
    if (fullName.trim().length < 2) {
      toast.error("Full name must contain at least two characters.");
      return;
    }
    try {
      await updateUser({ id: selected.id, body: {
        fullName: fullName.trim(), phoneNumber: phoneNumber.trim(), ...(gender ? { gender } : {}),
      } }).unwrap();
      toast.success("Account updated");
      setEditOpen(false);
      setSelected(null);
    } catch (err) {
      toast.error(apiErrorMessage(err as never, "Could not update the account."));
    }
  };

  const handleDelete = async (user: UserResponse) => {
    if (!window.confirm(`Delete ${user.fullName}'s account? They will lose access. Past orders and attendance will be retained.`)) return;
    try {
      await deleteUser(user.id).unwrap();
      toast.success("Account deleted");
    } catch (err) {
      toast.error(apiErrorMessage(err as never, "Could not delete the account."));
    }
  };

  const handleSubmitStatus = async () => {
    if (!selected) return;
    try {
      await updateStatus({ id: selected.id, status: nextStatus }).unwrap();
      toast.success(`${selected.fullName} is now ${humanise(nextStatus)}`);
      setStatusOpen(false);
      setSelected(null);
    } catch (err) {
      toast.error(apiErrorMessage(err as never, "Could not update the account status."));
    }
  };

  return (
    <PageShell>
      <PageHeader
        title={title}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: title }]}
        rightSlot={<AdminTopActions />}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <StatTile title={`All ${title}`} value={String(userPage?.totalElements ?? 0)} tone="gray" />
        <StatTile title="Active (this page)" value={String(activeCount)} tone="green" />
      </div>

      <FilterPanel>
        <TextField
          label="Name or Email"
          placeholder="Search accounts"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {/* Locked when the screen is already scoped to one role (e.g. Customers). */}
        {role ? null : (
          <SelectField
            label="Role"
            placeholder="All roles"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="ADMIN">Admin</option>
            <option value="BARISTA">Barista</option>
            <option value="CUSTOMER">Customer</option>
          </SelectField>
        )}
        <SelectField
          label="Status"
          placeholder="All statuses"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {USER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {humanise(status)}
            </option>
          ))}
        </SelectField>
        <FilterActions onClear={() => { setSearchTerm(""); setStatusFilter(""); setRoleFilter(role ?? ""); setPage(1); }} onSearch={refetch} />
      </FilterPanel>

      <DataCard title={title} meta={`Total: ${userPage?.totalElements ?? 0}`}>
        <SimpleTable headers={[...USER_TABLE_HEADERS]}>
          <TableState
            colSpan={USER_TABLE_HEADERS.length}
            isLoading={isFetching}
            error={error}
            isEmpty={visibleUsers.length === 0}
            emptyLabel={emptyLabel}
            onRetry={refetch}
          />
          {!isFetching &&
            !error &&
            visibleUsers.map((user, index) => (
              <Row key={user.id} striped={index % 2 === 1}>
                <Cell>{(page - 1) * size + index + 1}</Cell>
                <Cell>
                  <Thumbnail src={user.avatarUrl ?? undefined} />
                </Cell>
                <Cell className="font-semibold">{user.fullName}</Cell>
                <Cell>{user.email}</Cell>
                <Cell>{user.phoneNumber || "-"}</Cell>
                <Cell>{humanise(user.role)}</Cell>
                <Cell>
                  <StatusBadge
                    label={user.telegramLinked ? "Linked" : "Not linked"}
                    tone={user.telegramLinked ? "success" : "neutral"}
                  />
                </Cell>
                <Cell>
                  <button type="button" aria-label={`Change status for ${user.fullName}`} disabled={isUpdating || isDeleting}
                    onClick={() => { setSelected(user); setNextStatus(user.status); setStatusOpen(true); }}>
                    <StatusBadge label={humanise(user.status)} tone={statusTone(user.status)} />
                  </button>
                </Cell>
                <Cell>
                  <RowActions
                    onView={() => {
                      setSelected(user);
                      setDetailOpen(true);
                    }}
                    onEdit={() => {
                      setSelected(user);
                      setFullName(user.fullName);
                      setPhoneNumber(user.phoneNumber ?? "");
                      setGender(user.gender ?? "");
                      setEditOpen(true);
                    }}
                    onDelete={user.status !== "DELETED" ? () => handleDelete(user) : undefined}
                    isLoading={isUpdating || isSavingProfile || isDeleting}
                  />
                </Cell>
              </Row>
            ))}
        </SimpleTable>
        <PaginationFooter
          page={userPage?.page ?? page}
          totalPages={userPage?.totalPages ?? 1}
          size={size}
          totalElements={userPage?.totalElements}
          onPageChange={setPage}
          onSizeChange={(next) => {
            setSize(next);
            setPage(1);
          }}
        />
      </DataCard>

      <FormModal open={editOpen} onOpenChange={setEditOpen} title="Edit Account" submitLabel="Save" onSubmit={handleSaveProfile} isLoading={isSavingProfile}>
        <ModalGrid>
          <FormInput label="Full Name" value={fullName} onChange={(event) => setFullName(event.target.value)} required />
          <FormInput label="Phone" value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} />
          <FormSelect label="Gender" value={gender} onChange={(event) => setGender(event.target.value as Gender | "")}>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </FormSelect>
        </ModalGrid>
      </FormModal>

      <FormModal
        open={statusOpen}
        onOpenChange={setStatusOpen}
        title="Change Account Status"
        submitLabel="Save"
        onSubmit={handleSubmitStatus}
        isLoading={isUpdating}
      >
        <ModalGrid>
          <FormSelect
            label={`Status for ${selected?.fullName ?? ""}`}
            placeholder="Select status"
            value={nextStatus}
            onChange={(e) => setNextStatus(e.target.value as UserStatus)}
            required
          >
            {USER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {humanise(status)}
              </option>
            ))}
          </FormSelect>
        </ModalGrid>
      </FormModal>

      <DetailModal
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) setSelected(null);
        }}
        title="Account Detail"
      >
        {selected && (
          <div className="admin_modal_form_wrap">
            <DetailGrid>
              <DetailItem label="Full Name">{selected.fullName}</DetailItem>
              <DetailItem label="Email">{selected.email}</DetailItem>
              <DetailItem label="Phone">{selected.phoneNumber || "-"}</DetailItem>
              <DetailItem label="Gender">
                {selected.gender ? humanise(selected.gender) : "-"}
              </DetailItem>
              <DetailItem label="Role">{humanise(selected.role)}</DetailItem>
              <DetailItem label="Status">
                <StatusBadge
                  label={humanise(selected.status)}
                  tone={statusTone(selected.status)}
                />
              </DetailItem>
              <DetailItem label="Telegram">
                {selected.telegramLinked ? "Linked" : "Not linked"}
              </DetailItem>
              <DetailItem label="Created By">
                {selected.createdByName
                  ? `${selected.createdByName} (${selected.createdByRole})`
                  : "Self-registered"}
              </DetailItem>
            </DetailGrid>
          </div>
        )}
      </DetailModal>
    </PageShell>
  );
}
