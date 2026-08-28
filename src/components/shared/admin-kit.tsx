"use client";

import Image from "next/image";
import { ReactNode, useId, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { type DateRange } from "react-day-picker";
import {
  Bell,
  CalendarDays,
  Check,
  CheckCheck,
  Clock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useI18n } from "@/providers/i18n-provider";
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

export function AdminTopActions({
  unreadCount = 0,
}: {
  /** Unread notifications. The badge is hidden when this is 0. */
  unreadCount?: number;
} = {}) {
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
          {unreadCount > 0 && (
            <span className="header_notify_badge">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="header_action_btn header_lang_btn"
              aria-label="Language"
            >
              <LanguageFlag src={currentLang.flag} alt={currentLang.flagAlt} />
              <span className="hidden sm:inline">{currentLang.label}</span>
              <ChevronDown className="hidden size-4 shrink-0 sm:block" />
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
      <Input
        value={value || ""}
        onChange={onChange}
        className="form_field_control"
        placeholder={placeholder}
      />
    </label>
  );
}

/**
 * Radix forbids an empty item value, so "no selection" travels as CLEAR_VALUE and is
 * translated back to "" for callers — this is what lets a filter be reset to All.
 */
const CLEAR_VALUE = "__all__";

export function SelectField({
  label,
  placeholder,
  value,
  onValueChange,
  children,
  clearLabel = "All",
}: {
  label: string;
  placeholder?: string;
  value?: string | number;
  onValueChange?: (value: string) => void;
  children?: React.ReactNode;
  /** Text for the reset entry. Pass null to drop it. */
  clearLabel?: string | null;
}) {
  const id = useId();
  return (
    <div className="form_field">
      <Label htmlFor={id} className="form_field_label">
        {label}
      </Label>
      <Select
        value={value ? String(value) : undefined}
        onValueChange={(next) =>
          onValueChange?.(next === CLEAR_VALUE ? "" : next)
        }
      >
        <SelectTrigger
          id={id}
          className={cn("h-9 w-full rounded-lg border-[#CED1D8] bg-white px-4 text-sm text-[#35373D] data-[placeholder]:text-gray-400")}
        >
          <SelectValue placeholder={placeholder ?? `Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent className="max-h-72 border-[#CED1D8] bg-white text-[#35373D] shadow-lg">
          {clearLabel !== null && (
            <SelectItem value={CLEAR_VALUE}>{clearLabel}</SelectItem>
          )}
          {children}
        </SelectContent>
      </Select>
    </div>
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
  // Two months is the norm for range picking, but together they run ~600px —
  // too wide for a phone, so drop to one and let the user page between months.
  const showTwoMonths = useMediaQuery("(min-width: 640px)");
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
        <PopoverContent
          portal={false}
          align="start"
          className="w-auto rounded-lg border-[#CED1D8] bg-white p-0 shadow-[0px_12px_28px_rgba(32,33,36,0.12)]"
        >
          <Calendar
            mode="range"
            numberOfMonths={showTwoMonths ? 2 : 1}
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
        <PopoverContent
          portal={false}
          align="start"
          className="w-auto rounded-lg border-[#CED1D8] bg-white p-0 shadow-[0px_12px_28px_rgba(32,33,36,0.12)]"
        >
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

export function FilterActions({
  onClear,
  onSearch,
  isSearching = false,
}: {
  /** Resets every filter in the panel back to its empty state. */
  onClear?: () => void;
  /** Filtering is live as you type; this re-runs the query against the API. */
  onSearch?: () => void;
  isSearching?: boolean;
}) {
  return (
    <div className="flex items-end justify-end gap-3 xl:col-span-4">
      <button
        type="button"
        onClick={onClear}
        disabled={!onClear}
        className="btn_outline_black"
      >
        Clear
      </button>
      <button
        type="button"
        onClick={onSearch}
        disabled={!onSearch || isSearching}
        className="btn_primary_black"
      >
        {isSearching ? "Searching..." : "Search"}
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
  /** Downloads the current (filtered) rows as CSV. */
  onExport?: () => void;
  primaryLabel?: string;
  showRegister?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={onExport}
        disabled={!onExport}
        className="btn_outline_black"
      >
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
    <Card className="chart_card_wrapper gap-0 border-0 py-0 shadow-[0px_19px_38px_0px_rgba(32,33,36,0.04)]">
      <CardHeader className="section_subheader_group gap-0 border-b-0 px-0 [.border-b]:pb-0">
        <div className="subheader_text">
          <CardTitle className="subheader_title">{title}</CardTitle>
          {meta && <CardDescription className="subheader_meta">{meta}</CardDescription>}
        </div>
        {actions && <CardAction>{actions}</CardAction>}
      </CardHeader>
      <CardContent className="px-0">{children}</CardContent>
    </Card>
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
    <Table className="min-w-[900px] border-collapse">
      <TableHeader>
        <TableRow className="border-b-0 bg-[#F8F7F3] text-left hover:bg-[#F8F7F3]">
          {headers.map((header, index) => (
            <TableHead
              key={header ? `-` : index}
              className={cn(
                "h-auto px-4 py-3 text-[length:var(--text-table)] font-semibold leading-tight text-[#333333]",
                index === 0 && "rounded-tl-lg",
                index === headers.length - 1 && "rounded-tr-lg"
              )}
            >
              {header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>{children}</TableBody>
    </Table>
  );
}

export function Row({ children, striped = false }: { children: ReactNode; striped?: boolean }) {
  return (
    <TableRow className={cn("border-b border-gray-100", striped && "bg-[#F6F6F6]")}>
      {children}
    </TableRow>
  );
}

export function Cell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <TableCell
      className={cn(
        "px-4 py-3 align-middle text-[length:var(--text-table)] leading-[1.4] text-[#333333]",
        className
      )}
    >
      {children}
    </TableCell>
  );
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
    <Checkbox
      checked={checked || isChecked}
      onCheckedChange={(next) => {
        setIsChecked(next === true);
        onChange?.(next === true);
      }}
      className="size-[15px] rounded-[4px] border-[1.5px] border-slate-800 bg-white data-[state=checked]:border-[#befe35] data-[state=checked]:bg-[#befe35] data-[state=checked]:text-black"
    />
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
    <Badge
      variant="secondary"
      className={cn(
        "rounded-full border-transparent px-3 py-1 text-xs font-semibold",
        styles[resolvedTone]
      )}
    >
      {label}
    </Badge>
  );
}

export function LockedYnCell({
  locked = false,
}: {
  locked?: boolean;
}) {
  return (
    <div className="inline-flex items-center gap-2" role="group" aria-label="Locked YN">
      <span
        className={cn(
          "text-xs font-medium leading-tight text-gray-400",
          !locked && "rounded-full bg-green-100 px-2.5 py-1 text-green-700"
        )}
      >
        Enabled
      </span>
      <span
        className={cn(
          "text-xs font-medium leading-tight text-gray-400",
          locked && "rounded-full bg-gray-100 px-2.5 py-1 text-gray-500"
        )}
      >
        Disabled
      </span>
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
    <div className="flex min-w-0 items-center gap-3">
      <span
        className="grid size-7 shrink-0 place-items-center rounded-md bg-black text-xs font-semibold text-[#befe35]"
        aria-hidden
      >
        {name.charAt(0).toUpperCase()}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-[#333333]">{name}</p>
        <p className="mt-0.5 text-xs text-gray-400">{email}</p>
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

/** Page numbers around the current page, with gaps collapsed to an ellipsis. */
function pageWindow(page: number, totalPages: number): (number | "gap")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const out: (number | "gap")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);
  if (start > 2) out.push("gap");
  for (let i = start; i <= end; i++) out.push(i);
  if (end < totalPages - 1) out.push("gap");
  out.push(totalPages);
  return out;
}

export function PaginationFooter({
  page,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 25, 50],
}: {
  page?: number;
  totalPages?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: readonly number[];
}) {
  // Falls back to a single inert page so views that have not adopted
  // usePagination yet still render the same footer.
  const current = page ?? 1;
  const pages = Math.max(1, totalPages ?? 1);
  const canPrev = current > 1;
  const canNext = current < pages;

  return (
    <div className="table_pagination">
      <div className="pagination_per_page">
        Show Per Page:
        <Select
          value={String(pageSize ?? pageSizeOptions[0])}
          onValueChange={(next) => onPageSizeChange?.(Number(next))}
          disabled={!onPageSizeChange}
        >
          <SelectTrigger className="h-8 w-[68px] rounded-lg border-[#CED1D8] bg-white px-2.5 text-xs disabled:opacity-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-[#CED1D8] bg-white text-[#35373D]">
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="pagination_controls">
        <button
          type="button"
          onClick={() => onPageChange?.(1)}
          disabled={!canPrev || !onPageChange}
          className="pagination_btn is_icon hidden sm:inline-flex"
          aria-label="First page"
        >
          <ChevronsLeft />
        </button>
        <button
          type="button"
          onClick={() => onPageChange?.(current - 1)}
          disabled={!canPrev || !onPageChange}
          className="pagination_btn"
        >
          <ChevronLeft className="sm:hidden" />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Numbered pages need room; on a phone the counter replaces them. */}
        <span className="pagination_counter sm:hidden">
          Page {current} of {pages}
        </span>

        <span className="hidden items-center gap-1 sm:flex">
          {pageWindow(current, pages).map((entry, index) =>
            entry === "gap" ? (
              <span key={`gap-${index}`} className="pagination_ellipsis">
                ...
              </span>
            ) : (
              <button
                key={entry}
                type="button"
                onClick={() => onPageChange?.(entry)}
                disabled={!onPageChange}
                aria-current={entry === current ? "page" : undefined}
                className={cn("pagination_btn", entry === current && "is_active")}
              >
                {entry}
              </button>
            )
          )}
        </span>

        <button
          type="button"
          onClick={() => onPageChange?.(current + 1)}
          disabled={!canNext || !onPageChange}
          className="pagination_btn"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="sm:hidden" />
        </button>
        <button
          type="button"
          onClick={() => onPageChange?.(pages)}
          disabled={!canNext || !onPageChange}
          className="pagination_btn is_icon hidden sm:inline-flex"
          aria-label="Last page"
        >
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
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
        <form className="admin_modal_form" onSubmit={handleSubmit} noValidate>
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
              type="submit"
              disabled={isLoading}
              className="btn_primary_yellow"
            >
              {isLoading ? "Processing..." : submitLabel}
            </button>
          </DialogFooter>
        </form>
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
  value,
}: {
  label: string;
  children?: ReactNode;
  value?: ReactNode;
}) {
  return (
    <div className="detail_item">
      <p className="detail_item_label">{label} :</p>
      <div className="detail_item_value">{children ?? value}</div>
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
  error,
}: {
  label: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  active?: boolean;
  readOnly?: boolean;
  error?: string;
}) {
  return (
    <label className="form_field">
      <span className={cn("form_field_label", active && "text-green-600")}>
        {label}
        {required && <span className="form_field_required"> *</span>}
      </span>
      <Input
        type={type}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        readOnly={readOnly}
        className={cn(
          "form_field_control",
          active && "is_active",
          readOnly && "is_readonly",
          error && "is_error"
        )}
        aria-invalid={Boolean(error)}
      />
      {error && <span className="form_field_error">{error}</span>}
    </label>
  );
}

export function FormSelect({
  label,
  value,
  onValueChange,
  children,
  required = false,
  placeholder,
  error,
}: {
  label: string;
  value?: string | number;
  onValueChange?: (value: string) => void;
  children?: React.ReactNode;
  required?: boolean;
  placeholder?: string;
  error?: string;
}) {
  const id = useId();
  return (
    <div className="form_field">
      <Label htmlFor={id} className="form_field_label">
        {label}
        {required && <span className="form_field_required"> *</span>}
      </Label>
      <Select
        value={value ? String(value) : undefined}
        onValueChange={(next) =>
          onValueChange?.(next === CLEAR_VALUE ? "" : next)
        }
      >
        <SelectTrigger
          id={id}
          aria-invalid={Boolean(error)}
          className={cn(
            "h-9 w-full rounded-lg border-[#CED1D8] bg-white px-4 text-sm text-[#35373D] data-[placeholder]:text-gray-400",
            error && "border-red-500"
          )}
        >
          <SelectValue
            placeholder={placeholder ?? `Select ${label.toLowerCase()}`}
          />
        </SelectTrigger>
        <SelectContent className="max-h-72 border-[#CED1D8] bg-white text-[#35373D] shadow-lg">
          {!required && <SelectItem value={CLEAR_VALUE}>None</SelectItem>}
          {children}
        </SelectContent>
      </Select>
      {error && <span className="form_field_error">{error}</span>}
    </div>
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
            <Input
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
          portal={false}
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
            /* key remounts the Select so it stays a one-shot "add" picker */
            <Select key={value.length} onValueChange={addCategory}>
              <SelectTrigger
                aria-label={`Add ${label}`}
                className="form_multi_select_add h-auto border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
              >
                <SelectValue
                  placeholder={value.length === 0 ? placeholder : "Add category"}
                />
              </SelectTrigger>
              <SelectContent className="max-h-72 border-[#CED1D8] bg-white text-[#35373D] shadow-lg">
                {available.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
      <Textarea
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
}: {
  label: string;
  file?: File | null;
  onChange?: (file: File | null) => void;
  accept?: string;
  emptyLabel?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const displayName = file?.name || emptyLabel;

  return (
    <div className="form_field form_field_image_upload">
      <span className="form_field_label">{label}</span>
      <div className="form_field_upload_row">
        <Input
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
          className="sr-only"
          onChange={(e) => onChange?.(e.target.files?.[0] ?? null)}
        />
        <button
          type="button"
          className="btn_outline_black form_field_upload_btn"
          onClick={() => inputRef.current?.click()}
        >
          Upload Image
        </button>
      </div>
    </div>
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

// Re-exported so call sites can build <SelectField>/<FormSelect> options.
export { SelectItem };
