"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import toast from "react-hot-toast";
import { Copy, Download, Loader2, Minus, Pencil, Plus, Printer, QrCode, Trash2, Users, X } from "lucide-react";

import { PageShell } from "@/components/common/PageShell";
import { PageHeader } from "@/components/common/PageHeader";
import {
  AdminTopActions,
  DataCard,
  ErrorState,
  FormInput,
  FormModal,
  FormSelect,
  SkeletonBlock,
} from "@/components/common/AdminKit";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { orderCode, useOrderInvoice } from "@/hooks/useOrderInvoice";
import { useRealtimeTopic } from "@/hooks/useRealtimeTopic";
import { useStaffOrderAlerts } from "@/hooks/useStaffOrderAlerts";
import { useCurrentRole } from "@/store/api/useCurrentRole";
import { apiErrorMessage } from "@/store/api/baseApi";
import {
  useCreateTableMutation,
  useGetMenuLinkQuery,
  useDeleteTableMutation,
  useListTableOrdersQuery,
  useListTablesQuery,
  useUpdateTableMutation,
  useUpdateTableStatusMutation,
} from "@/store/api/tableApi";
import type { OrderResponse, OrderStatus, TableResponse, TableSize, TableStatus } from "@/store/api/types";
import { cn, humanise, titleCase } from "@/lib/utils";

const STATUS_LABEL: Record<TableStatus, string> = {
  AVAILABLE: "Available",
  OCCUPIED: "Occupied",
  RESERVED: "Reserved",
};

const SIZE_LABEL: Record<TableSize, string> = {
  SMALL: "Small (2 seats)",
  MEDIUM: "Medium (4 seats)",
  LARGE: "Large (6 seats)",
};

// Dine-in orders move Ordered → Paid → Preparing → Completed.
const ORDER_STEPS: { label: string; reached: (status: OrderStatus) => boolean }[] = [
  { label: "Ordered", reached: () => true },
  { label: "Paid", reached: (s) => s !== "PENDING" },
  { label: "Preparing", reached: (s) => s === "PREPARING" || s === "COMPLETED" || s === "DELIVERED" },
  { label: "Completed", reached: (s) => s === "COMPLETED" || s === "DELIVERED" },
];

const money = (value: number | string | null | undefined) => `$${Number(value ?? 0).toFixed(2)}`;

type TableForm = { tableNumber: string; size: TableSize; capacity: string };
const EMPTY_FORM: TableForm = { tableNumber: "", size: "SMALL", capacity: "" };

export default function TableManagementView() {
  const { isAdmin } = useCurrentRole();
  const { confirm, confirmDialog } = useConfirmDialog();
  const { data, isLoading, isFetching, error, refetch } = useListTablesQuery({ page: 1, size: 500 });
  const tables = useMemo(() => data?.content ?? [], [data]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = tables.find((table) => table.id === selectedId) ?? null;
  const [sheetOpen, setSheetOpen] = useState(false);
  // Matches the .table_layout breakpoint: at this width the details panel sits beside the floor.
  const isWide = useMediaQuery("(min-width: 1024px)");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TableResponse | null>(null);
  const [form, setForm] = useState<TableForm>(EMPTY_FORM);
  const [qrTarget, setQrTarget] = useState<QrTarget | null>(null);
  const { data: menuLink } = useGetMenuLinkQuery();

  const showMenuQr = () => {
    if (!menuLink) return;
    setQrTarget({
      title: "Menu QR",
      heading: "Scan to order",
      caption: "One QR for the whole shop. Customers open the menu and type their table number at checkout.",
      url: menuLink.url,
      fileName: "590st-menu-qr.png",
    });
  };

  const showTableQr = (table: TableResponse) =>
    setQrTarget({
      title: `Table ${table.tableNumber} QR`,
      heading: `Table ${table.tableNumber}`,
      caption: "Scan to see the menu and order — the table number is filled in for you.",
      url: table.scanUrl,
      fileName: `table-${table.tableNumber}-qr.png`,
    });

  const [createTable, { isLoading: isCreating }] = useCreateTableMutation();
  const [updateTable, { isLoading: isUpdating }] = useUpdateTableMutation();
  const [deleteTable] = useDeleteTableMutation();

  useRealtimeTopic("/topic/tables", useCallback(() => { void refetch(); }, [refetch]));

  const counts = useMemo(() => {
    const result: Record<TableStatus, number> = { AVAILABLE: 0, OCCUPIED: 0, RESERVED: 0 };
    for (const table of tables) result[table.status] += 1;
    return result;
  }, [tables]);

  const selectTable = (table: TableResponse) => {
    setSelectedId(table.id);
    setSheetOpen(true);
  };

  const openForm = (table?: TableResponse) => {
    setEditing(table ?? null);
    setForm(table ? { tableNumber: table.tableNumber, size: table.size, capacity: String(table.capacity) } : EMPTY_FORM);
    setFormOpen(true);
  };

  const saveTable = async () => {
    const tableNumber = form.tableNumber.trim();
    if (!/^[A-Za-z0-9-]{1,20}$/.test(tableNumber)) {
      toast.error("Use 1–20 letters, digits or dashes for the table number");
      return;
    }
    const capacity = form.capacity.trim() ? Number(form.capacity) : undefined;
    if (capacity !== undefined && (!Number.isInteger(capacity) || capacity < 1 || capacity > 50)) {
      toast.error("Seats must be a whole number from 1 to 50");
      return;
    }
    try {
      if (editing) {
        await updateTable({ id: editing.id, body: { tableNumber, size: form.size, capacity } }).unwrap();
        toast.success(`Table ${tableNumber} updated`);
      } else {
        const created = await createTable({ tableNumber, size: form.size, capacity }).unwrap();
        setSelectedId(created.id);
        toast.success(`Table ${created.tableNumber} added`);
      }
      setFormOpen(false);
    } catch (err) {
      toast.error(apiErrorMessage(err as never, "Could not save the table."));
    }
  };

  const removeTable = async (table: TableResponse) => {
    const ok = await confirm({
      title: "Delete table",
      description: `Delete table ${table.tableNumber}? Its printed QR code will stop working.`,
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await deleteTable(table.id).unwrap();
      setSelectedId(null);
      setSheetOpen(false);
      toast.success(`Table ${table.tableNumber} deleted`);
    } catch (err) {
      toast.error(apiErrorMessage(err as never, "Could not delete the table."));
    }
  };

  const detail = selected ? (
    <TableDetail
      table={selected}
      isAdmin={isAdmin}
      onShowQr={() => showTableQr(selected)}
      onEdit={() => openForm(selected)}
      onDelete={() => removeTable(selected)}
    />
  ) : (
    <div className="table_detail_empty">
      <QrCode className="h-8 w-8" />
      <p>Tap a table to see who&apos;s seated and what they ordered.</p>
    </div>
  );

  return (
    <PageShell>
      <PageHeader
        title="Tables"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Operations" }, { label: "Tables" }]}
        rightSlot={<AdminTopActions />}
      />

      <div className="table_layout">
        <DataCard
          title="QR Table Management"
          meta="Customers scan the menu QR (or a table QR) and enter their table number at checkout. Tables turn occupied when they order."
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" className="btn_outline_black" onClick={showMenuQr} disabled={!menuLink}>
                <QrCode />
                Menu QR
              </button>
              {isAdmin ? (
                <button type="button" className="btn_primary_black" onClick={() => openForm()}>
                  <Plus />
                  Add table
                </button>
              ) : null}
            </div>
          }
        >
          <div className="table_legend" aria-label="Table status counts">
            {(Object.keys(STATUS_LABEL) as TableStatus[]).map((status) => (
              <span key={status} className="table_legend_item">
                <span className={cn("table_legend_dot", `is_${status.toLowerCase()}`)} />
                {STATUS_LABEL[status]}
                <b>{counts[status]}</b>
              </span>
            ))}
          </div>

          {isLoading ? (
            <div className="table_grid" role="status" aria-label="Loading tables">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonBlock key={i} className="h-24 rounded-2xl" />
              ))}
            </div>
          ) : error ? (
            <div className="p-4">
              <ErrorState error={error} fallback="Could not load tables." onRetry={refetch} isRetrying={isFetching} />
            </div>
          ) : tables.length === 0 ? (
            <div className="table_detail_empty">
              <QrCode className="h-8 w-8" />
              <p>{isAdmin ? "No tables yet. Use Add table, then print each table's QR code." : "No tables have been set up yet."}</p>
            </div>
          ) : (
            <div className="table_grid">
              {tables.map((table) => (
                <button
                  key={table.id}
                  type="button"
                  onClick={() => selectTable(table)}
                  aria-pressed={table.id === selectedId}
                  aria-label={`Table ${table.tableNumber}, ${STATUS_LABEL[table.status]}`}
                  className={cn("table_tile", `is_${table.status.toLowerCase()}`, table.id === selectedId && "is_selected")}
                >
                  <span className="table_tile_number">{table.tableNumber}</span>
                  <span className="table_tile_meta">
                    <Users />
                    {table.status === "OCCUPIED" ? `${table.guestCount}/${table.capacity}` : table.capacity}
                  </span>
                </button>
              ))}
            </div>
          )}
        </DataCard>

        {/* iPad landscape and up: details sit beside the floor. Phones and iPad portrait use a bottom sheet. */}
        <aside className="table_detail_aside">{detail}</aside>
      </div>

      <Sheet open={!isWide && sheetOpen && selected !== null} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="table_detail_sheet [&>button:last-child]:hidden">
          <SheetTitle className="sr-only">{selected ? `Table ${selected.tableNumber}` : "Table"}</SheetTitle>
          <button type="button" className="table_sheet_close" onClick={() => setSheetOpen(false)} aria-label="Close">
            <X />
          </button>
          {detail}
        </SheetContent>
      </Sheet>

      <FormModal
        open={isAdmin && formOpen}
        onOpenChange={setFormOpen}
        title={editing ? `Edit table ${editing.tableNumber}` : "Add table"}
        submitLabel="Save table"
        onSubmit={saveTable}
        isLoading={isCreating || isUpdating}
      >
        <div className="grid gap-4 p-4 md:grid-cols-3">
          <FormInput
            label="Table number"
            required
            placeholder="e.g. 01"
            maxLength={20}
            value={form.tableNumber}
            onChange={(e) => setForm({ ...form, tableNumber: e.target.value.toUpperCase() })}
          />
          <FormSelect label="Size" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value as TableSize })}>
            {(Object.keys(SIZE_LABEL) as TableSize[]).map((size) => (
              <option key={size} value={size}>{SIZE_LABEL[size]}</option>
            ))}
          </FormSelect>
          <FormInput
            label="Seats (optional)"
            inputMode="numeric"
            placeholder="Uses the size default"
            value={form.capacity}
            onChange={(e) => setForm({ ...form, capacity: e.target.value.replace(/\D/g, "") })}
          />
        </div>
      </FormModal>

      <QrDialog target={qrTarget} onClose={() => setQrTarget(null)} />
      {confirmDialog}
    </PageShell>
  );
}

function TableDetail({
  table,
  isAdmin,
  onShowQr,
  onEdit,
  onDelete,
}: {
  table: TableResponse;
  isAdmin: boolean;
  onShowQr: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { data: orders, isLoading, error, refetch, isFetching } = useListTableOrdersQuery(table.id);
  const [updateStatus, { isLoading: isSaving }] = useUpdateTableStatusMutation();
  const { printInvoice, isBusy } = useOrderInvoice();
  const guests = Math.max(table.guestCount, 1);

  useStaffOrderAlerts(
    useCallback(
      (message) => {
        if (message.order.tableNumber === table.tableNumber) void refetch();
      },
      [refetch, table.tableNumber]
    )
  );

  const activeOrders = orders ?? [];
  const tableTotal = activeOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);

  const setStatus = async (status: TableStatus, guestCount = guests) => {
    try {
      await updateStatus({ id: table.id, body: { status, guestCount: status === "OCCUPIED" ? guestCount : 0 } }).unwrap();
      if (status !== table.status) toast.success(`Table ${table.tableNumber} is ${STATUS_LABEL[status].toLowerCase()}`);
    } catch (err) {
      toast.error(apiErrorMessage(err as never, "Could not update the table."));
    }
  };

  const changeGuests = (delta: number) => {
    const next = Math.min(Math.max(guests + delta, 1), table.capacity);
    if (next !== table.guestCount) void setStatus("OCCUPIED", next);
  };

  return (
    <div className="table_detail">
      <div className="table_detail_header">
        <h2>Table #{table.tableNumber}</h2>
        <span className="table_status_pill">
          <span className={cn("table_legend_dot", `is_${table.status.toLowerCase()}`)} />
          {STATUS_LABEL[table.status]}
        </span>
      </div>
      <p className="table_detail_sub">
        {humanise(table.size)} · seats {table.capacity}
      </p>

      <div className="table_detail_section">
        <span className="table_detail_label">Table status</span>
        <div className="table_status_switch" role="group" aria-label="Table status">
          {(Object.keys(STATUS_LABEL) as TableStatus[]).map((status) => (
            <button
              key={status}
              type="button"
              disabled={isSaving}
              className={cn(table.status === status && "is_selected")}
              onClick={() => table.status !== status && setStatus(status)}
            >
              {STATUS_LABEL[status]}
            </button>
          ))}
        </div>
        {table.status === "OCCUPIED" ? (
          <div className="table_guest_row">
            <span>Guests</span>
            <div className="table_guest_stepper">
              <button type="button" onClick={() => changeGuests(-1)} disabled={isSaving || guests <= 1} aria-label="Fewer guests">
                <Minus />
              </button>
              <b>{guests}</b>
              <button type="button" onClick={() => changeGuests(1)} disabled={isSaving || guests >= table.capacity} aria-label="More guests">
                <Plus />
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="table_detail_section">
        <span className="table_detail_label">Customer orders</span>
        {isLoading ? (
          <SkeletonBlock className="h-24 w-full rounded-xl" />
        ) : error ? (
          <ErrorState error={error} fallback="Could not load this table's orders." onRetry={refetch} isRetrying={isFetching} />
        ) : activeOrders.length === 0 ? (
          <p className="table_detail_hint">No open orders at this table.</p>
        ) : (
          <div className="space-y-3">
            {activeOrders.map((order) => (
              <TableOrderCard
                key={order.id}
                order={order}
                onPrint={() => printInvoice(order.id)}
                isPrinting={isBusy(order.id, "print")}
              />
            ))}
            {activeOrders.length > 1 ? (
              <div className="table_total_row">
                <span>Table total</span>
                <b>{money(tableTotal)}</b>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {table.status === "OCCUPIED" && activeOrders.length === 0 && !isLoading ? (
        <button type="button" className="btn_outline_black w-full justify-center" disabled={isSaving} onClick={() => setStatus("AVAILABLE")}>
          Clear table
        </button>
      ) : null}

      <div className="table_detail_actions">
        <button type="button" className="btn_outline_black" onClick={onShowQr}>
          <QrCode />
          Table QR
        </button>
        {isAdmin ? (
          <>
            <button type="button" className="btn_outline_black" onClick={onEdit}>
              <Pencil />
              Edit
            </button>
            <button
              type="button"
              className="btn_outline_black text-red-600"
              onClick={onDelete}
              disabled={table.status === "OCCUPIED"}
              title={table.status === "OCCUPIED" ? "Clear the table before deleting it" : undefined}
            >
              <Trash2 />
              Delete
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}

function TableOrderCard({ order, onPrint, isPrinting }: { order: OrderResponse; onPrint: () => void; isPrinting: boolean }) {
  return (
    <div className="table_order_card">
      <div className="table_order_head">
        <b>#{orderCode(order.id)}</b>
        <span>{order.customerName ? titleCase(order.customerName) : "Walk-in"}</span>
      </div>
      <ul className="table_order_items">
        {order.items.map((item) => (
          <li key={item.id}>
            <span>
              {item.quantity}x {titleCase(item.productName)}
              {item.variantName ? <small> · {humanise(item.variantName)}</small> : null}
            </span>
            <b>{money(item.subtotal)}</b>
          </li>
        ))}
      </ul>
      <div className="table_total_row">
        <span>Total</span>
        <b>{money(order.totalAmount)}</b>
      </div>
      <ol className="table_order_steps" aria-label="Order progress">
        {ORDER_STEPS.map((step) => (
          <li key={step.label} className={cn(step.reached(order.status) && "is_reached")}>
            {step.label}
          </li>
        ))}
      </ol>
      {order.paidAt ? (
        <button type="button" className="btn_primary_black w-full justify-center" onClick={onPrint} disabled={isPrinting}>
          {isPrinting ? <Loader2 className="animate-spin" /> : <Printer />}
          {isPrinting ? "Preparing..." : "Print Bill"}
        </button>
      ) : (
        <p className="table_detail_hint">Not paid yet — the bill can be printed once it&apos;s paid.</p>
      )}
    </div>
  );
}

type QrTarget = { title: string; heading: string; caption: string; url: string; fileName: string };

function QrDialog({ target, onClose }: { target: QrTarget | null; onClose: () => void }) {
  const [qr, setQr] = useState<{ url: string; dataUrl: string } | null>(null);

  useEffect(() => {
    if (!target) return;
    let active = true;
    QRCode.toDataURL(target.url, { errorCorrectionLevel: "M", margin: 2, width: 640 })
      .then((dataUrl) => { if (active) setQr({ url: target.url, dataUrl }); })
      .catch(() => toast.error("Could not draw the QR code"));
    return () => { active = false; };
  }, [target]);

  const dataUrl = target && qr?.url === target.url ? qr.dataUrl : null;

  const printQr = () => {
    if (!target || !dataUrl) return;
    const win = window.open("", "_blank", "width=480,height=640");
    if (!win) {
      toast.error("Allow pop-ups to print the QR code");
      return;
    }
    const escape = (text: string) => text.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] ?? c);
    win.document.write(`<!doctype html><title>${escape(target.heading)}</title>
      <body style="margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;text-align:center">
      <h1 style="margin:0 0 8px">${escape(target.heading)}</h1>
      <p style="margin:0 0 16px;color:#555">${escape(target.caption)}</p>
      <img src="${dataUrl}" style="width:320px;height:320px" onload="window.print()" />
      </body>`);
    win.document.close();
  };

  return (
    <Dialog open={target !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="admin_modal sm:max-w-[420px]">
        <DialogHeader className="admin_modal_header">
          <DialogTitle className="admin_modal_title">{target?.title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-3 p-4 text-center">
          <p className="text-sm text-gray-600">{target?.caption}</p>
          {dataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={dataUrl} alt={target?.title} className="h-60 w-60 rounded-xl border" />
          ) : (
            <SkeletonBlock className="h-60 w-60 rounded-xl" />
          )}
          <p className="break-all text-xs text-gray-500">{target?.url}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <button type="button" className="btn_primary_black" onClick={printQr} disabled={!dataUrl}>
              <Printer />
              Print
            </button>
            {dataUrl ? (
              <a className="btn_outline_black" href={dataUrl} download={target?.fileName}>
                <Download />
                Download
              </a>
            ) : null}
            {target ? (
              <button
                type="button"
                className="btn_outline_black"
                onClick={() => {
                  void navigator.clipboard?.writeText(target.url).then(
                    () => toast.success("Link copied"),
                    () => toast.error("Could not copy the link")
                  );
                }}
              >
                <Copy />
                Copy link
              </button>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
