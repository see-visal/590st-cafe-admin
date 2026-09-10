"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useCurrentRole } from "@/store/api/useCurrentRole";
import toast from "react-hot-toast";
import { PageShell } from "@/components/common/PageShell";
import { PageHeader } from "@/components/common/PageHeader";
import {
  AdminTopActions,
  Cell,
  DataCard,
  DetailGrid,
  DetailImage,
  DetailItem,
  DetailModal,
  FilterActions,
  FilterPanel,
  FormInput,
  FormImageUpload,
  FormModal,
  FormSelect,
  ModalGrid,
  PaginationFooter,
  Row,
  RowActions,
  SelectField,
  SimpleTable,
  StaffIdentityCell,
  StatTile,
  StatusBadge,
  TableActions,
  TableState,
  TextField,
} from "@/components/common/AdminKit";
import { apiErrorMessage } from "@/store/api/baseApi";
import { usePageSize } from "@/contexts/AdminPreferencesContext";
import {
  useCreateAdminMutation,
  useCreateBaristaMutation,
  useDeleteAdminMutation,
  useDeleteBaristaMutation,
  useListAdminsQuery,
  useListBaristasQuery,
  useUpdateAdminMutation,
  useUpdateBaristaMutation,
  useUploadStaffAvatarMutation,
} from "@/store/api/userApi";
import { humanise, statusTone } from "@/features/user/components/UserManagementView";
import type { Gender, UserResponse, UserStatus } from "@/store/api/types";

const STAFF_TABLE_HEADERS = [
  "No",
  "Staff",
  "Phone",
  "Gender",
  "Role",
  "Created By",
  "Status",
  "Action",
] as const;

/** Admins and baristas are separate endpoints, so the screen tabs between them. */
type StaffKind = "ADMIN" | "BARISTA";

type StaffFormFields = {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  gender: string;
  status: UserStatus;
};

const EMPTY_FORM: StaffFormFields = {
  fullName: "",
  email: "",
  password: "",
  phoneNumber: "",
  gender: "",
  status: "ACTIVE",
};

export default function Staff() {
  const { role, isAdmin } = useCurrentRole();
  const canManageAdmins = role === "SUPER_ADMIN";
  const [kind, setKind] = useState<StaffKind>("BARISTA");
  const [formKind, setFormKind] = useState<StaffKind>("BARISTA");
  const [page, setPage] = useState(1);
  const [size, setSize] = usePageSize();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const adminQuery = useListAdminsQuery(
    { page, size },
    { skip: !canManageAdmins || kind !== "ADMIN" }
  );
  const baristaQuery = useListBaristasQuery(
    { page, size },
    { skip: !isAdmin || kind !== "BARISTA" }
  );
  const active = kind === "ADMIN" ? adminQuery : baristaQuery;

  const [createAdmin, { isLoading: isCreatingAdmin }] = useCreateAdminMutation();
  const [createBarista, { isLoading: isCreatingBarista }] = useCreateBaristaMutation();
  const [updateAdmin, { isLoading: isUpdatingAdmin }] = useUpdateAdminMutation();
  const [updateBarista, { isLoading: isUpdatingBarista }] = useUpdateBaristaMutation();
  const [deleteAdmin] = useDeleteAdminMutation();
  const [deleteBarista] = useDeleteBaristaMutation();
  const [uploadAvatar, { isLoading: isUploadingAvatar }] = useUploadStaffAvatarMutation();
  const submitting = useRef(false);

  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<UserResponse | null>(null);
  const [form, setForm] = useState<StaffFormFields>(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>();

  useEffect(() => {
    if (!imageFile) {
      setImagePreview(undefined);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const handlePickImage = (file: File | null) => {
    if (submitting.current) return;
    if (file && !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      toast.error("Choose a JPEG, PNG, WebP, or GIF image");
      return;
    }
    if (file && (file.size === 0 || file.size > 5 * 1024 * 1024)) {
      toast.error("Choose a non-empty image of 5 MB or smaller");
      return;
    }
    setImageFile(file);
  };

  const staff = useMemo(() => active.data?.content ?? [], [active.data]);

  const visibleStaff = useMemo(
    () =>
      staff.filter((member) => {
        const term = searchTerm.trim().toLowerCase();
        const matchesSearch =
          !term ||
          member.fullName.toLowerCase().includes(term) ||
          member.email.toLowerCase().includes(term);
        const matchesStatus = !statusFilter || member.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [staff, searchTerm, statusFilter]
  );

  const activeCount = staff.filter((s) => s.status === "ACTIVE").length;

  const handleOpenForm = (member?: UserResponse, createKind: StaffKind = kind) => {
    const targetKind = member?.role === "ADMIN" ? "ADMIN" : member ? "BARISTA" : createKind;
    if (!isAdmin || (targetKind === "ADMIN" && !canManageAdmins)) return;
    setFormKind(targetKind);
    setImageFile(null);
    setSelected(member ?? null);
    setForm(
      member
        ? {
            fullName: member.fullName,
            email: member.email,
            password: "",
            phoneNumber: member.phoneNumber ?? "",
            gender: member.gender ?? "",
            status: member.status,
          }
        : EMPTY_FORM
    );
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    if (submitting.current) return;
    if (!isAdmin || (formKind === "ADMIN" && !canManageAdmins)) {
      toast.error("Your account cannot manage this staff role.");
      return;
    }
    const fullName = form.fullName.trim();
    if (!fullName) {
      toast.error("Full name is required");
      return;
    }

    submitting.current = true;
    let detailsSaved = false;
    try {
      let savedMember: UserResponse;
      if (selected) {
        // Email and password are not editable through UpdateStaffRequest.
        const body = {
          fullName,
          phoneNumber: form.phoneNumber.trim() || undefined,
          gender: (form.gender || undefined) as Gender | undefined,
          status: form.status,
        };
        if (formKind === "ADMIN") {
          savedMember = await updateAdmin({ id: selected.id, body }).unwrap();
        } else {
          savedMember = await updateBarista({ id: selected.id, body }).unwrap();
        }
      } else {
        if (!form.email.trim()) {
          toast.error("Email is required");
          return;
        }
        if (form.password.length < 8) {
          toast.error("Password must be at least 8 characters");
          return;
        }
        const body = {
          fullName,
          email: form.email.trim(),
          password: form.password,
          phoneNumber: form.phoneNumber.trim() || undefined,
          gender: (form.gender || undefined) as Gender | undefined,
        };
        if (formKind === "ADMIN") {
          savedMember = await createAdmin(body).unwrap();
        } else {
          savedMember = await createBarista(body).unwrap();
        }
      }
      detailsSaved = true;
      // Preserve the created account if its separate photo upload fails, so retry edits it.
      setSelected(savedMember);
      setForm((current) => ({ ...current, password: "" }));
      if (imageFile) {
        await uploadAvatar({ id: savedMember.id, role: formKind, file: imageFile }).unwrap();
      }
      toast.success(selected ? "Staff member updated" : `${formKind === "ADMIN" ? "Admin" : "Barista"} created`);
      setKind(formKind);
      setPage(1);
      setFormOpen(false);
      setSelected(null);
      setForm(EMPTY_FORM);
      setImageFile(null);
    } catch (err) {
      toast.error(detailsSaved
        ? `Staff details saved, but the photo was not uploaded. ${apiErrorMessage(err as never, "Please try again.")} Submit again to retry.`
        : apiErrorMessage(err as never, "Could not save the staff member."));
    } finally {
      submitting.current = false;
    }
  };

  const handleDelete = async (member: UserResponse) => {
    if (!isAdmin || (member.role === "ADMIN" && !canManageAdmins)) return;
    if (!window.confirm(`Remove ${member.fullName}?`)) return;
    try {
      if (member.role === "ADMIN") {
        await deleteAdmin(member.id).unwrap();
      } else {
        await deleteBarista(member.id).unwrap();
      }
      toast.success("Staff member removed");
    } catch (err) {
      toast.error(apiErrorMessage(err as never, "Could not remove the staff member."));
    }
  };

  const isSaving =
    isCreatingAdmin || isCreatingBarista || isUpdatingAdmin || isUpdatingBarista || isUploadingAvatar;

  return (
    <PageShell>
      <PageHeader
        title="Staff"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Staff" }]}
        rightSlot={<AdminTopActions />}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <StatTile
          title={kind === "ADMIN" ? "All Admins" : "All Baristas"}
          value={String(active.data?.totalElements ?? 0)}
          tone="gray"
        />
        <StatTile title="Active (this page)" value={String(activeCount)} tone="green" />
      </div>

      <FilterPanel>
        <SelectField
          label="Staff Type"
          value={kind}
          onChange={(e) => {
            if (!e.target.value) return;
            const nextKind = e.target.value as StaffKind;
            if (nextKind === "ADMIN" && !canManageAdmins) return;
            setKind(nextKind);
            setPage(1);
          }}
        >
          <option value="BARISTA">Baristas</option>
          {canManageAdmins && <option value="ADMIN">Admins</option>}
        </SelectField>
        <TextField
          label="Name or Email"
          placeholder="Search staff"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <SelectField
          label="Status"
          placeholder="All statuses"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ACTIVE">Active</option>
          <option value="PENDING_VERIFICATION">Pending Verification</option>
          <option value="DEACTIVATED">Deactivated</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="BANNED">Banned</option>
        </SelectField>
        <FilterActions onClear={() => { setSearchTerm(""); setStatusFilter(""); setPage(1); }} onSearch={active.refetch} />
      </FilterPanel>

      <DataCard
        title={kind === "ADMIN" ? "Admins" : "Baristas"}
        meta={`Total: ${active.data?.totalElements ?? 0}`}
        actions={
          <div className="flex flex-wrap gap-2">
            {canManageAdmins && <TableActions onRegister={() => handleOpenForm(undefined, "ADMIN")} primaryLabel="Add Admin" />}
            {isAdmin && <TableActions onRegister={() => handleOpenForm(undefined, "BARISTA")} primaryLabel="Add Barista" />}
          </div>
        }
      >
        <SimpleTable headers={[...STAFF_TABLE_HEADERS]}>
          <TableState
            colSpan={STAFF_TABLE_HEADERS.length}
            isLoading={active.isFetching}
            error={active.error}
            isEmpty={visibleStaff.length === 0}
            emptyLabel={`No ${kind === "ADMIN" ? "admins" : "baristas"} yet.`}
            onRetry={active.refetch}
          />
          {!active.isFetching &&
            !active.error &&
            visibleStaff.map((member, index) => (
              <Row key={member.id} striped={index % 2 === 1}>
                <Cell>{(page - 1) * size + index + 1}</Cell>
                <Cell>
                  <StaffIdentityCell name={member.fullName} email={member.email} avatarUrl={member.avatarUrl} />
                </Cell>
                <Cell>{member.phoneNumber || "-"}</Cell>
                <Cell>{member.gender ? humanise(member.gender) : "-"}</Cell>
                <Cell>{humanise(member.role)}</Cell>
                <Cell>{member.createdByName ?? "-"}</Cell>
                <Cell>
                  <StatusBadge
                    label={humanise(member.status)}
                    tone={statusTone(member.status)}
                  />
                </Cell>
                <Cell>
                  <RowActions
                    onView={() => {
                      setSelected(member);
                      setDetailOpen(true);
                    }}
                    onEdit={() => handleOpenForm(member)}
                    onDelete={() => handleDelete(member)}
                    isLoading={isSaving}
                  />
                </Cell>
              </Row>
            ))}
        </SimpleTable>
        <PaginationFooter
          page={active.data?.page ?? page}
          totalPages={active.data?.totalPages ?? 1}
          size={size}
          totalElements={active.data?.totalElements}
          onPageChange={setPage}
          onSizeChange={(next) => {
            setSize(next);
            setPage(1);
          }}
        />
      </DataCard>

      <FormModal
        open={formOpen}
        onOpenChange={(open) => {
          if (submitting.current) return;
          setFormOpen(open);
          if (!open) setImageFile(null);
        }}
        title={
          selected
            ? "Modify Staff"
            : `Register ${formKind === "ADMIN" ? "Admin" : "Barista"}`
        }
        submitLabel="Submit"
        onSubmit={handleSubmit}
        isLoading={isSaving}
      >
        <ModalGrid>
          <FormSelect label="Account Role" value={formKind} disabled={Boolean(selected) || isSaving}
            onChange={(event) => {
              const nextKind = event.target.value as StaffKind;
              if (nextKind === "BARISTA" || (nextKind === "ADMIN" && canManageAdmins)) setFormKind(nextKind);
            }}>
            <option value="BARISTA">Barista</option>
            {canManageAdmins && <option value="ADMIN">Admin</option>}
          </FormSelect>
          <div className="md:col-span-3">
            {(imagePreview || selected?.avatarUrl) && <DetailImage src={imagePreview || selected?.avatarUrl || undefined} alt="Staff profile photo" />}
            <FormImageUpload label="Profile Photo" file={imageFile} onChange={handlePickImage} disabled={isSaving}
              accept="image/jpeg,image/png,image/webp,image/gif" emptyLabel={selected?.avatarUrl ? "Choose a photo to replace the current one" : "No photo selected"} />
            <p className="mt-2 text-sm text-muted-foreground">Optional. JPEG, PNG, WebP, or GIF, up to 5 MB. Saved when you submit.</p>
            {imageFile && <button type="button" className="mt-2 text-sm underline" disabled={isSaving} onClick={() => setImageFile(null)}>Clear selected photo</button>}
          </div>
          <FormInput
            label="Full Name"
            placeholder="e.g. Sophal Nem"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            required
          />
          <FormInput
            label="Email"
            type="email"
            placeholder="user@gmail.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            readOnly={Boolean(selected)}
            required={!selected}
          />
          {/* Only set at creation — the API offers no password change on this resource. */}
          {selected ? null : (
            <FormInput
              label="Password"
              type="password"
              placeholder="Min 8 chars, mixed case, digit + symbol"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          )}
          <FormInput
            label="Phone Number"
            placeholder="072 345 5674"
            value={form.phoneNumber}
            onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
          />
          <FormSelect
            label="Gender"
            placeholder="Select gender"
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
          >
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </FormSelect>
          {selected ? (
            <FormSelect
              label="Status"
              placeholder="Select status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as UserStatus })}
            >
              <option value="ACTIVE">Active</option>
              <option value="DEACTIVATED">Deactivated</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="BANNED">Banned</option>
            </FormSelect>
          ) : null}
        </ModalGrid>
      </FormModal>

      <DetailModal
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) setSelected(null);
        }}
        title="Staff Detail"
        onEdit={() => {
          const member = selected;
          setDetailOpen(false);
          if (member) handleOpenForm(member);
        }}
      >
        {selected && (
          <div className="admin_modal_form_wrap">
            {selected.avatarUrl && <DetailImage src={selected.avatarUrl} alt={`${selected.fullName}'s profile photo`} />}
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
                  : "-"}
              </DetailItem>
            </DetailGrid>
          </div>
        )}
      </DetailModal>
    </PageShell>
  );
}
