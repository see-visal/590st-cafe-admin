"use client";

import Image from "next/image";
import { ReactNode, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { type DateRange } from "react-day-picker";
import {
  Bell,
  CalendarDays,
  Check,
  CheckCheck,
  Clock,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Eye,
  Filter,
  Loader2,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  TriangleAlert,
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
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useI18n } from "@/contexts/I18nContext";
import { cn } from "@/lib/utils";
import { apiErrorMessage } from "@/store/api/baseApi";

import { OperationalAlertsContent, useOperationalAlerts } from "./OperationalAlerts";

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
  const alerts = useOperationalAlerts();
  const [open, setOpen] = useState(false);
  const { locale, setLocale } = useI18n();
  const currentLang =
    LANGUAGES.find((lang) => lang.code === locale) ?? LANGUAGES[0];

  return (
    <>
      <div className="header_top_actions">
        <button
          type="button"
          onClick={() => {
            alerts.markSeen();
            setOpen(true);
          }}
          className="header_action_btn header_notify_btn"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {alerts.unseen !== undefined && alerts.unseen > 0 && <span className="header_notify_badge">{alerts.unseen}</span>}
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
              <SheetTitle className="notify_header_title">Current alerts</SheetTitle>
              <p className="notify_header_sub">{alerts.count === undefined ? "Checking current activity" : `${alerts.count} items need attention`}</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="notify_icon_btn" aria-label="Close notifications">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="notify_body"><OperationalAlertsContent alerts={alerts} /></div>
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
  type = "text",
}: {
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** "date"/"number" for filters that select a period rather than free text. */
  type?: string;
}) {
  return (
    <label className="form_field">
      <span className="form_field_label">{label}</span>
      <input
        type={type}
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

export function FormDateField({
  label,
  placeholder = "Select date",
  value,
  onChange,
  required = false,
}: {
  label: string;
  placeholder?: string;
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [internalDate, setInternalDate] = useState<Date | undefined>();
  const date = value ?? internalDate;

  const handleSelect = (next: Date | undefined) => {
    if (onChange) {
      onChange(next);
    } else {
      setInternalDate(next);
    }
    if (next) {
      setOpen(false);
    }
  };

  const displayValue = date
    ? format(date, "dd MMM yyyy")
    : placeholder;

  return (
    <div className="form_field">
      <span className="form_field_label">
        {label}
        {required && <span className="form_field_required"> *</span>}
      </span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "form_field_control form_field_date text-left",
              !date && "is_placeholder"
            )}
            aria-label={label}
          >
            <span className="truncate">{displayValue}</span>
            <CalendarDays className="form_field_icon" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            defaultMonth={date}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function FilterActions({ onClear, onSearch }: { onClear: () => void; onSearch: () => void }) {
  return (
    <div className="flex items-end justify-end gap-3 xl:col-span-4">
      <button type="button" onClick={onClear} className="btn_outline_black">
        Clear
      </button>
      <button type="button" onClick={onSearch} className="btn_primary_black">
        Search
        <Search />
      </button>
    </div>
  );
}

export function TableActions({
  onRegister,
  onExport,
  primaryLabel = "Register",
  showRegister = true,
}: {
  onRegister?: () => void;
  onExport?: () => void;
  primaryLabel?: string;
  showRegister?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {onExport && <button type="button" onClick={onExport} className="btn_outline_black">
        Download Excel
        <Download />
      </button>}
      {showRegister && onRegister && (
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

export function Thumbnail({ src = "/profile/placeholder.svg" }: { src?: string }) {
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
  avatarUrl,
}: {
  name: string;
  email: string;
  avatarUrl?: string | null;
}) {
  return (
    <div className="staff_identity">
      <span className="staff_identity_avatar relative overflow-hidden" aria-hidden>
        {avatarUrl ? <Image src={avatarUrl} alt="" fill sizes="40px" className="object-cover" /> : name.charAt(0).toUpperCase()}
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
  onHistory,
  isLoading = false,
}: {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onHistory?: () => void;
  isLoading?: boolean;
}) {
  const actions = [
    [Eye, onView, "View"],
    [Pencil, onEdit, "Edit"],
    [onHistory ? Clock : Trash2, onHistory ?? onDelete, onHistory ? "Disable" : "Delete"],
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

const PAGE_SIZE_CHOICES = [5, 10, 20, 50];

/** Windows the page buttons around the current page so long result sets stay one row. */
function pageWindow(current: number, total: number, span = 3): number[] {
  const start = Math.max(1, Math.min(current - Math.floor(span / 2), total - span + 1));
  const count = Math.min(span, total);
  return Array.from({ length: Math.max(count, 0) }, (_, i) => start + i);
}

/**
 * Pagination bound to a `PageResponse`. Page numbers are 1-based to match the API.
 * Called with no props it renders a disabled single-page bar, which is what the screens
 * that have no server-side list yet still use.
 */
export function PaginationFooter({
  page = 1,
  totalPages = 1,
  size = 10,
  totalElements,
  onPageChange,
  onSizeChange,
}: {
  page?: number;
  totalPages?: number;
  size?: number;
  totalElements?: number;
  onPageChange?: (page: number) => void;
  onSizeChange?: (size: number) => void;
} = {}) {
  const pages = pageWindow(page, Math.max(totalPages, 1));
  const canPrev = page > 1;
  const canNext = page < totalPages;
  const [sizeOpen, setSizeOpen] = useState(false);

  return (
    <div className="table_pagination">
      <div className="pagination_per_page">
        Show Per Page:
        <span className="relative inline-block">
          <button
            type="button"
            className="pagination_btn"
            onClick={() => setSizeOpen((open) => !open)}
            disabled={!onSizeChange}
          >
            {size}
            <ChevronDown />
          </button>
          {sizeOpen && onSizeChange ? (
            <span className="absolute bottom-full left-0 z-10 mb-1 flex flex-col rounded-md border border-border bg-background shadow-lg">
              {PAGE_SIZE_CHOICES.map((choice) => (
                <button
                  key={choice}
                  type="button"
                  className={cn(
                    "px-4 py-1.5 text-left text-sm hover:bg-muted",
                    choice === size && "font-semibold"
                  )}
                  onClick={() => {
                    onSizeChange(choice);
                    setSizeOpen(false);
                  }}
                >
                  {choice}
                </button>
              ))}
            </span>
          ) : null}
        </span>
        {typeof totalElements === "number" ? (
          <span className="ml-3 text-muted-foreground">{totalElements} total</span>
        ) : null}
      </div>
      <div className="pagination_controls">
        <button
          type="button"
          className="pagination_btn is_icon"
          aria-label="First page"
          disabled={!canPrev}
          onClick={() => onPageChange?.(1)}
        >
          <ChevronsLeft />
        </button>
        <button
          type="button"
          className="pagination_btn"
          disabled={!canPrev}
          onClick={() => onPageChange?.(page - 1)}
        >
          Prev
        </button>
        {pages.map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            className={cn("pagination_btn", pageNumber === page && "is_active")}
            onClick={() => onPageChange?.(pageNumber)}
          >
            {pageNumber}
          </button>
        ))}
        {pages[pages.length - 1] < totalPages ? (
          <span className="pagination_ellipsis">...</span>
        ) : null}
        <button
          type="button"
          className="pagination_btn"
          disabled={!canNext}
          onClick={() => onPageChange?.(page + 1)}
        >
          Next
        </button>
        <button
          type="button"
          className="pagination_btn is_icon"
          aria-label="Last page"
          disabled={!canNext}
          onClick={() => onPageChange?.(totalPages)}
        >
          <ChevronsRight />
        </button>
      </div>
    </div>
  );
}

/**
 * The single row a table shows instead of data while loading, after a failure, or when the
 * server returned nothing. Keeps every screen's empty/error handling identical.
 */
export function TableState({
  colSpan,
  isLoading,
  error,
  isEmpty,
  emptyLabel = "No records found.",
  onRetry,
}: {
  colSpan: number;
  isLoading?: boolean;
  error?: unknown;
  isEmpty?: boolean;
  emptyLabel?: string;
  onRetry?: () => void;
}) {
  if (!isLoading && !error && !isEmpty) return null;

  return (
    <tr>
      <td colSpan={colSpan} className="py-10 text-center text-sm text-muted-foreground">
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading...
          </span>
        ) : error ? (
          <span className="inline-flex flex-col items-center gap-2">
            <span className="text-destructive">{apiErrorMessage(error as never)}</span>
            {onRetry ? (
              <button type="button" className="pagination_btn" onClick={onRetry}>
                Retry
              </button>
            ) : null}
          </span>
        ) : (
          emptyLabel
        )}
      </td>
    </tr>
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

export function AdminStatusAlert({
  open,
  onOpenChange,
  variant = "success",
  title,
  headline,
  description,
  confirmLabel = "Okay",
  cancelLabel = "Cancel",
  onConfirm,
  isLoading = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant?: "success" | "confirm";
  title: string;
  headline?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => Promise<void> | void;
  isLoading?: boolean;
}) {
  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="admin_status_alert sm:max-w-[440px]">
        <div className="admin_status_alert_body">
          <div
            className={cn(
              "admin_status_alert_icon",
              variant === "success" ? "is_success" : "is_confirm"
            )}
          >
            {variant === "success" ? (
              <Check className="admin_status_alert_icon_glyph" />
            ) : (
              <TriangleAlert className="admin_status_alert_icon_glyph" />
            )}
          </div>
          <p
            className={cn(
              "admin_status_alert_title",
              variant === "success" && "is_success"
            )}
          >
            {title}
          </p>
          {headline && <p className="admin_status_alert_headline">{headline}</p>}
          {description && (
            <p className="admin_status_alert_desc">{description}</p>
          )}
        </div>
        <DialogFooter className="admin_status_alert_footer">
          {variant === "confirm" ? (
            <>
              <button
                type="button"
                className="btn_outline_black"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                className="btn_primary_black admin_status_alert_confirm_btn"
                onClick={handleConfirm}
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : confirmLabel}
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn_primary_yellow_lg admin_status_alert_okay_btn"
              onClick={() => onOpenChange(false)}
            >
              {confirmLabel}
            </button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
    <div className="detail_item">
      <p className="detail_item_label">{label} :</p>
      <div className="detail_item_value">{children}</div>
    </div>
  );
}

export function DetailImage({
  src,
  alt = "",
}: {
  src?: string;
  alt?: string;
}) {
  return (
    <div className={cn("detail_image", !src && "is_empty")}>
      {src ? (
        <Image src={src} alt={alt} fill sizes="220px" className="object-cover" />
      ) : null}
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
  readOnly = false,
  disabled = false,
  maxLength,
  min,
  max,
}: {
  label: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  active?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  maxLength?: number;
  min?: string | number;
  max?: string | number;
}) {
  return (
    <label className="form_field">
      <span className={cn("form_field_label", active && "text-green-600")}>
        {label}
        {required && <span className="form_field_required"> *</span>}
      </span>
      <input
        type={type}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        readOnly={readOnly}
        disabled={disabled}
        maxLength={maxLength}
        min={min}
        max={max}
        className={cn(
          "form_field_control",
          active && "is_active",
          readOnly && "is_readonly",
          disabled && "is_disabled"
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
  placeholder = "Select Method",
  disabled = false,
}: {
  label: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children?: React.ReactNode;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <label className="form_field">
      <span className="form_field_label">
        {label}
        {required && <span className="form_field_required"> *</span>}
      </span>
      <span className="form_field_control_wrap">
        <select
          value={value ?? ""}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={cn("form_field_control form_field_select", disabled && "is_disabled")}
        >
          <option value="">{placeholder}</option>
          {children}
        </select>
        <ChevronDown className="form_field_icon" />
      </span>
    </label>
  );
}

export type ProductSelectOption = {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  unit: string;
};

export function FormProductSelect({
  label,
  required = false,
  options,
  value,
  onChange,
  searchPlaceholder = "Search by product name or SKU...",
}: {
  label: string;
  required?: boolean;
  options: ProductSelectOption[];
  value?: ProductSelectOption | null;
  onChange?: (product: ProductSelectOption | null) => void;
  searchPlaceholder?: string;
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return options;
    return options.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query)
    );
  }, [options, search]);

  const handleSelect = (product: ProductSelectOption) => {
    onChange?.(product);
    setSearch("");
    setOpen(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSearch("");
    }
  };

  const inputValue = open ? search : value?.name ?? "";

  return (
    <div className="form_field form_field_product_select">
      <span className="form_field_label">
        {label}
        {required && <span className="form_field_required"> *</span>}
      </span>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverAnchor asChild>
          <div className="form_field_control_wrap">
            <Search className="form_field_search_icon" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => {
                setSearch(e.target.value);
                if (!open) setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              placeholder={searchPlaceholder}
              className={cn(
                "form_field_control form_field_search_input",
                !open && !value && "is_placeholder"
              )}
            />
          </div>
        </PopoverAnchor>
        <PopoverContent
          align="start"
          sideOffset={6}
          className="form_product_select_popover w-[var(--radix-popover-trigger-width)] p-0"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {filtered.length > 0 ? (
            <ul className="form_product_select_list" role="listbox">
              {filtered.map((product) => {
                const isSelected = value?.id === product.id;
                return (
                  <li key={product.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={cn(
                        "form_product_select_item",
                        isSelected && "is_selected"
                      )}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelect(product)}
                    >
                      <div className="form_product_select_item_main">
                        <span className="form_product_select_name">{product.name}</span>
                        <span className="form_product_select_meta">
                          SKU: {product.sku} · {product.currentStock} {product.unit}
                        </span>
                      </div>
                      {isSelected && (
                        <span className="form_product_select_badge">Selected</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="form_product_select_empty">No products found</div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function FormCategoryMultiSelect({
  label,
  options,
  value,
  onChange,
  placeholder = "Select categories",
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string[];
  onChange?: (values: string[]) => void;
  placeholder?: string;
}) {
  const available = options.filter((option) => !value.includes(option.value));

  const addCategory = (nextValue: string) => {
    if (!nextValue || value.includes(nextValue)) return;
    onChange?.([...value, nextValue]);
  };

  const removeCategory = (nextValue: string) => {
    onChange?.(value.filter((item) => item !== nextValue));
  };

  return (
    <div className="form_field">
      <span className="form_field_label">{label}</span>
      <div className="form_field_control form_field_multi_select">
        <div className="form_multi_select_inner">
          <div className="form_multi_select_tags">
            {value.length === 0 ? (
              <span className="form_multi_select_placeholder">{placeholder}</span>
            ) : (
              value.map((item) => {
                const option = options.find((entry) => entry.value === item);
                return (
                  <span key={item} className="form_multi_select_tag">
                    {option?.label ?? item}
                    <button
                      type="button"
                      className="form_multi_select_tag_remove"
                      onClick={() => removeCategory(item)}
                      aria-label={`Remove ${option?.label ?? item}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                );
              })
            )}
          </div>
          {available.length > 0 && (
            <select
              className="form_multi_select_add"
              value=""
              onChange={(e) => addCategory(e.target.value)}
              aria-label={`Add ${label}`}
            >
              <option value="">
                {value.length === 0 ? placeholder : "Add category"}
              </option>
              {available.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </div>
        <ChevronDown className="form_field_icon" />
      </div>
    </div>
  );
}

export function FormTextarea({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  rows = 4,
}: {
  label: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  rows?: number;
}) {
  return (
    <label className="form_field">
      <span className="form_field_label">
        {label}
        {required && <span className="form_field_required"> *</span>}
      </span>
      <textarea
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className="form_field_control form_field_textarea"
      />
    </label>
  );
}

export function FormImageUpload({
  label,
  file,
  onChange,
  accept = "image/*",
  emptyLabel = "No File Chosen",
  disabled = false,
}: {
  label: string;
  file?: File | null;
  onChange?: (file: File | null) => void;
  accept?: string;
  emptyLabel?: string;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const displayName = file?.name || emptyLabel;

  return (
    <div className="form_field form_field_image_upload">
      <span className="form_field_label">{label}</span>
      <div className="form_field_upload_row">
        <input
          type="text"
          readOnly
          value={displayName}
          tabIndex={-1}
          className={cn(
            "form_field_control form_field_upload_display",
            !file && "is_placeholder"
          )}
        />
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          disabled={disabled}
          className="sr-only"
          onChange={(e) => {
            const selectedFile = e.target.files?.[0] ?? null;
            e.target.value = "";
            onChange?.(selectedFile);
          }}
        />
        <button
          type="button"
          disabled={disabled}
          className="btn_outline_black form_field_upload_btn"
          onClick={() => inputRef.current?.click()}
        >
          Upload Image
        </button>
      </div>
    </div>
  );
}

export function LogoMark() {
  return (
    <Image
      src="/logos/logo.svg"
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
