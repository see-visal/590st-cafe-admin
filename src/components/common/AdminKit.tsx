"use client";

import Image from "next/image";
import { ReactNode, useState } from "react";
import { format } from "date-fns";
import { type DateRange } from "react-day-picker";
import {
  Bell,
  CalendarDays,
  Check,
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
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useI18n } from "@/contexts/I18nContext";
import { cn } from "@/lib/utils";

export type FieldOption = {
  label: string;
  value: string;
};

const LANGUAGES = [
  {
    code: "kh",
    shortLabel: "KH",
    label: "ខ្មែរ",
    flag: "/images/cambodia.svg",
    flagAlt: "Cambodia",
  },
  {
    code: "en",
    shortLabel: "ENG",
    label: "English",
    flag: "/images/english.svg",
    flagAlt: "English",
  },
] as const;

function LanguageFlag({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative inline-block h-5 w-5 overflow-hidden rounded-full border border-black/10",
        className
      )}
    >
      <Image src={src} alt={alt} fill sizes="20px" className="object-cover" />
    </span>
  );
}

export function AdminTopActions() {
  const [open, setOpen] = useState(false);
  const { locale, setLocale } = useI18n();
  const currentLang =
    LANGUAGES.find((lang) => lang.code === locale) ?? LANGUAGES[0];

  return (
    <>
      <div className="header_top_actions">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="header_action_btn header_notify_btn"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="header_notify_badge">10</span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="header_action_btn header_lang_btn"
              aria-label="Language"
            >
              <LanguageFlag src={currentLang.flag} alt={currentLang.flagAlt} />
              <span>{currentLang.label}</span>
              <ChevronDown className="h-4 w-4 shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="header_lang_menu min-w-[10rem] rounded-lg border border-black bg-white p-1 shadow-md"
          >
            {LANGUAGES.map((lang) => {
              const isActive = locale === lang.code;
              return (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => setLocale(lang.code)}
                  className={cn(
                    "header_lang_option flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium text-gray-900 focus:bg-gray-100",
                    isActive && "bg-gray-50"
                  )}
                >
                  <LanguageFlag src={lang.flag} alt={lang.flagAlt} />
                  <span className="flex-1">{lang.shortLabel}</span>
                  {isActive && <Check className="h-4 w-4 text-black" />}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="notify_slider_popup" showCloseButton={false}>
          <div className="notify_header">
            <div>
              <SheetTitle className="notify_header_title">Notifications</SheetTitle>
              <p className="notify_header_sub">10 unread notifications</p>
            </div>
            <div className="notify_header_actions">
              <button type="button" className="notify_action_btn">
                Make all read <CheckCheck className="h-4 w-4" />
              </button>
              <button type="button" className="notify_icon_btn" aria-label="Delete notifications">
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="notify_icon_btn"
                aria-label="Close notifications"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="notify_segments">
            {[
              ["View all", "12", true],
              ["Unread", "10", false],
              ["Orders", "10", false],
              ["Payments", "2", false],
            ].map(([label, count, isHighlight], index) => (
              <button
                key={label as string}
                type="button"
                className={cn("notify_segment_btn", index === 0 && "is_active")}
              >
                <span>{label}</span>
                <span className={cn("notify_count_badge", isHighlight && "is_highlight")}>
                  {count}
                </span>
              </button>
            ))}
          </div>

          <div className="notify_body">
            <p className="notify_group_label">Today</p>
            {[
              { status: "Preparing", statusColor: "#eab308", paid: "Unpaid", paidType: "unpaid", read: false },
              { status: "Preparing", statusColor: "#eab308", paid: "Unpaid", paidType: "unpaid", read: false },
              { status: "Ready", statusColor: "#2563eb", paid: "Paid", paidType: "paid", read: false },
              { status: "Served", statusColor: "#16a34a", paid: "Paid", paidType: "paid", read: true },
            ].map((item, index) => (
              <div key={index} className={cn("notify_item", !item.read && "is_unread")}>
                <span className="notify_item_avatar">
                  <Download className="h-5 w-5" />
                </span>
                <div className="notify_item_wrap">
                  <p className="notify_item_title">
                    Order #2F494A4S - <span style={{ color: item.statusColor }}>{item.status}</span>
                  </p>
                  <p className="notify_item_desc">Order has been served to the customer</p>
                  <p className="notify_item_time">13d ago</p>
                </div>
                <div className="notify_item_side">
                  <span className={cn("notify_badge_status", item.paidType === "paid" ? "notify_badge_paid" : "notify_badge_unpaid")}>
                    {item.paid}
                  </span>
                  {!item.read && (
                    <button type="button" className="notify_read_btn">
                      Make as read
                    </button>
                  )}
                </div>
              </div>
            ))}

            <p className="notify_group_label">Yesterday</p>
            {[
              { status: "Served", statusColor: "#16a34a", paid: "Paid", paidType: "paid", read: true },
            ].map((item, index) => (
              <div key={index} className="notify_item">
                <span className="notify_item_avatar">
                  <Download className="h-5 w-5" />
                </span>
                <div className="notify_item_wrap">
                  <p className="notify_item_title">
                    Order #2F494A4S - <span style={{ color: item.statusColor }}>{item.status}</span>
                  </p>
                  <p className="notify_item_desc">Order has been served to the customer</p>
                  <p className="notify_item_time">13d ago</p>
                </div>
                <div className="notify_item_side">
                  <span className="notify_badge_status notify_badge_paid">
                    {item.paid}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

export function FilterPanel({
  children,
  collapsible = true,
  defaultCollapsed = false,
  title = "Filters",
}: {
  children?: ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  title?: string;
}) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <section className={cn("box_collapse", isCollapsed && "is_collapsed")}>
      <div className="filter_header">
        <button
          type="button"
          className="filter_icon_wrapper"
          onClick={() => collapsible && setIsCollapsed(!isCollapsed)}
          aria-label="Toggle filter panel"
        >
          <SlidersHorizontal className="filter_icon" />
        </button>
        <h2 className="filter_title">{title}</h2>
      </div>
      {!isCollapsed && children && (
        <div className={cn("grid grid-cols-1 gap-4 px-5 py-4 md:grid-cols-2 xl:grid-cols-4 filter_content_wrapper", collapsible && "has_top_border")}>
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
    <label className="form_field">
      <span className="form_field_label">{label}</span>
      <input
        value={value || ""}
        onChange={onChange}
        className="form_field_control"
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
    <label className="form_field">
      <span className="form_field_label">{label}</span>
      <span className="form_field_control_wrap">
        <select
          value={value || ""}
          onChange={onChange}
          className="form_field_control form_field_select"
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
        <ChevronDown className="form_field_icon" />
      </span>
    </label>
  );
}

export function DateField({
  label,
  placeholder = "Start Date - End Date",
  value,
  onChange,
}: {
  label: string;
  placeholder?: string;
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
}) {
  const [open, setOpen] = useState(false);
  const [internalRange, setInternalRange] = useState<DateRange | undefined>();
  const range = value ?? internalRange;

  const handleSelect = (next: DateRange | undefined) => {
    if (onChange) {
      onChange(next);
    } else {
      setInternalRange(next);
    }
  };

  const displayValue = range?.from
    ? range.to
      ? `${format(range.from, "dd MMM yyyy")} - ${format(range.to, "dd MMM yyyy")}`
      : format(range.from, "dd MMM yyyy")
    : placeholder;

  return (
    <div className="form_field">
      <span className="form_field_label">{label}</span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "form_field_control form_field_date text-left",
              !range?.from && "is_placeholder"
            )}
            aria-label={label}
          >
            <span className="truncate">{displayValue}</span>
            <CalendarDays className="form_field_icon" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            numberOfMonths={2}
            selected={range}
            onSelect={handleSelect}
            defaultMonth={range?.from}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function FilterActions() {
  return (
    <div className="flex items-end justify-end gap-3 xl:col-span-4">
      <button type="button" className="btn_outline_black">
        Clear
      </button>
      <button type="button" className="btn_primary_black">
        Search
        <Search />
      </button>
    </div>
  );
}

export function TableActions({
  onRegister,
  primaryLabel = "Register",
  showRegister = true,
}: {
  onRegister?: () => void;
  primaryLabel?: string;
  showRegister?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" className="btn_outline_black">
        Download Excel
        <Download />
      </button>
      {showRegister && (
        <button type="button" onClick={onRegister} className="btn_primary_black">
          {primaryLabel}
          <Plus />
        </button>
      )}
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
    <section className="chart_card_wrapper">
      <div className="section_subheader_group">
        <div className="subheader_text">
          <h2 className="subheader_title">{title}</h2>
          {meta && <p className="subheader_meta">{meta}</p>}
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
    <div className="data_table_wrap">
      <table className="data_table">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
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
    <tr className={cn(striped && "is_striped")}>{children}</tr>
  );
}

export function Cell({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={className}>{children}</td>;
}

export function CheckBox({
  checked = false,
  onChange,
}: {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}) {
  const [isChecked, setIsChecked] = useState(checked);

  return (
    <button
      type="button"
      onClick={() => {
        const next = !isChecked;
        setIsChecked(next);
        onChange?.(next);
      }}
      className={cn("custom_checkbox", (checked || isChecked) && "is_checked")}
      role="checkbox"
      aria-checked={checked || isChecked}
    >
      {(checked || isChecked) && <CheckCheck className="checkbox_icon" />}
    </button>
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

export function LockedYnCell({
  locked = false,
}: {
  locked?: boolean;
}) {
  return (
    <div className="locked_yn" role="group" aria-label="Locked YN">
      <span className={cn("locked_yn_opt", !locked && "is_on")}>Enabled</span>
      <span className={cn("locked_yn_opt", locked && "is_off")}>Disabled</span>
    </div>
  );
}

export function StaffIdentityCell({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  return (
    <div className="staff_identity">
      <span className="staff_identity_avatar" aria-hidden>
        {name.charAt(0).toUpperCase()}
      </span>
      <div className="staff_identity_text">
        <p className="staff_identity_name">{name}</p>
        <p className="staff_identity_email">{email}</p>
      </div>
    </div>
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
    <div className="table_pagination">
      <div className="pagination_per_page">
        Show Per Page:
        <button type="button" className="pagination_btn">
          5
          <ChevronDown />
        </button>
      </div>
      <div className="pagination_controls">
        <button type="button" className="pagination_btn is_icon" aria-label="First page">
          <ChevronsLeft />
        </button>
        <button type="button" className="pagination_btn">Prev</button>
        {[1, 2, 3].map((page) => (
          <button
            key={page}
            type="button"
            className={cn("pagination_btn", page === 1 && "is_active")}
          >
            {page}
          </button>
        ))}
        <span className="pagination_ellipsis">...</span>
        <button type="button" className="pagination_btn">Next</button>
        <button type="button" className="pagination_btn is_icon" aria-label="Last page">
          <ChevronsRight />
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
    <div className="metric_card">
      <div className="metric_card_content">
        <p className="metric_title">{title}</p>
        <p className={cn("metric_value", color)}>{value}</p>
        {hint && <p className="metric_hint">{hint}</p>}
      </div>
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
      <DialogContent className="admin_modal sm:max-w-[900px]">
        <DialogHeader className="admin_modal_header">
          <DialogTitle className="admin_modal_title">{title}</DialogTitle>
        </DialogHeader>
        <div className="admin_modal_body">{children}</div>
        <DialogFooter className="admin_modal_footer">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="btn_outline_black"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="btn_primary_yellow"
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
      <DialogContent className="admin_modal sm:max-w-[900px]">
        <DialogHeader className="admin_modal_header">
          <DialogTitle className="admin_modal_title">{title}</DialogTitle>
        </DialogHeader>
        <div className="admin_modal_body">{children}</div>
        {onEdit && (
          <DialogFooter className="admin_modal_footer">
            <button type="button" onClick={onEdit} className="btn_primary_yellow">
              Edit
            </button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function ModalGrid({ children }: { children: ReactNode }) {
  return <div className="admin_modal_form_wrap is_form_grid">{children}</div>;
}

export function DetailGrid({ children }: { children: ReactNode }) {
  return <div className="admin_modal_detail_wrap">{children}</div>;
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
    <label className="form_field">
      <span className={cn("form_field_label", active && "text-green-600")}>
        {label}
        {required && <span className="form_field_required"> *</span>}
      </span>
      <input
        type={type}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={cn("form_field_control", active && "is_active")}
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
    <label className="form_field">
      <span className="form_field_label">
        {label}
        {required && <span className="form_field_required"> *</span>}
      </span>
      <span className="form_field_control_wrap">
        <select
          value={value || ""}
          onChange={onChange}
          required={required}
          className="form_field_control form_field_select"
        >
          {children}
        </select>
        <ChevronDown className="form_field_icon" />
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
