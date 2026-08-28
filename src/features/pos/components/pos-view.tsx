"use client";

import { useState } from "react";
import {
  Coffee,
  Minus,
  Pencil,
  Plus,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";
import { PageShell } from "@/components/shared/page-shell";
import { PageHeader } from "@/components/shared/page-header";
import { AdminTopActions, FormSelect, SelectItem } from "@/components/shared/admin-kit";
import { PosPaymentModal } from "@/features/pos/components/pos-payment-modal";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type PosProduct = {
  id: string;
  name: string;
  category: "Food" | "Drinks" | "Beer";
  price: number;
  stock: number;
  unit: string;
  accent: string;
  discount?: number;
};

const PRODUCTS: PosProduct[] = [
  { id: "p1", name: "Caffe Latte", category: "Drinks", price: 5, stock: 20, unit: "cups", accent: "#7c4a2d" },
  { id: "p2", name: "Matcha Green Tea", category: "Drinks", price: 5.5, stock: 14, unit: "cups", accent: "#789b3d" },
  { id: "p3", name: "Iced Americano", category: "Drinks", price: 4.5, stock: 22, unit: "cups", accent: "#3f2b22" },
  { id: "p4", name: "Butter Croissant", category: "Food", price: 3.2, stock: 12, unit: "pcs", accent: "#d89b43", discount: 20 },
  { id: "p5", name: "Chicken Sandwich", category: "Food", price: 6.5, stock: 8, unit: "pcs", accent: "#d66b3c" },
  { id: "p6", name: "Chocolate Muffin", category: "Food", price: 3.8, stock: 16, unit: "pcs", accent: "#633a2a" },
  { id: "p7", name: "Cold Brew", category: "Drinks", price: 5.75, stock: 10, unit: "cups", accent: "#534137" },
  { id: "p8", name: "Passion Soda", category: "Drinks", price: 4.25, stock: 18, unit: "cans", accent: "#e28b26" },
  { id: "p9", name: "Lager Beer", category: "Beer", price: 4.5, stock: 24, unit: "bottles", accent: "#c69a28" },
  { id: "p10", name: "Espresso", category: "Drinks", price: 3.5, stock: 30, unit: "cups", accent: "#4a2c20" },
  { id: "p11", name: "Caesar Salad", category: "Food", price: 7.5, stock: 6, unit: "pcs", accent: "#6b8f4e" },
  { id: "p12", name: "IPA Beer", category: "Beer", price: 5.25, stock: 18, unit: "bottles", accent: "#d4a017" },
];

const CART_ITEMS = [
  {
    id: "c1",
    name: "Coca",
    note: "This coca is nearly out of stock plz add",
    originalPrice: 1,
    price: 0.5,
    quantity: 1,
    accent: "#c41e3a",
  },
  {
    id: "c2",
    name: "Coca",
    note: "This coca is nearly out of stock plz add",
    originalPrice: 1,
    price: 0.5,
    quantity: 1,
    accent: "#c41e3a",
  },
  {
    id: "c3",
    name: "Coca",
    originalPrice: 1,
    price: 0.5,
    quantity: 1,
    accent: "#c41e3a",
  },
] as const;

const CAT_BTN =
  "h-[38px] min-w-[82px] cursor-pointer rounded-lg border border-[#CED1D8] bg-white px-4 text-[length:var(--text-button)] font-medium text-[#333333] transition-colors hover:border-gray-400";
const CAT_BTN_ACTIVE = "border-[#111111] bg-[#111111] text-[#befe35]";
const QTY_BASE =
  "inline-flex box-border items-center justify-between rounded-full border border-[#E5E7EB] bg-white [&_button]:grid [&_button]:size-6 [&_button]:cursor-pointer [&_button]:place-items-center [&_button]:border-0 [&_button]:bg-transparent [&_button]:text-gray-500 [&_button:hover]:text-[#111111] [&_span]:min-w-5 [&_span]:text-center [&_span]:font-semibold [&_span]:text-[#1E1E1E]";
const QTY_SIZED =
  "h-[38px] rounded-2xl border-[#E6E6E6] px-3 py-1 [&_button_svg]:size-3 [&_span]:text-sm [&_span]:leading-none";

function ProductArtwork({ accent, compact = false }: { accent: string; compact?: boolean }) {
  return (
    <div
      className={cn("pos_product_art", compact && "size-16 shrink-0")}
      style={{ background: `linear-gradient(145deg, ${accent}, #111111)` }}
      aria-hidden
    >
      <span><Coffee /></span>
    </div>
  );
}

function QuantityControl({
  quantity,
  variant = "product",
}: {
  quantity: number;
  variant?: "product" | "cart";
}) {
  return (
    <div
      className={cn(
        QTY_BASE,
        QTY_SIZED,
        variant === "product" && "w-full"
      )}
    >
      <button type="button" aria-label="Decrease quantity"><Minus /></button>
      <span>{quantity}</span>
      <button type="button" aria-label="Increase quantity"><Plus /></button>
    </div>
  );
}

export default function PosView() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [diningOption, setDiningOption] = useState("");
  const [tableOption, setTableOption] = useState("");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const categories = ["All", "Food", "Drinks", "Beer"];
  const visibleProducts =
    activeCategory === "All"
      ? PRODUCTS
      : PRODUCTS.filter((product) => product.category === activeCategory);

  const itemCount = CART_ITEMS.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = CART_ITEMS.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discount = 0;
  const total = subtotal - discount;

  return (
    <PageShell contentClassName="gap-4 overflow-hidden [&_.page_header]:shrink-0 [&_.page_title_row]:shrink-0">
      <PageHeader
        title="POS"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Point of Sale" },
        ]}
        rightSlot={<AdminTopActions />}
      />

      <div className="flex min-h-0 min-w-0 flex-1 items-stretch gap-[30px] overflow-hidden max-xl:flex-none max-xl:flex-col max-xl:overflow-visible">
        <section className="flex w-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden" aria-label="Product catalog">
          <div className="flex shrink-0 items-center justify-between gap-5 py-3 max-md:flex-col max-md:items-stretch">
            <div className="flex flex-wrap gap-2.5" role="tablist" aria-label="Product categories">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={activeCategory === category}
                  className={cn(CAT_BTN, activeCategory === category && CAT_BTN_ACTIVE)}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            <label className="relative flex w-[min(100%,320px)] items-center max-md:w-full">
              <Search className="pointer-events-none absolute right-[13px] size-[18px] text-[#111111]" />
              <Input
                placeholder="Search product by name or SKU"
                className="h-10 w-full rounded-lg border border-[#CED1D8] bg-white py-0 pr-[42px] pl-3.5 text-[length:var(--text-body-sm)] text-[#1E1E1E] outline-none placeholder:text-gray-400 focus:border-[#111111] focus:shadow-[0_0_0_3px_rgba(190,254,53,.22)]"
              />
            </label>
          </div>

          <div className="pos_scroll_area min-h-0 flex-1 overflow-x-hidden overflow-y-auto pr-1.5 -mr-0.5 max-xl:flex-none max-xl:overflow-visible max-xl:mr-0 max-xl:pr-0">
            <div className="grid grid-cols-1 content-start gap-3.5 min-[521px]:grid-cols-2 min-[900px]:grid-cols-3">
              {visibleProducts.map((product) => {
                const discountedPrice = product.discount
                  ? product.price * (1 - product.discount / 100)
                  : product.price;
                return (
                  <article key={product.id} className="flex min-w-0 flex-col overflow-visible rounded-lg border border-[#EDEDED] bg-white p-5 shadow-[0px_10px_24px_rgba(32,33,36,.05)]">
                    <div className="relative shrink-0">
                      <ProductArtwork accent={product.accent} />
                      {product.discount && (
                        <span className="absolute right-2 bottom-2 rounded-full bg-[#befe35] px-2.5 py-[5px] text-[.6875rem] font-bold text-[#111111] shadow-[0_4px_10px_rgba(0,0,0,.12)]">{product.discount}% Off</span>
                      )}
                    </div>
                    <div className="flex min-w-0 flex-col gap-2.5">
                      <div className="flex min-w-0 flex-col gap-1.5 py-2.5">
                        <div className="flex items-start justify-between gap-2.5 [&_h2]:truncate [&_h2]:text-[length:var(--text-body-sm)] [&_h2]:font-semibold [&_h2]:text-[#1E1E1E] [&_strong]:shrink-0 [&_strong]:text-[length:var(--text-body-sm)] [&_strong]:font-bold [&_strong]:text-green-700">
                          <h2>{product.name}</h2>
                          <strong>${discountedPrice.toFixed(2)}</strong>
                        </div>
                        <div className="flex justify-between gap-2 text-[.6875rem] text-[#999999]">
                          <span>In stock: {product.stock}</span>
                          <span>{product.unit}</span>
                        </div>
                      </div>
                      <QuantityControl
                        quantity={product.id === "p2" ? 0 : 1}
                        variant="product"
                      />
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <aside className="sticky top-0 flex h-full max-h-full w-[485px] flex-[0_0_485px] flex-col overflow-hidden rounded-t-xl bg-white p-5 px-4 shadow-[0px_19px_38px_rgba(32,33,36,.10)] max-xl:static max-xl:h-auto max-xl:max-h-none max-xl:w-full max-xl:flex-auto" aria-label="Order summary">
          <div className="flex items-center justify-between gap-4 border-b border-[#EDEDED] px-3 pt-2.5 pb-5 [&_p]:text-[.6875rem] [&_p]:text-[#999999]">
            <div>
              <h2>Order Summary</h2>
            </div>
            <div className="flex gap-2 [&_button]:grid [&_button]:size-[34px] [&_button]:cursor-pointer [&_button]:place-items-center [&_button]:rounded-lg [&_button]:border [&_button]:border-[#EDEDED] [&_button]:bg-white [&_button]:text-[#333333] [&_button:hover]:border-[#befe35] [&_button:hover]:bg-[#fbfff2] [&_button_svg]:size-4 [&_button:last-child]:text-red-600">
              <button type="button" aria-label="Add customer"><Plus /></button>
              <button type="button" aria-label="Add note"><Pencil /></button>
              <button type="button" aria-label="Clear order"><X /></button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 rounded-2xl p-3 min-[481px]:grid-cols-2 [&_.form_field]:m-0 [&_.form_field]:gap-1.5 [&_.form_field_label]:text-[.6875rem] [&_.form_field_label]:font-normal [&_.form_field_label]:leading-tight [&_.form_field_label]:text-gray-500 [&_.form_field_control]:h-11 [&_.form_field_control]:rounded-2xl [&_.form_field_control]:border-[#E6E6E6] [&_.form_field_control]:py-3 [&_.form_field_control]:pr-10 [&_.form_field_control]:pl-3 [&_.form_field_control]:text-sm [&_.form_field_icon]:right-3 [&_.form_field_icon]:size-4 [&_.form_field_icon]:text-[#1E1E1E]">
            <FormSelect
              label="Dining option"
              value={diningOption}
              onValueChange={(event) => setDiningOption(event)}
              placeholder="Select dining"
            >
              <SelectItem value="dine-in">Dine in</SelectItem>
              <SelectItem value="takeaway">Takeaway</SelectItem>
              <SelectItem value="delivery">Delivery</SelectItem>
            </FormSelect>
            <FormSelect
              label="Table"
              value={tableOption}
              onValueChange={(event) => setTableOption(event)}
              placeholder="Select table"
            >
              <SelectItem value="table-01">Table 01</SelectItem>
              <SelectItem value="table-02">Table 02</SelectItem>
            </FormSelect>
          </div>

          <div className="[scrollbar-width:thin] flex min-h-0 flex-col overflow-y-auto pr-0.5">
            {CART_ITEMS.map((item) => (
              <article key={item.id} className="flex items-start gap-4 rounded-2xl bg-white p-3 odd:bg-[#F6F6F6]">
                <ProductArtwork accent={item.accent} compact />
                <div className="min-w-0 flex-1 [&_h3]:text-[length:var(--text-body-sm)] [&_h3]:font-semibold [&_h3]:text-[#1E1E1E] [&_p]:mt-1 [&_p]:truncate [&_p]:text-[.6875rem] [&_p]:text-[#999999]">
                  <h3>{item.name}</h3>
                  {"note" in item && item.note ? <p>{item.note}</p> : null}
                  <div className="mt-2.5 flex items-center justify-between gap-4">
                    <div className="flex items-baseline gap-1.5 [&_.is_struck]:text-xs [&_.is_struck]:text-[#999999] [&_.is_struck]:line-through [&_strong]:text-[length:var(--text-body-sm)] [&_strong]:font-bold [&_strong]:text-[#1E1E1E]">
                      {"originalPrice" in item && item.originalPrice ? (
                        <span className="is_struck">${item.originalPrice.toFixed(2)}</span>
                      ) : null}
                      <strong>${item.price.toFixed(2)}</strong>
                    </div>
                    <QuantityControl quantity={item.quantity} variant="cart" />
                  </div>
                </div>
                <div className="flex shrink-0 flex-col gap-2 self-start">
                  <button
                    type="button"
                    className="grid size-6 cursor-pointer place-items-center rounded-full border-0 bg-red-600/10 text-red-600 hover:opacity-85 [&_svg]:size-3"
                    aria-label={`Remove ${item.name}`}
                  >
                    <X />
                  </button>
                  <button type="button" className="grid size-6 cursor-pointer place-items-center rounded-full border-0 bg-blue-600/10 text-blue-600 hover:opacity-85 [&_svg]:size-3" aria-label={`Edit ${item.name}`}>
                    <Pencil />
                  </button>
                </div>
              </article>
            ))}
          </div>

          <dl className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-3 rounded-2xl border-t border-[#EDEDED] bg-[#F6F6F6] p-4 [&_dt]:m-0 [&_dt]:text-base [&_dt]:font-normal [&_dt]:leading-normal [&_dt]:text-[#1E1E1E] [&_dd]:m-0 [&_dd]:text-right [&_dd]:text-base [&_dd]:font-normal [&_dd]:leading-normal [&_dd]:text-[#1E1E1E] [&_.is_grand_total]:text-xl [&_.is_grand_total]:font-medium [&_.is_grand_total]:leading-[1.625rem] [&_dt.is_grand_total]:text-[#5C2CF0]">
            <dt>Subtotal:</dt>
            <dd>
              ${subtotal.toFixed(2)} - {itemCount} {itemCount === 1 ? "Item" : "Items"}
            </dd>
            <dt>
              <button type="button" className="cursor-pointer border-0 bg-transparent p-0 font-[inherit] text-base leading-normal text-blue-600 underline hover:text-blue-700">
                Total Discount:
              </button>
            </dt>
            <dd>${discount.toFixed(2)}</dd>
            <dt className="is_grand_total">Grand Total:</dt>
            <dd className="is_grand_total">${total.toFixed(2)}</dd>
          </dl>

          <div className="grid grid-cols-1 gap-2.5 pt-4 min-[481px]:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)] [&_button]:h-11 [&_button]:max-h-11 [&_button]:w-full">
            <button type="button" className="btn_outline_black">
              <ShoppingBag />
              Save Draft
            </button>
            <button type="button" className="btn_primary_yellow" onClick={() => setPaymentOpen(true)}>
              Make a Payment
              <ArrowIcon />
            </button>
          </div>
        </aside>
      </div>

      <PosPaymentModal
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        items={CART_ITEMS}
        total={total}
      />
    </PageShell>
  );
}

function ArrowIcon() {
  return <span aria-hidden className="text-[length:var(--text-card-title)] leading-none">→</span>;
}
