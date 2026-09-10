"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  Check,
  KeyRound,
  Loader2,
  Mail,
  Send,
  ShieldCheck,
  Trash2,
  Upload,
  UserRound,
} from "lucide-react";

import { PageShell } from "@/components/common/PageShell";
import { PageHeader } from "@/components/common/PageHeader";
import {
  AdminTopActions,
  DataCard,
  DetailGrid,
  DetailItem,
  FormInput,
  FormSelect,
  StatusBadge,
} from "@/components/common/AdminKit";
import { apiErrorMessage } from "@/store/api/baseApi";
import {
  useChangePasswordMutation,
  useGetCurrentUserQuery,
  useRemoveAvatarMutation,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
} from "@/store/api/authApi";
import type { Gender, UpdateProfileRequest } from "@/store/api/types";
import { humanise, statusTone } from "@/features/user/components/UserManagementView";

const GENDERS: Gender[] = ["MALE", "FEMALE", "OTHER"];

/** Matches the API's ValidationPatterns.STRONG_PASSWORD_REGEX so we fail fast in the browser. */
const STRONG_PASSWORD =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

const EMPTY_PASSWORD_FORM = { current: "", next: "", confirm: "" };

/**
 * The signed-in account's own page: full detail plus the three things staff previously had no
 * way to do for themselves — edit their name/phone/gender, change their avatar, and change
 * their password. All of it goes through `/api/users/me`, which is open to any authenticated
 * account; `/api/admin/admins/{id}` is SUPER_ADMIN-only, so an admin or barista could not
 * maintain their own record before this existed.
 *
 * The super admin has no `User` row behind it — it signs in from SUPER_ADMIN_EMAIL /
 * SUPER_ADMIN_PASSWORD so the shop can never be locked out by a bad database. Its display
 * profile is still its own to maintain, and is stored separately; only the email and password
 * remain configuration, and only those two are disabled here.
 */
export default function ProfileView() {
  const { data: user, isLoading, error, refetch } = useGetCurrentUserQuery();

  const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();
  const [uploadAvatar, { isLoading: isUploading }] = useUploadAvatarMutation();
  const [removeAvatar, { isLoading: isRemovingAvatar }] = useRemoveAvatarMutation();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState<string>("");
  const [password, setPassword] = useState(EMPTY_PASSWORD_FORM);

  // The super admin signs in from configuration, so its email and password are the two things
  // that still cannot be changed here. Its name, phone, gender and avatar are persisted like
  // anyone else's and are editable.
  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const isPasswordConfigDriven = isSuperAdmin;

  // Re-seed the form from the server whenever the profile changes — including right after a
  // save, so the inputs show exactly what was persisted (a trimmed name, a cleared phone).
  useEffect(() => {
    if (!user) return;
    setFullName(user.fullName ?? "");
    setPhoneNumber(user.phoneNumber ?? "");
    setGender(user.gender ?? "");
  }, [user]);

  const isDirty =
    !!user &&
    (fullName !== (user.fullName ?? "") ||
      phoneNumber !== (user.phoneNumber ?? "") ||
      gender !== (user.gender ?? ""));

  const handleSaveProfile = async () => {
    if (!user) return;

    const trimmedName = fullName.trim();
    if (trimmedName.length < 2) {
      toast.error("Full name must be at least 2 characters");
      return;
    }

    // Send only what actually changed: the API treats null as "leave alone", and an untouched
    // phone number should not be re-validated against the Cambodian format on every save.
    const body: UpdateProfileRequest = {};
    if (trimmedName !== user.fullName) body.fullName = trimmedName;
    if (phoneNumber.trim() !== (user.phoneNumber ?? "")) body.phoneNumber = phoneNumber.trim();
    if (gender && gender !== user.gender) body.gender = gender as Gender;

    if (Object.keys(body).length === 0) {
      toast("Nothing to save");
      return;
    }

    try {
      await updateProfile(body).unwrap();
      toast.success("Profile updated");
    } catch (err) {
      toast.error(apiErrorMessage(err as never, "Could not update your profile."));
    }
  };

  const handleResetForm = () => {
    if (!user) return;
    setFullName(user.fullName ?? "");
    setPhoneNumber(user.phoneNumber ?? "");
    setGender(user.gender ?? "");
  };

  const handleChangePassword = async () => {
    if (!password.current) {
      toast.error("Enter your current password");
      return;
    }
    if (password.next !== password.confirm) {
      toast.error("The new passwords do not match");
      return;
    }
    if (!STRONG_PASSWORD.test(password.next)) {
      toast.error(
        "New password needs at least 8 characters, with an uppercase, a lowercase, a number and a symbol."
      );
      return;
    }
    if (password.next === password.current) {
      toast.error("The new password must be different from the current one");
      return;
    }

    try {
      await changePassword({
        currentPassword: password.current,
        newPassword: password.next,
      }).unwrap();
      setPassword(EMPTY_PASSWORD_FORM);
      toast.success("Password changed. Other devices will need to sign in again.");
    } catch (err) {
      toast.error(apiErrorMessage(err as never, "Could not change your password."));
    }
  };

  const handlePickAvatar = async (file: File | null) => {
    // Clear the input value so re-picking the same file still fires a change event.
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error("Image must be 5 MB or smaller");
      return;
    }

    try {
      await uploadAvatar(file).unwrap();
      toast.success("Photo updated");
    } catch (err) {
      toast.error(apiErrorMessage(err as never, "Could not upload your photo."));
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      await removeAvatar().unwrap();
      toast.success("Photo removed");
    } catch (err) {
      toast.error(apiErrorMessage(err as never, "Could not remove your photo."));
    }
  };

  if (isLoading) {
    return (
      <PageShell>
        <PageHeader
          title="My Profile"
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "Profile" }]}
          rightSlot={<AdminTopActions />}
        />
        <div className="flex min-h-[240px] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      </PageShell>
    );
  }

  if (error || !user) {
    return (
      <PageShell>
        <PageHeader
          title="My Profile"
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "Profile" }]}
          rightSlot={<AdminTopActions />}
        />
        <DataCard title="Profile">
          <div className="p-6 text-sm" role="alert">
            <p className="text-red-500">
              {apiErrorMessage(error as never, "Could not load your account.")}
            </p>
            <button type="button" className="mt-3 underline" onClick={() => refetch()}>
              Retry
            </button>
          </div>
        </DataCard>
      </PageShell>
    );
  }

  const avatarBusy = isUploading || isRemovingAvatar;

  return (
    <PageShell>
      <PageHeader
        title="My Profile"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Profile" }]}
        rightSlot={<AdminTopActions />}
      />

      {isSuperAdmin ? (
        <div
          className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4"
          role="status"
        >
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div className="text-sm">
            <p className="font-semibold text-amber-900">
              The super admin signs in from configuration
            </p>
            <p className="mt-1 text-amber-800">
              Your name, phone, gender and photo are yours to edit here. The email and password
              come from{" "}
              <code className="rounded bg-amber-100 px-1">SUPER_ADMIN_EMAIL</code> and{" "}
              <code className="rounded bg-amber-100 px-1">SUPER_ADMIN_PASSWORD</code> instead of
              the database — that is what keeps the shop from ever being locked out of its own
              admin — so change those two in the deployment environment.
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="space-y-6 lg:col-span-1">
          <DataCard title="Photo" meta="Shown beside your name across the dashboard.">
            <div className="flex flex-col items-center gap-4 p-2 pb-4">
              <div className="relative h-28 w-28 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
                {user.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt={user.fullName}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-3xl font-semibold text-gray-400">
                    {user.fullName.slice(0, 1).toUpperCase()}
                  </span>
                )}
                {avatarBusy ? (
                  <span className="absolute inset-0 grid place-items-center bg-white/70">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                  </span>
                ) : null}
              </div>

              <p className="text-center text-xs text-gray-400">
                JPG or PNG, up to 5&nbsp;MB.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => handlePickAvatar(e.target.files?.[0] ?? null)}
              />
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  className="btn_primary_black"
                  disabled={avatarBusy}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload />
                  {user.avatarUrl ? "Replace" : "Upload"}
                </button>
                {user.avatarUrl ? (
                  <button
                    type="button"
                    className="btn_outline_black"
                    disabled={avatarBusy}
                    onClick={handleRemoveAvatar}
                  >
                    <Trash2 />
                    Remove
                  </button>
                ) : null}
              </div>
            </div>
          </DataCard>

          <DataCard title="Account" meta="Managed by a super admin.">
            <div className="admin_modal_form_wrap p-2">
              <DetailGrid>
                <DetailItem label="Role">{humanise(user.role)}</DetailItem>
                <DetailItem label="Status">
                  <StatusBadge
                    label={humanise(user.status)}
                    tone={statusTone(user.status)}
                  />
                </DetailItem>
                <DetailItem label="Telegram">
                  <span className="inline-flex items-center gap-1.5">
                    <Send className="h-3.5 w-3.5 text-gray-400" />
                    {user.telegramLinked ? "Linked" : "Not linked"}
                  </span>
                </DetailItem>
                <DetailItem label="Created By">
                  {user.createdByName
                    ? `${user.createdByName} (${humanise(user.createdByRole ?? "")})`
                    : "Self-registered"}
                </DetailItem>
                <DetailItem label="Account ID">
                  <span className="break-all font-mono text-xs">{user.id}</span>
                </DetailItem>
              </DetailGrid>
            </div>
          </DataCard>
        </section>

        <section className="space-y-6 lg:col-span-2">
          <DataCard
            title="Personal Information"
            meta="Your own details — you don't need a super admin to change these."
          >
            <div className="space-y-6 p-2">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <FormInput
                  label="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                  required
                />
                <FormInput
                  label="Email"
                  value={user.email}
                  readOnly
                  placeholder="—"
                />
                <FormInput
                  label="Phone Number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="072 345 5674"
                />
                <FormSelect
                  label="Gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  placeholder="Not set"
                >
                  {GENDERS.map((option) => (
                    <option key={option} value={option}>
                      {humanise(option)}
                    </option>
                  ))}
                </FormSelect>
              </div>

              <p className="flex items-start gap-2 text-xs text-gray-400">
                <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Your email is your sign-in name and cannot be changed here — ask a super admin if
                it needs to move.
              </p>

              <div className="flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-6">
                <button
                  type="button"
                  className="btn_outline_black"
                  onClick={handleResetForm}
                  disabled={!isDirty || isSaving}
                >
                  Reset
                </button>
                <button
                  type="button"
                  className="btn_primary_black"
                  onClick={handleSaveProfile}
                  disabled={!isDirty || isSaving}
                >
                  {isSaving ? <Loader2 className="animate-spin" /> : <Check />}
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </DataCard>

          <DataCard
            title="Password"
            meta="Changing it signs your other devices out."
          >
            <div className="space-y-6 p-2">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <FormInput
                  label="Current Password"
                  type="password"
                  value={password.current}
                  onChange={(e) =>
                    setPassword((prev) => ({ ...prev, current: e.target.value }))
                  }
                  placeholder="••••••••"
                  required
                  readOnly={isPasswordConfigDriven}
                />
                <div className="hidden md:block" aria-hidden />
                <FormInput
                  label="New Password"
                  type="password"
                  value={password.next}
                  onChange={(e) => setPassword((prev) => ({ ...prev, next: e.target.value }))}
                  placeholder="••••••••"
                  required
                  readOnly={isPasswordConfigDriven}
                />
                <FormInput
                  label="Confirm New Password"
                  type="password"
                  value={password.confirm}
                  onChange={(e) =>
                    setPassword((prev) => ({ ...prev, confirm: e.target.value }))
                  }
                  placeholder="••••••••"
                  required
                  readOnly={isPasswordConfigDriven}
                />
              </div>

              <p className="flex items-start gap-2 text-xs text-gray-400">
                <UserRound className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                At least 8 characters, including an uppercase letter, a lowercase letter, a number
                and a symbol.
              </p>

              <div className="flex justify-end border-t border-gray-100 pt-6">
                <button
                  type="button"
                  className="btn_primary_black"
                  onClick={handleChangePassword}
                  disabled={
                    isPasswordConfigDriven ||
                    isChangingPassword ||
                    !password.current ||
                    !password.next ||
                    !password.confirm
                  }
                >
                  {isChangingPassword ? <Loader2 className="animate-spin" /> : <KeyRound />}
                  {isChangingPassword ? "Changing..." : "Change Password"}
                </button>
              </div>
            </div>
          </DataCard>
        </section>
      </div>
    </PageShell>
  );
}
