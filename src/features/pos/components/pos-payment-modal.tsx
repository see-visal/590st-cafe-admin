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
import type { PosCartItem } from "@/features/pos/types/pos.type";


type PosPaymentModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: readonly PosCartItem[];
  total: number;
  orderTable?: string;
  orderId?: string;
};

const NUMPAD_ROWS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["00", "0", "backspace"],
] as const;

const PAY_KEY =
  "flex min-h-14 cursor-pointer items-center justify-center rounded-xl border-0 bg-[#F6F6F6] text-2xl leading-none text-[#1E1E1E] hover:bg-[#ececec]";

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

        <div className="max-h-[min(85vh,760px)] overflow-y-auto bg-white p-5">
          <div className="grid grid-cols-1 gap-5 min-[961px]:grid-cols-2">
            <section className="min-w-0" aria-label="Payment calculator">
              <div className="mb-4 rounded-lg bg-white px-5 py-4 shadow-[0px_19px_38px_rgba(32,33,36,.04)] [&_p]:text-right [&_p]:text-xs [&_p]:text-gray-500 [&_strong]:mt-1.5 [&_strong]:block [&_strong]:w-full [&_strong]:text-right [&_strong]:text-[2rem] [&_strong]:font-bold [&_strong]:leading-tight [&_strong]:text-green-700">
                <p>Payable Amount (Grand Total)</p>
                <strong>{formatMoney(total)}</strong>
              </div>

              <div className="rounded-lg border border-[#CED1D8] bg-white px-5 py-4">
                <p className="mb-2.5 text-sm font-medium text-[#E17E24]">Cash Only</p>
                <div className="mb-4 flex h-14 items-center justify-end rounded-xl border border-[#E6E6E6] bg-white px-4 text-2xl font-semibold text-[#1E1E1E]">{formatMoney(credit)}</div>

                <div className="grid grid-cols-3 gap-2">
                  {NUMPAD_ROWS.flatMap((row) =>
                    row.map((key) => {
                      if (key === "backspace") {
                        return (
                          <button
                            key={key}
                            type="button"
                            className={cn(PAY_KEY, "[&_svg]:size-[22px]")}
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
                          className={PAY_KEY}
                          onClick={() => appendValue(key)}
                        >
                          {key}
                        </button>
                      );
                    })
                  )}

                  <button
                    type="button"
                    className={PAY_KEY}
                    onClick={() => appendValue(".")}
                  >
                    .
                  </button>
                  <button
                    type="button"
                    className={cn(PAY_KEY, "col-span-2 text-[length:var(--text-card-title)] font-bold")}
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </section>

            <section className="min-w-0" aria-label="Order summary">
              <div className="mb-3 flex items-start justify-between gap-4 border-b border-[#EDEDED] pb-3 [&_h2]:text-[length:var(--text-card-title)] [&_h2]:font-medium [&_h2]:leading-[1.625rem] [&_h2]:text-[#5C2CF0] [&>div]:text-right [&_strong]:block [&_strong]:text-sm [&_strong]:font-semibold [&_strong]:text-[#1E1E1E] [&_span]:mt-0.5 [&_span]:block [&_span]:text-[.6875rem] [&_span]:text-[#999999]">
                <h2>Order Summary</h2>
                <div>
                  <strong>{orderTable}</strong>
                  <span>{orderId}</span>
                </div>
              </div>

              <div className="[scrollbar-width:thin] flex max-h-[320px] flex-col overflow-y-auto">
                {items.map((item) => (
                  <article key={item.id} className="flex items-start justify-between gap-4 rounded-lg bg-white p-3 even:bg-[#F6F6F6]">
                    <div className="min-w-0 [&_h3]:text-[length:var(--text-body-sm)] [&_h3]:font-semibold [&_h3]:text-[#1E1E1E] [&_p]:mt-1 [&_p]:text-[.6875rem] [&_p]:text-[#999999]">
                      <h3>{item.name}</h3>
                      {item.note ? <p>{item.note}</p> : null}
                    </div>
                    <div className="shrink-0 text-right [&>strong]:block [&>strong]:text-xs [&>strong]:font-bold [&>strong]:text-[#1E1E1E]">
                      <strong>QTY: {item.quantity}</strong>
                      <div className="mt-1.5 flex items-baseline justify-end gap-1.5 [&_.is_struck]:text-xs [&_.is_struck]:text-[#999999] [&_.is_struck]:line-through [&_strong]:text-[length:var(--text-body-sm)] [&_strong]:font-bold [&_strong]:text-[#1E1E1E]">
                        {item.originalPrice ? (
                          <span className="is_struck">{formatMoney(item.originalPrice)}</span>
                        ) : null}
                        <strong>{formatMoney(item.price)}</strong>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <dl className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-3 rounded-2xl bg-[#F6F6F6] p-4 [&_dt]:m-0 [&_dt]:text-base [&_dt]:font-normal [&_dt]:leading-normal [&_dt]:text-[#1E1E1E] [&_dd]:m-0 [&_dd]:text-right [&_dd]:text-base [&_dd]:font-normal [&_dd]:leading-normal [&_dd]:text-[#1E1E1E] [&_.is_balance]:text-xl [&_.is_balance]:font-medium [&_.is_balance]:leading-[1.625rem] [&_dt.is_balance]:text-green-700 [&_dd.is_balance.is_negative]:text-red-600">
                <dt>Credit:</dt>
                <dd>{formatMoney(credit)}</dd>
                <dt className="is_balance">Balance:</dt>
                <dd className={cn("is_balance", balance < 0 && "is_negative")}>
                  {balance < 0 ? "-" : ""}
                  {formatMoney(Math.abs(balance))}
                </dd>
              </dl>

              <button type="button" className="btn_primary_yellow mt-4 h-12 w-full font-bold">
                Confirm Payment
              </button>
            </section>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
