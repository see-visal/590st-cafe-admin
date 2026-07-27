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
import { PageShell } from "@/components/common/PageShell";
import { PageHeader } from "@/components/common/PageHeader";
import { AdminTopActions, FormSelect } from "@/components/common/AdminKit";
import { PosPaymentModal } from "@/features/pos/components/PosPaymentModal";
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

function ProductArtwork({ accent, compact = false }: { accent: string; compact?: boolean }) {
  return (
    <div
      className={cn("pos_product_art", compact && "is_compact")}
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
        "pos_quantity_control",
        variant === "product" && "is_product",
        variant === "cart" && "is_cart",
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
    <PageShell contentClassName="is_pos_page">
      <PageHeader
        title="POS"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Point of Sale" },
        ]}
        rightSlot={<AdminTopActions />}
      />

      <div className="pos_layout">
        <section className="pos_catalog" aria-label="Product catalog">
          <div className="pos_catalog_toolbar">
            <div className="pos_category_selection" role="tablist" aria-label="Product categories">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={activeCategory === category}
                  className={cn(activeCategory === category && "is_active")}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            <label className="pos_search">
              <Search />
              <input placeholder="Search product by name or SKU" />
            </label>
          </div>

          <div className="pos_product_grid_scroll">
            <div className="pos_product_grid">
              {visibleProducts.map((product) => {
                const discountedPrice = product.discount
                  ? product.price * (1 - product.discount / 100)
                  : product.price;
                return (
                  <article key={product.id} className="pos_product_card">
                    <div className="pos_product_media">
                      <ProductArtwork accent={product.accent} />
                      {product.discount && (
                        <span className="pos_discount_badge">{product.discount}% Off</span>
                      )}
                    </div>
                    <div className="pos_product_content">
                      <div className="pos_product_details">
                        <div className="pos_product_title_row">
                          <h2>{product.name}</h2>
                          <strong>${discountedPrice.toFixed(2)}</strong>
                        </div>
                        <div className="pos_product_meta">
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

        <aside className="pos_order_panel" aria-label="Order summary">
          <div className="pos_order_header">
            <div>
              <h2>Order Summary</h2>
            </div>
            <div className="pos_order_header_actions">
              <button type="button" aria-label="Add customer"><Plus /></button>
              <button type="button" aria-label="Add note"><Pencil /></button>
              <button type="button" aria-label="Clear order"><X /></button>
            </div>
          </div>

          <div className="pos_order_selects">
            <FormSelect
              label="Dining option"
              value={diningOption}
              onChange={(event) => setDiningOption(event.target.value)}
              placeholder="Select dining"
            >
              <option value="dine-in">Dine in</option>
              <option value="takeaway">Takeaway</option>
              <option value="delivery">Delivery</option>
            </FormSelect>
            <FormSelect
              label="Table"
              value={tableOption}
              onChange={(event) => setTableOption(event.target.value)}
              placeholder="Select table"
            >
              <option value="table-01">Table 01</option>
              <option value="table-02">Table 02</option>
            </FormSelect>
          </div>

          <div className="pos_cart_list">
            {CART_ITEMS.map((item) => (
              <article key={item.id} className="pos_cart_item">
                <ProductArtwork accent={item.accent} compact />
                <div className="pos_cart_item_content">
                  <h3>{item.name}</h3>
                  {"note" in item && item.note ? <p>{item.note}</p> : null}
                  <div className="pos_cart_item_bottom">
                    <div className="pos_cart_price">
                      {"originalPrice" in item && item.originalPrice ? (
                        <span className="is_struck">${item.originalPrice.toFixed(2)}</span>
                      ) : null}
                      <strong>${item.price.toFixed(2)}</strong>
                    </div>
                    <QuantityControl quantity={item.quantity} variant="cart" />
                  </div>
                </div>
                <div className="pos_cart_item_actions">
                  <button
                    type="button"
                    className="pos_cart_action is_remove"
                    aria-label={`Remove ${item.name}`}
                  >
                    <X />
                  </button>
                  <button type="button" className="pos_cart_action is_edit" aria-label={`Edit ${item.name}`}>
                    <Pencil />
                  </button>
                </div>
              </article>
            ))}
          </div>

          <dl className="pos_order_totals">
            <dt>Subtotal:</dt>
            <dd>
              ${subtotal.toFixed(2)} - {itemCount} {itemCount === 1 ? "Item" : "Items"}
            </dd>
            <dt>
              <button type="button" className="pos_order_discount_link">
                Total Discount:
              </button>
            </dt>
            <dd>${discount.toFixed(2)}</dd>
            <dt className="is_grand_total">Grand Total:</dt>
            <dd className="is_grand_total">${total.toFixed(2)}</dd>
          </dl>

          <div className="pos_order_ctas">
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
  return <span aria-hidden className="pos_cta_arrow">→</span>;
}
