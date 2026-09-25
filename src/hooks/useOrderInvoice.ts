"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { apiErrorMessage } from "@/store/api/baseApi";
import { useDownloadOrderInvoiceMutation } from "@/store/api/orderApi";
import { useDownloadBaristaOrderInvoiceMutation } from "@/store/api/baristaOrderApi";
import { useCurrentRole } from "@/store/api/useCurrentRole";
import { openBlobInNewTab, printPdfBlob } from "@/lib/utils";

type InvoiceMode = "print" | "view";

// A hook that provides functions to print or view an order's invoice, and a way to check if an invoice is currently being fetched. It handles both admin and barista roles, using the appropriate API endpoint for each.
export function useOrderInvoice() {
  const { isAdmin } = useCurrentRole();
  const [adminDownload] = useDownloadOrderInvoiceMutation();
  const [baristaDownload] = useDownloadBaristaOrderInvoiceMutation();
  const [busy, setBusy] = useState<{
    orderId: string;
    mode: InvoiceMode;
  } | null>(null);

  const run = async (orderId: string, mode: InvoiceMode) => {
    if (busy) return;
    setBusy({ orderId, mode });
    try {
      const blob = await (isAdmin ? adminDownload : baristaDownload)(
        orderId,
      ).unwrap();
      if (mode === "print") printPdfBlob(blob);
      else openBlobInNewTab(blob);
    } catch (err) {
      toast.error(
        apiErrorMessage(
          err as never,
          mode === "print"
            ? "Could not print the invoice."
            : "Could not open the invoice.",
        ),
      );
    } finally {
      setBusy(null);
    }
  };

  return {
    printInvoice: (orderId: string) => run(orderId, "print"),
    viewInvoice: (orderId: string) => run(orderId, "view"),
    /** Whether this order's invoice is being fetched — optionally for one mode only. */
    isBusy: (orderId: string, mode?: InvoiceMode) =>
      busy?.orderId === orderId && (!mode || busy.mode === mode),
  };
}
