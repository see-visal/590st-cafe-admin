import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { parseShopDateTime } from "@/lib/estimate";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function humanise(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// "Table 02" for dine-in, otherwise "Pickup" / "Delivery".
export function fulfillmentLabel(order: { fulfillmentMethod: string | null; tableNumber?: string | null }): string {
  if (order.fulfillmentMethod === "DINE_IN") return order.tableNumber ? `Table ${order.tableNumber}` : "Dine-in";
  return order.fulfillmentMethod ? humanise(order.fulfillmentMethod) : "";
}

const LEVEL_PERCENT: Record<string, string> = {
  ZERO: "0%",
  TWENTY_FIVE: "25%",
  FIFTY: "50%",
  SEVENTY_FIVE: "75%",
  HUNDRED: "100%",
};

export function formatLevel(level: string): string {
  return LEVEL_PERCENT[level] ?? humanise(level);
}

export function formatSku(sku: string): string {
  return sku.toUpperCase();
}

export function printPdfBlob(blob: Blob) {
  const url = URL.createObjectURL(blob);
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText =
    "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
  frame.onload = () => {
    try {
      frame.contentWindow?.focus();
      frame.contentWindow?.print();
    } catch {
      window.open(url, "_blank");
    }
    setTimeout(() => {
      frame.remove();
      URL.revokeObjectURL(url);
    }, 60_000);
  };
  frame.src = url;
  document.body.appendChild(frame);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

export function titleCase(value: string): string {
  return value.replace(
    /\S+/g,
    (word) => word.charAt(0).toUpperCase() + word.slice(1),
  );
}

function formatMoney(value: number): string {
  return `$${value.toFixed(2)}`;
}

export function formatByCurrency(
  value: number | string | null | undefined,
  currency: "USD" | "KHR" | null | undefined,
): string {
  if (value == null) return "-";
  const amount = Number(value);
  if (currency === "KHR") return `${Math.round(amount).toLocaleString()} ៛`;
  return `$${amount.toFixed(2)}`;
}

export function timeAgo(value: string): string {
  const then = parseShopDateTime(value).getTime();
  if (Number.isNaN(then)) return "";
  const minutes = Math.max(0, Math.round((Date.now() - then) / 60000));
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.floor(hours / 24)} d ago`;
}

export function productPriceLabel(
  variants: { finalPrice: number; status: string }[],
): string {
  const active = variants
    .filter((v) => v.status === "ACTIVE")
    .map((v) => Number(v.finalPrice));
  if (active.length === 0) return "No price set";
  const min = Math.min(...active);
  const max = Math.max(...active);
  return min === max
    ? formatMoney(min)
    : `${formatMoney(min)}–${formatMoney(max)}`;
}
