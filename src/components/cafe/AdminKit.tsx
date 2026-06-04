"use client";

import Image from "next/image";
import { ReactNode, useState } from "react";
import {
  Bell,
  CalendarDays,
  CheckCheck,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Eye,
  Filter,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type FieldOption = {
  label: string;
  value: string;
};

export function AdminTopActions() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="relative flex h-10 w-10 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-900 shadow-sm transition hover:bg-gray-50"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute -right-2 -top-2 rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-semibold text-white">
            10
          </span>
        </button>
        <button
          type="button"
          className="flex h-10 items-center gap-2 rounded-md border border-gray-300 bg-white px-3 text-sm font-semibold text-gray-900 shadow-sm"
          aria-label="Language"
        >
          <span className="grid h-5 w-5 place-items-center rounded-full bg-[#1f4fbf] text-[10px] text-white">
            KH
          </span>
          <span>Kh</span>
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[88vh] max-w-2xl gap-0 overflow-hidden rounded-lg p-0">
          <div className="flex items-start justify-between border-b border-gray-200 px-6 py-5">
            <div>
              <DialogTitle className="text-2xl font-semibold">
                Notifications
              </DialogTitle>
              <p className="mt-2 text-sm text-gray-500">
                10 unread notifications
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <button
                type="button"
                className="inline-flex items-center gap-2 font-medium text-indigo-600"
              >
                Make all read
                <CheckCheck className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-gray-600 hover:bg-gray-100"
                aria-label="Close notifications"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-4 border-b border-gray-200 px-6 text-sm">
            {[
              ["View all", "12"],
              ["Unread", "10"],
              ["Orders", "10"],
              ["Payments", "2"],
            ].map(([label, count], index) => (
              <button
                key={label}
                type="button"
                className={cn(
                  "flex items-center justify-center gap-2 py-4 text-gray-600",
                  index === 0 && "border-b-2 border-black text-black"
                )}
              >
                {label}
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 text-xs font-semibold",
                    index === 0 ? "bg-lime-300 text-black" : "bg-gray-200"
                  )}
                >
                  {count}
                </span>
              </button>
            ))}
          </div>
          <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
            <p className="mb-3 text-sm font-semibold text-gray-500">Today</p>
            {[
              ["Preparing", "Unpaid", "text-yellow-600", "bg-red-100 text-red-600"],
              ["Preparing", "Unpaid", "text-yellow-600", "bg-red-100 text-red-600"],
              ["Ready", "Paid", "text-blue-600", "bg-green-100 text-green-700"],
              ["Served", "Paid", "text-green-600", "bg-green-100 text-green-700"],
            ].map(([status, paid, statusClass, paidClass], index) => (
              <div
                key={`${status}-${index}`}
                className={cn(
                  "flex items-start gap-4 border-b border-gray-100 px-2 py-4",
                  index === 1 && "bg-gray-100"
                )}
              >
                <span className="grid h-11 w-11 place-items-center rounded-full bg-black text-white">
                  <Download className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-950">
                    Order #2F494A4S -{" "}
                    <span className={statusClass}>{status}</span>
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Order has been served to the customer
                  </p>
                  <p className="mt-1 text-xs text-gray-600">13d ago</p>
                </div>
                <div className="flex flex-col items-end gap-4">
                  <span className={cn("rounded px-2 py-1 text-xs", paidClass)}>
                    {paid}
                  </span>
                  {index > 0 && (
                    <button type="button" className="text-xs font-medium text-indigo-600">
                      Make as read
                    </button>
                  )}
                </div>
              </div>
            ))}
            <p className="mb-3 mt-4 text-sm font-semibold text-gray-500">
              Yesterday
            </p>
            {[1, 2].map((item) => (
              <div
                key={item}
                className="flex items-start gap-4 border-b border-gray-100 px-2 py-4"
              >
                <span className="grid h-11 w-11 place-items-center rounded-full bg-black text-white">
                  <Download className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-950">
                    Order #2F494A4S -{" "}
                    <span className="text-green-600">Served</span>
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Order has been served to the customer
                  </p>
                  <p className="mt-1 text-xs text-gray-600">13d ago</p>
                </div>
                <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-700">
                  Paid
                </span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function FilterPanel({
  children,
  collapsible = false,
}: {
  children?: ReactNode;
  collapsible?: boolean;
}) {
  return (
    <section className="overflow-hidden rounded-lg bg-white shadow-sm">
      <div className="flex items-center gap-4 border-b border-gray-100 px-5 py-4">
        <span className="grid h-10 w-10 place-items-center rounded-md bg-[#befe35] text-black">
          <SlidersHorizontal className="h-5 w-5" />
        </span>
        <h2 className="text-xl font-semibold text-gray-800">Filters</h2>
      </div>
      {children && (
        <div
          className={cn(
            "grid grid-cols-1 gap-4 px-5 py-4 md:grid-cols-2 xl:grid-cols-4",
            collapsible && "border-t border-gray-100"
          )}
        >
          {children}
        </div>
      )}
    </section>
  );
}

export function TextField({
  label,
  placeholder = "Placeholder",
  value,
  onChange,
}: {
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="block text-sm font-medium text-gray-700">
      {label}
      <input
        value={value || ""}
        onChange={onChange}
        className="mt-2 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#7ec900] focus:ring-2 focus:ring-lime-100"
        placeholder={placeholder}
      />
    </label>
  );
}

export function SelectField({
  label,
  placeholder = "Select Method",
  value,
  onChange,
  children,
}: {
  label: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children?: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-medium text-gray-700">
      {label}
      <span className="relative mt-2 block">
        <select
          value={value || ""}
          onChange={onChange}
          className="h-10 w-full appearance-none rounded-md border border-gray-300 bg-white px-3 pr-10 text-sm text-gray-500 outline-none transition focus:border-[#7ec900] focus:ring-2 focus:ring-lime-100"
        >
          <option value="">{placeholder}</option>
          {children || (
            <>
              <option>Paid</option>
              <option>Pending</option>
              <option>Enabled</option>
            </>
          )}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black" />
      </span>
    </label>
  );
}

export function DateField({ label, value = "Start Date - End Date" }: {
  label: string;
  value?: string;
}) {
  return (
    <label className="block text-sm font-medium text-gray-700">
      {label}
      <span className="relative mt-2 block">
        <input
          readOnly
          value={value}
          className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 pr-10 text-sm text-gray-900 outline-none"
        />
        <CalendarDays className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black" />
      </span>
    </label>
  );
}

export function FilterActions() {
  return (
    <div className="flex items-end justify-end gap-3 xl:col-span-4">
      <button className="h-10 rounded-md border border-black bg-white px-5 text-sm font-semibold">
        Clear
      </button>
      <button className="inline-flex h-10 items-center gap-2 rounded-md bg-black px-5 text-sm font-semibold text-white">
        Search
        <Search className="h-4 w-4 text-[#befe35]" />
      </button>
    </div>
  );
}

export function TableActions({
  onRegister,
  primaryLabel = "Register",
}: {
  onRegister?: () => void;
  primaryLabel?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button className="inline-flex h-10 items-center gap-2 rounded-md border border-black bg-white px-4 text-sm font-semibold">
        Download Excel
        <Download className="h-4 w-4" />
      </button>
      <button
        onClick={onRegister}
        className="inline-flex h-10 items-center gap-2 rounded-md bg-black px-4 text-sm font-semibold text-white"
      >
        {primaryLabel}
        <Plus className="h-5 w-5 text-[#befe35]" />
      </button>
    </div>
  );
}

export function DataCard({
  title,
  meta,
  actions,
  children,
}: {
  title: string;
  meta?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          {meta && <p className="mt-4 text-xs text-gray-700">{meta}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function SimpleTable({
  headers,
  children,
}: {
  headers: string[];
  children: ReactNode;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] border-collapse text-sm">
        <thead>
          <tr className="border border-gray-200 bg-[#f5f4f1] text-left text-gray-700">
            {headers.map((header) => (
              <th key={header} className="px-4 py-3 font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Row({ children, striped = false }: { children: ReactNode; striped?: boolean }) {
  return (
    <tr className={cn("border-b border-gray-100", striped && "bg-gray-100")}>
      {children}
    </tr>
  );
}

export function Cell({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={cn("px-4 py-3 align-middle text-gray-800", className)}>{children}</td>;
}

export function CheckBox({ checked = false }: { checked?: boolean }) {
  return (
    <span
      className={cn(
        "grid h-4 w-4 place-items-center rounded border border-gray-700",
        checked && "bg-black text-[#befe35]"
      )}
    >
      {checked && <CheckCheck className="h-3 w-3" />}
    </span>
  );
}

export function Thumbnail({ src = "/profile/placeholder.jpg" }: { src?: string }) {
  return (
    <span className="relative block h-6 w-8 overflow-hidden rounded bg-gray-200">
      <Image src={src} alt="" fill sizes="32px" className="object-cover" />
    </span>
  );
}

export function StatusBadge({
  label,
  tone = "success",
  variant,
}: {
  label: string;
  tone?: "success" | "danger" | "warning" | "info" | "neutral";
  variant?: "success" | "destructive" | "warning" | "info" | "default" | "secondary";
}) {
  const resolvedTone =
    variant === "success"
      ? "success"
      : variant === "destructive"
      ? "danger"
      : variant === "warning"
      ? "warning"
      : variant === "info"
      ? "info"
      : variant === "secondary" || variant === "default"
      ? "neutral"
      : tone;
  const styles = {
    success: "bg-green-100 text-green-800",
    danger: "bg-red-100 text-red-700",
    warning: "bg-yellow-100 text-yellow-700",
    info: "bg-blue-100 text-blue-700",
    neutral: "bg-gray-100 text-gray-700",
  };

  return (
    <span
      className={cn(
        "rounded-full px-3 py-1 text-xs font-semibold",
        styles[resolvedTone]
      )}
    >
      {label}
    </span>
  );
}

export function RowActions({
  onView,
  onEdit,
  onDelete,
  isLoading = false,
}: {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isLoading?: boolean;
}) {
  const actions = [
    [Eye, onView, "View"],
    [Pencil, onEdit, "Edit"],
    [Trash2, onDelete, "Delete"],
  ] as const;

  return (
    <div className="flex items-center gap-2">
      {actions
        .filter(([, onClick]) => Boolean(onClick))
        .map(([Icon, onClick, label]) => (
          <button
            key={label}
            type="button"
            onClick={onClick}
            disabled={isLoading}
            className="grid h-7 w-7 place-items-center rounded-full bg-black text-[#befe35] transition hover:bg-gray-800 disabled:opacity-50"
            aria-label={label}
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
    </div>
  );
}

export function PaginationFooter() {
  return (
    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-xs text-gray-800">
        Show Per Page:
        <button className="inline-flex h-8 items-center gap-2 rounded-md border border-gray-200 px-3">
          5
          <ChevronDown className="h-3 w-3" />
        </button>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <button className="grid h-8 w-8 place-items-center rounded-md bg-black text-white">
          <ChevronsLeft className="h-4 w-4" />
        </button>
        <button className="h-8 rounded-md border border-gray-200 px-3">Prev</button>
        {[1, 2, 3].map((page) => (
          <button key={page} className="h-8 w-8 rounded-md border border-gray-200">
            {page}
          </button>
        ))}
        <span className="px-2 text-gray-400">...</span>
        <button className="h-8 rounded-md border border-gray-200 px-3">Next</button>
        <button className="grid h-8 w-8 place-items-center rounded-md bg-black text-white">
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function StatTile({
  title,
  value,
  hint,
  tone = "gray",
}: {
  title: string;
  value: string;
  hint?: string;
  tone?: "green" | "yellow" | "orange" | "red" | "gray";
}) {
  const color = {
    green: "text-green-600",
    yellow: "text-yellow-600",
    orange: "text-orange-500",
    red: "text-red-500",
    gray: "text-gray-800",
  }[tone];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      <p className={cn("mt-2 text-3xl font-bold", color)}>{value}</p>
      {hint && <p className="mt-2 text-sm text-gray-400">{hint}</p>}
    </div>
  );
}

export function FormModal({
  open,
  onOpenChange,
  title,
  children,
  submitLabel = "Submit",
  onSubmit,
  isLoading = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  submitLabel?: string;
  onSubmit?: () => Promise<void> | void;
  isLoading?: boolean;
}) {
  const handleSubmit = async () => {
    if (onSubmit) {
      await onSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl gap-0 rounded-lg p-0">
        <DialogHeader className="border-b border-gray-200 px-6 py-5">
          <DialogTitle className="text-lg">{title}</DialogTitle>
        </DialogHeader>
        <div className="bg-gray-50 p-5">{children}</div>
        <DialogFooter className="border-t border-gray-200 px-6 py-4">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="h-10 rounded-md border border-black bg-white px-5 text-sm font-semibold disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="h-10 rounded-md bg-[#befe35] px-5 text-sm font-semibold text-black disabled:opacity-50"
          >
            {isLoading ? "Processing..." : submitLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DetailModal({
  open,
  onOpenChange,
  title,
  children,
  onEdit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  onEdit?: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl gap-0 rounded-lg p-0">
        <DialogHeader className="border-b border-gray-200 px-6 py-5">
          <DialogTitle className="text-lg">{title}</DialogTitle>
        </DialogHeader>
        <div className="bg-gray-50 p-5">{children}</div>
        <DialogFooter className="border-t border-gray-200 px-6 py-4">
          <button
            type="button"
            onClick={onEdit}
            className="h-10 rounded-md bg-[#befe35] px-5 text-sm font-semibold text-black"
          >
            Edit
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ModalGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 rounded-lg bg-white p-4 md:grid-cols-3">{children}</div>;
}

export function DetailGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-8 rounded-lg bg-white p-4 md:grid-cols-3">{children}</div>;
}

export function DetailItem({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label} :</p>
      <div className="mt-2 text-sm font-medium text-gray-950">{children}</div>
    </div>
  );
}

export function FormInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  active = false,
}: {
  label: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  active?: boolean;
}) {
  return (
    <label className={cn("block text-sm font-medium", active ? "text-green-600" : "text-gray-700")}>
      {label}
      {required && <span className="text-red-500"> *</span>}
      <input
        type={type}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={cn(
          "mt-2 h-10 w-full rounded-md border bg-white px-3 text-sm outline-none",
          active ? "border-green-500" : "border-gray-300"
        )}
      />
    </label>
  );
}

export function FormSelect({
  label,
  value,
  onChange,
  children,
  required = false,
}: {
  label: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children?: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500"> *</span>}
      <span className="relative mt-2 block">
        <select
          value={value || ""}
          onChange={onChange}
          required={required}
          className="h-10 w-full appearance-none rounded-md border border-gray-300 bg-white px-3 pr-10 text-sm text-gray-900 outline-none"
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" />
      </span>
    </label>
  );
}

export function LogoMark() {
  return (
    <Image
      src="/Logo/Logo.svg"
      alt="590st CAFE"
      width={82}
      height={40}
      className="h-10 w-auto"
      priority
    />
  );
}

export function FilterIconLabel() {
  return (
    <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-600">
      <Filter className="h-4 w-4" />
      Filter
    </span>
  );
}
