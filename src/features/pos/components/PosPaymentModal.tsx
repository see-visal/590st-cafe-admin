"use client";

import { useEffect, useMemo, useState } from "react";
import { Delete } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type PosCartItem = {
  id: string;
  name: string;
  note?: string;
  originalPrice?: number;
  price: number;
  quantity: number;
  accent: string;
};

type PosPaymentModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: readonly PosCartItem[];
  total: number;
  orderTable?: string;
  orderId?: string;
  /** Receives the cash tendered on the numpad; resolves once the API call settles. */
  onConfirm?: (amountTendered: number) => void | Promise<void>;
  isLoading?: boolean;
};

const NUMPAD_ROWS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["00", "0", "backspace"],
] as const;

function formatMoney(value: number) {
  return `$${value.toFixed(2)}`;
}

export function PosPaymentModal({
  open,
  onOpenChange,
  items,
  total,
  orderTable = "Order Table #51",
  orderId = "#542845",
  onConfirm,
  isLoading = false,
}: PosPaymentModalProps) {
  const [cashInput, setCashInput] = useState(total.toFixed(2));

  useEffect(() => {
    if (open) {
      setCashInput(total.toFixed(2));
    }
  }, [open, total]);

  const credit = useMemo(() => {
    const parsed = Number.parseFloat(cashInput);
    return Number.isFinite(parsed) ? parsed : 0;
  }, [cashInput]);

  const balance = credit - total;

  const appendValue = (value: string) => {
    setCashInput((current) => {
      if (current === "0" && value !== ".") {
        return value === "00" ? "0" : value;
      }
      if (value === "00") {
        return `${current}00`;
      }
      if (value === "." && current.includes(".")) {
        return current;
      }
      return `${current}${value}`;
    });
  };

  const handleBackspace = () => {
    setCashInput((current) => {
      if (current.length <= 1) {
        return "0";
      }
      return current.slice(0, -1);
    });
  };

  const handleCancel = () => {
    setCashInput("0");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="admin_modal is_pos_payment">
        <DialogHeader className="admin_modal_header">
          <DialogTitle className="admin_modal_title">Checkout Order Payment</DialogTitle>
        </DialogHeader>

        <div className="pos_payment_modal_body">
          <div className="pos_payment_modal_layout">
            <section className="pos_payment_left" aria-label="Payment calculator">
              <div className="pos_payment_payable">
                <p>Payable Amount (Grand Total)</p>
                <strong>{formatMoney(total)}</strong>
              </div>

              <div className="pos_payment_cash">
                <p className="pos_payment_cash_label">Cash Only</p>
                <div className="pos_payment_cash_input">{formatMoney(credit)}</div>

                <div className="grid grid-cols-3 gap-2">
                  {NUMPAD_ROWS.flatMap((row) =>
                    row.map((key) => {
                      if (key === "backspace") {
                        return (
                          <button
                            key={key}
                            type="button"
                            className="pos_payment_key is_icon"
                            aria-label="Backspace"
                            onClick={handleBackspace}
                          >
                            <Delete />
                          </button>
                        );
                      }

                      return (
                        <button
                          key={key}
                          type="button"
                          className="pos_payment_key"
                          onClick={() => appendValue(key)}
                        >
                          {key}
                        </button>
                      );
                    })
                  )}

                  <button
                    type="button"
                    className="pos_payment_key"
                    onClick={() => appendValue(".")}
                  >
                    .
                  </button>
                  <button
                    type="button"
                    className="pos_payment_key col-span-2 is_cancel"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </section>

            <section className="pos_payment_right" aria-label="Order summary">
              <div className="pos_payment_summary_head">
                <h2>Order Summary</h2>
                <div>
                  <strong>{orderTable}</strong>
                  <span>{orderId}</span>
                </div>
              </div>

              <div className="pos_payment_items">
                {items.map((item) => (
                  <article key={item.id} className="pos_payment_item">
                    <div className="pos_payment_item_info">
                      <h3>{item.name}</h3>
                      {item.note ? <p>{item.note}</p> : null}
                    </div>
                    <div className="pos_payment_item_meta">
                      <strong>QTY: {item.quantity}</strong>
                      <div className="pos_cart_price">
                        {item.originalPrice ? (
                          <span className="is_struck">{formatMoney(item.originalPrice)}</span>
                        ) : null}
                        <strong>{formatMoney(item.price)}</strong>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <dl className="pos_payment_totals">
                <dt>Credit:</dt>
                <dd>{formatMoney(credit)}</dd>
                <dt className="is_balance">Balance:</dt>
                <dd className={cn("is_balance", balance < 0 && "is_negative")}>
                  {balance < 0 ? "-" : ""}
                  {formatMoney(Math.abs(balance))}
                </dd>
              </dl>

              <button
                type="button"
                className="btn_primary_yellow pos_payment_confirm"
                // Short-changing the till is a hard stop, not a warning.
                disabled={isLoading || balance < 0 || items.length === 0}
                onClick={() => onConfirm?.(credit)}
              >
                {isLoading ? "Processing..." : "Confirm Payment"}
              </button>
            </section>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
