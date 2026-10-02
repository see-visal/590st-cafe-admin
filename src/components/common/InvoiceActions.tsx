"use client";

import { CheckCircle2, Download, FileText, Loader2, Printer } from "lucide-react";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { orderCode, useOrderInvoice } from "@/hooks/useOrderInvoice";
import type { OrderResponse } from "@/store/api/types";
import { cn, formatByCurrency, humanise } from "@/lib/utils";

const orderNumber = (order: Pick<OrderResponse, "id">) =>
  `#${orderCode(order.id)}`;

export function InvoiceActions({
  order,
  className,
  autoFocusPrint = false,
}: {
  order: Pick<OrderResponse, "id" | "paidAt">;
  className?: string;
  autoFocusPrint?: boolean;
}) {
  const { printInvoice, viewInvoice, downloadInvoice, isBusy } =
    useOrderInvoice();
  if (order.paidAt == null) return null;
  const busy = isBusy(order.id);

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <button
        type="button"
        onClick={() => printInvoice(order.id)}
        disabled={busy}
        autoFocus={autoFocusPrint}
        className="btn_primary_black"
      >
        {isBusy(order.id, "print") ? (
          <Loader2 className="animate-spin" />
        ) : (
          <Printer />
        )}
        {isBusy(order.id, "print") ? "Preparing..." : "Print Invoice"}
      </button>
      <button
        type="button"
        onClick={() => viewInvoice(order.id)}
        disabled={busy}
        className="btn_outline_black"
      >
        {isBusy(order.id, "view") ? (
          <Loader2 className="animate-spin" />
        ) : (
          <FileText />
        )}
        {isBusy(order.id, "view") ? "Opening..." : "View PDF"}
      </button>
      <button
        type="button"
        onClick={() => downloadInvoice(order.id)}
        disabled={busy}
        className="btn_outline_black"
      >
        {isBusy(order.id, "download") ? (
          <Loader2 className="animate-spin" />
        ) : (
          <Download />
        )}
        {isBusy(order.id, "download") ? "Downloading..." : "Download"}
      </button>
    </div>
  );
}

export function PrintInvoiceIconButton({
  order,
}: {
  order: Pick<OrderResponse, "id" | "paidAt">;
}) {
  const { printInvoice, isBusy } = useOrderInvoice();
  if (order.paidAt == null) return null;
  const busy = isBusy(order.id);

  return (
    <button
      type="button"
      onClick={() => printInvoice(order.id)}
      disabled={busy}
      aria-label={`Print invoice for order ${orderNumber(order)}`}
      title="Print invoice"
      className="inline-flex h-7 w-7 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
    >
      {busy ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Printer className="h-4 w-4" />
      )}
    </button>
  );
}

export function toastPaidWithInvoice(
  message: string,
  orderId: string,
  printInvoice: (orderId: string) => void,
) {
  toast.success(
    (t) => (
      <span className="flex flex-col items-start">
        <span className="app_toast_text">{message}</span>
        <button
          type="button"
          onClick={() => {
            toast.dismiss(t.id);
            printInvoice(orderId);
          }}
          className="app_toast_action"
        >
          <Printer aria-hidden="true" /> Print invoice
        </button>
      </span>
    ),
    { duration: 8000 },
  );
}

export function SaleCompleteModal({
  sale,
  onNewSale,
}: {
  sale: OrderResponse | null;
  onNewSale: () => void;
}) {
  const change = Number(sale?.changeDue ?? 0);

  return (
    <Dialog open={sale != null} onOpenChange={(open) => !open && onNewSale()}>
      <DialogContent className="admin_modal sm:max-w-[440px]">
        <DialogHeader className="admin_modal_header">
          <DialogTitle className="admin_modal_title">Sale Complete</DialogTitle>
        </DialogHeader>
        {sale && (
          <div className="admin_modal_body">
            <div className="flex flex-col items-center gap-2 px-6 pt-2 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
              <p className="font-mono text-sm text-gray-500">
                Order {orderNumber(sale)}
              </p>
              <p className="text-3xl font-bold tabular-nums">
                {formatByCurrency(sale.totalAmount, "USD")}
              </p>
              <p className="text-sm text-gray-500">
                Paid by{" "}
                {sale.paymentMethod ? humanise(sale.paymentMethod) : "cash"}
                {sale.amountTendered != null
                  ? ` · Received ${formatByCurrency(sale.amountTendered, sale.amountTenderedCurrency)}`
                  : ""}
              </p>
              {change > 0 && (
                <p className="mt-1 rounded-lg bg-amber-50 px-4 py-2 text-base font-semibold text-amber-900 tabular-nums">
                  Change due: {formatByCurrency(change, sale.changeCurrency)}
                </p>
              )}
            </div>
            <InvoiceActions
              order={sale}
              autoFocusPrint
              className="justify-center px-6 pt-6"
            />
          </div>
        )}
        <DialogFooter className="admin_modal_footer">
          <button
            type="button"
            onClick={onNewSale}
            className="btn_primary_yellow"
          >
            New Sale
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
