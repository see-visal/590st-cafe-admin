"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { apiErrorMessage } from "@/store/api/baseApi";
import { useDownloadOrderInvoiceMutation } from "@/store/api/orderApi";
import { useDownloadBaristaOrderInvoiceMutation } from "@/store/api/baristaOrderApi";
import { useCurrentRole } from "@/store/api/useCurrentRole";
import { downloadBlob, printPdfBlob } from "@/lib/utils";

type InvoiceMode = "print" | "view" | "download";

export const orderCode = (orderId: string) =>
  orderId.slice(0, 8).toUpperCase();

export const invoiceTitle = (orderId: string) =>
  `Invoice #${orderCode(orderId)}`;
export const invoiceFilename = (orderId: string) =>
  `invoice-${orderCode(orderId)}.pdf`;

const FAILURE: Record<Exclude<InvoiceMode, "view">, string> = {
  print: "Could not print the invoice.",
  download: "Could not download the invoice.",
};

export function useOrderInvoice() {
  const { isAdmin } = useCurrentRole();
  const [adminDownload] = useDownloadOrderInvoiceMutation();
  const [baristaDownload] = useDownloadBaristaOrderInvoiceMutation();
  const [busy, setBusy] = useState<{
    orderId: string;
    mode: InvoiceMode;
  } | null>(null);

  const run = async (orderId: string, mode: Exclude<InvoiceMode, "view">) => {
    if (busy) return;
    setBusy({ orderId, mode });
    try {
      const blob = await (isAdmin ? adminDownload : baristaDownload)(
        orderId,
      ).unwrap();
      if (mode === "print") printPdfBlob(blob);
      else downloadBlob(blob, invoiceFilename(orderId));
    } catch (err) {
      toast.error(apiErrorMessage(err as never, FAILURE[mode]));
    } finally {
      setBusy(null);
    }
  };

  return {
    printInvoice: (orderId: string) => run(orderId, "print"),
    viewInvoice: (orderId: string) => {
      window.open(`/invoices/${encodeURIComponent(orderId)}`, "_blank");
    },
    downloadInvoice: (orderId: string) => run(orderId, "download"),
    isBusy: (orderId: string, mode?: InvoiceMode) =>
      busy?.orderId === orderId && (!mode || busy.mode === mode),
  };
}
