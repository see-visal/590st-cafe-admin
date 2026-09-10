"use client";

import { useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Loader2, Minus, Pencil, Plus, Search, ShoppingBag, X } from "lucide-react";
import { PageShell } from "@/components/common/PageShell";
import { PageHeader } from "@/components/common/PageHeader";
import { AdminTopActions, FormSelect } from "@/components/common/AdminKit";
import { PosPaymentModal, type PosCartItem } from "@/features/pos/components/PosPaymentModal";
import { apiErrorMessage } from "@/store/api/baseApi";
import { useCreateBaristaOrderMutation, usePayOrderCashMutation, useCancelBaristaOrderMutation } from "@/store/api/baristaOrderApi";
import { useListCategoriesQuery } from "@/store/api/categoryApi";
import { useListProductsQuery } from "@/store/api/productApi";
import { useCurrentRole } from "@/store/api/useCurrentRole";
import type { OrderItemRequest, OrderResponse, ProductResponse, UUID } from "@/store/api/types";
import { cn } from "@/lib/utils";

/**
 * Point of sale. Checkout is two API calls: POST /api/barista/orders creates a PENDING order
 * from the cart, then POST /api/barista/orders/{id}/pay/cash settles it with the cash
 * tendered. Stock is drawn down server-side, so the product grid refetches after each sale.
 */

/** A cart line is a product plus its chosen size — the same product in two sizes is two lines. */
type CartLine = {
  key: string;
  product: ProductResponse;
  sizeOptionId: UUID | null;
  sizeName: string | null;
  unitPrice: number;
  quantity: number;
};

/** Deterministic swatch so a product looks the same on every till, with no colour field in the API. */
function accentFor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) % 360;
  return `hsl(${hash}, 45%, 35%)`;
}

function ProductArtwork({
  accent,
  imageUrl,
  compact = false,
}: {
  accent: string;
  imageUrl?: string | null;
  compact?: boolean;
}) {
  return (
    <div
      className={cn("pos_product_artwork", compact && "is_compact")}
      style={
        imageUrl
          ? { backgroundImage: `url(${imageUrl})`, backgroundSize: "cover" }
          : { background: accent }
      }
    />
  );
}

function QuantityControl({
  quantity,
  variant,
  onIncrement,
  onDecrement,
}: {
  quantity: number;
  variant: "product" | "cart";
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  return (
    <div className={cn("pos_qty_control", variant === "cart" && "is_cart")}>
      <button type="button" aria-label="Decrease quantity" onClick={onDecrement}>
        <Minus />
      </button>
      <span>{quantity}</span>
      <button type="button" aria-label="Increase quantity" onClick={onIncrement}>
        <Plus />
      </button>
    </div>
  );
}

export default function PosView() {
  // Ringing up a sale is barista-only: SecurityConfig guards /api/barista/orders/** with
  // hasRole("BARISTA"), so an admin session would 403 on checkout. Products still load
  // (GET on products/categories allows both roles), so the catalogue stays browsable.
  const { isBarista, isLoading: isLoadingRole } = useCurrentRole();

  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [note, setNote] = useState("");
  const [pendingOrder, setPendingOrder] = useState<OrderResponse | null>(null);
  const confirmingRef = useRef(false);

  const { data: categoryPage } = useListCategoriesQuery({ page: 1, size: 100 });
  const {
    data: productPage,
    isFetching: isLoadingProducts,
    error: productError,
    refetch,
  } = useListProductsQuery({
    page: 1,
    size: 200,
    ...(activeCategory !== "All" ? { categoryId: activeCategory } : {}),
  });

  const [createOrder, { isLoading: isCreating }] = useCreateBaristaOrderMutation();
  const [payCash, { isLoading: isPaying }] = usePayOrderCashMutation();
  const [cancelOrder, { isLoading: isCancelling }] = useCancelBaristaOrderMutation();

  const categories = categoryPage?.content ?? [];

  const visibleProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (productPage?.content ?? []).filter((product) => {
      if (product.status !== "ACTIVE") return false;
      if (!term) return true;
      return (
        product.name.toLowerCase().includes(term) ||
        product.sku.toLowerCase().includes(term)
      );
    });
  }, [productPage, search]);

  const addToCart = (product: ProductResponse, sizeOptionId: UUID | null) => {
    if (pendingOrder || confirmingRef.current) {
      toast.error("Finish or cancel the current payment before changing the order.");
      return;
    }
    const quantity = cart.filter((line) => line.product.id === product.id).reduce((sum, line) => sum + line.quantity, 0);
    if (quantity + 1 > Number(product.quantityOnHand)) {
      toast.error(`${product.name} does not have enough stock`);
      return;
    }
    const sizeOption = product.sizeOptions.find((option) => option.id === sizeOptionId);
    const key = `${product.id}:${sizeOptionId ?? "base"}`;
    // finalPrice already accounts for an active discount; the size add-on sits on top.
    const unitPrice = Number(product.finalPrice) + Number(sizeOption?.priceDelta ?? 0);

    setCart((current) => {
      const existing = current.find((line) => line.key === key);
      if (existing) {
        return current.map((line) =>
          line.key === key ? { ...line, quantity: line.quantity + 1 } : line
        );
      }
      return [
        ...current,
        {
          key,
          product,
          sizeOptionId,
          sizeName: sizeOption?.name ?? null,
          unitPrice,
          quantity: 1,
        },
      ];
    });
  };

  const changeQuantity = (key: string, delta: number) => {
    if (pendingOrder || confirmingRef.current) return;
    const item = cart.find((line) => line.key === key);
    if (item && delta > 0) {
      const quantity = cart.filter((line) => line.product.id === item.product.id).reduce((sum, line) => sum + line.quantity, 0);
      if (quantity + delta > Number(item.product.quantityOnHand)) {
        toast.error(`${item.product.name} does not have enough stock`);
        return;
      }
    }
    setCart((current) =>
      current
        .map((line) =>
          line.key === key ? { ...line, quantity: line.quantity + delta } : line
        )
        .filter((line) => line.quantity > 0)
    );
  };

  const removeLine = (key: string) => {
    if (!pendingOrder && !confirmingRef.current) setCart((current) => current.filter((line) => line.key !== key));
  };

  const resetCart = () => {
    setPendingOrder(null);
    setCart([]);
    setNote("");
  };
  const clearCart = async () => {
    if (confirmingRef.current || isCancelling) return;
    try {
      if (pendingOrder) await cancelOrder(pendingOrder.id).unwrap();
      resetCart();
    } catch (error) {
      toast.error(apiErrorMessage(error as never, "Could not cancel the pending order. Check its payment status."));
    }
  };

  const itemCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  const total = cart.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);

  // Original (pre-discount) value, so the modal can show what the customer saved.
  const grossTotal = cart.reduce(
    (sum, line) =>
      sum +
      (Number(line.product.price) + (line.unitPrice - Number(line.product.finalPrice))) *
        line.quantity,
    0
  );
  const discount = Math.max(grossTotal - total, 0);

  const paymentItems: PosCartItem[] = cart.map((line) => ({
    id: line.key,
    name: line.sizeName ? `${line.product.name} (${line.sizeName})` : line.product.name,
    price: line.unitPrice * line.quantity,
    originalPrice: line.product.discountActive
      ? Number(line.product.price) * line.quantity
      : undefined,
    quantity: line.quantity,
    accent: accentFor(line.product.id),
  }));

  const handleConfirmPayment = async (amountTendered: number) => {
    if (cart.length === 0 || confirmingRef.current) return;
    confirmingRef.current = true;

    const items: OrderItemRequest[] = cart.map((line) => ({
      productId: line.product.id,
      quantity: line.quantity,
      ...(line.sizeOptionId ? { sizeOptionId: line.sizeOptionId } : {}),
    }));

    try {
      const order = pendingOrder ?? await createOrder({
        items,
        note: note.trim() || undefined,
      }).unwrap();
      setPendingOrder(order);

      const paid = await payCash({
        id: order.id,
        body: { amountTendered },
      }).unwrap();

      toast.success(
        Number(paid.changeDue) > 0
          ? `Sale complete. Change: $${Number(paid.changeDue).toFixed(2)}`
          : "Sale complete"
      );
      setPaymentOpen(false);
      resetCart();
    } catch (err) {
      // The order may already exist if only the payment leg failed — the queue will show it
      // as PENDING so it can be settled there rather than silently lost.
      toast.error(apiErrorMessage(err as never, "Could not complete the sale."));
    } finally {
      confirmingRef.current = false;
    }
  };

  return (
    <PageShell contentClassName="is_pos_page">
      <PageHeader
        title="POS"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Point of Sale" }]}
        rightSlot={<AdminTopActions />}
      />
      {pendingOrder && <div role="status" className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
        <p>Order #{pendingOrder.id.slice(0, 8)} is awaiting payment. Retry payment or clear the order to cancel it.</p>
        <button type="button" onClick={() => setPaymentOpen(true)} className="underline">Resume payment</button>
      </div>}

      {!isLoadingRole && !isBarista ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">Checkout is restricted to barista accounts.</p>
          <p className="mt-1 text-amber-800">
            The API guards order creation with the BARISTA role, so this till cannot complete a
            sale while you are signed in as an admin. Browse the catalogue here; to take
            payment on an existing order, use the Payments screen.
          </p>
        </div>
      ) : null}

      <div className="pos_layout">
        <section className="pos_catalog" aria-label="Product catalog">
          <div className="pos_catalog_toolbar">
            <div
              className="pos_category_selection"
              role="tablist"
              aria-label="Product categories"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeCategory === "All"}
                className={cn(activeCategory === "All" && "is_active")}
                onClick={() => setActiveCategory("All")}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  role="tab"
                  aria-selected={activeCategory === category.id}
                  className={cn(activeCategory === category.id && "is_active")}
                  onClick={() => setActiveCategory(category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div>

            <label className="pos_search">
              <Search />
              <input
                placeholder="Search product by name or SKU"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
          </div>

          <div className="pos_product_grid_scroll">
            {isLoadingProducts ? (
              <p className="flex items-center gap-2 p-8 text-sm text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading products...
              </p>
            ) : productError ? (
              <p className="p-8 text-sm text-red-600">
                {apiErrorMessage(productError as never, "Could not load products.")}{" "}
                <button type="button" onClick={refetch} className="underline">
                  Retry
                </button>
              </p>
            ) : visibleProducts.length === 0 ? (
              <p className="p-8 text-sm text-gray-400">
                No active products in this category.
              </p>
            ) : (
              <div className="pos_product_grid">
                {visibleProducts.map((product) => {
                  const inCart = cart
                    .filter((line) => line.product.id === product.id)
                    .reduce((sum, line) => sum + line.quantity, 0);
                  const outOfStock = Number(product.quantityOnHand) <= 0;
                  const discountPercent =
                    product.discountActive && product.discountType === "PERCENTAGE"
                      ? Number(product.discountValue)
                      : null;

                  return (
                    <article
                      key={product.id}
                      className={cn("pos_product_card", outOfStock && "opacity-50")}
                    >
                      <div className="pos_product_media">
                        <ProductArtwork
                          accent={accentFor(product.id)}
                          imageUrl={product.imageUrl}
                        />
                        {discountPercent ? (
                          <span className="pos_discount_badge">{discountPercent}% Off</span>
                        ) : null}
                      </div>
                      <div className="pos_product_content">
                        <div className="pos_product_details">
                          <div className="pos_product_title_row">
                            <h2>{product.name}</h2>
                            <strong>${Number(product.finalPrice).toFixed(2)}</strong>
                          </div>
                          <div className="pos_product_meta">
                            <span>In stock: {Number(product.quantityOnHand)}</span>
                            <span>{product.unit}</span>
                          </div>
                          {/* Sizes are separate cart lines, each with its own price add-on. */}
                          {product.sizeOptions.length > 0 ? (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {product.sizeOptions
                                .filter((option) => option.status === "ACTIVE")
                                .map((option) => (
                                  <button
                                    key={option.id}
                                    type="button"
                                    disabled={outOfStock}
                                    onClick={() => addToCart(product, option.id)}
                                    className="rounded border border-gray-300 px-2 py-0.5 text-xs hover:bg-gray-100 disabled:opacity-50"
                                  >
                                    {option.name}
                                    {Number(option.priceDelta) > 0
                                      ? ` +$${Number(option.priceDelta).toFixed(2)}`
                                      : ""}
                                  </button>
                                ))}
                            </div>
                          ) : null}
                        </div>
                        <QuantityControl
                          quantity={inCart}
                          variant="product"
                          onIncrement={() => {
                            if (outOfStock) {
                              toast.error(`${product.name} is out of stock`);
                              return;
                            }
                            addToCart(product, null);
                          }}
                          onDecrement={() => {
                            const line = [...cart]
                              .reverse()
                              .find((l) => l.product.id === product.id);
                            if (line) changeQuantity(line.key, -1);
                          }}
                        />
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <aside className="pos_order_panel" aria-label="Order summary">
          <div className="pos_order_header">
            <div>
              <h2>Order Summary</h2>
            </div>
            <div className="pos_order_header_actions">
              <button type="button" aria-label="Clear order" onClick={clearCart}>
                <X />
              </button>
            </div>
          </div>

          {/* CreateOrderRequest carries only items and a note — no dining option or table. */}
          <div className="pos_order_selects">
            <FormSelect
              label="Order note"
              value={note}
              onChange={(event) => { if (!pendingOrder && !confirmingRef.current) setNote(event.target.value); }}
              placeholder="No note"
            >
              <option value="Dine in">Dine in</option>
              <option value="Takeaway">Takeaway</option>
              <option value="Delivery">Delivery</option>
            </FormSelect>
          </div>

          <div className="pos_cart_list">
            {cart.length === 0 ? (
              <p className="p-6 text-center text-sm text-gray-400">
                Cart is empty. Tap a product to add it.
              </p>
            ) : (
              cart.map((line) => (
                <article key={line.key} className="pos_cart_item">
                  <ProductArtwork
                    accent={accentFor(line.product.id)}
                    imageUrl={line.product.imageUrl}
                    compact
                  />
                  <div className="pos_cart_item_content">
                    <h3>
                      {line.product.name}
                      {line.sizeName ? ` (${line.sizeName})` : ""}
                    </h3>
                    <div className="pos_cart_item_bottom">
                      <div className="pos_cart_price">
                        {line.product.discountActive ? (
                          <span className="is_struck">
                            ${Number(line.product.price).toFixed(2)}
                          </span>
                        ) : null}
                        <strong>${line.unitPrice.toFixed(2)}</strong>
                      </div>
                      <QuantityControl
                        quantity={line.quantity}
                        variant="cart"
                        onIncrement={() => changeQuantity(line.key, 1)}
                        onDecrement={() => changeQuantity(line.key, -1)}
                      />
                    </div>
                  </div>
                  <div className="pos_cart_item_actions">
                    <button
                      type="button"
                      className="pos_cart_action is_remove"
                      aria-label={`Remove ${line.product.name}`}
                      onClick={() => removeLine(line.key)}
                    >
                      <X />
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>

          <dl className="pos_order_totals">
            <dt>Subtotal:</dt>
            <dd>
              ${grossTotal.toFixed(2)} - {itemCount} {itemCount === 1 ? "Item" : "Items"}
            </dd>
            <dt>Total Discount:</dt>
            <dd>${discount.toFixed(2)}</dd>
            <dt className="is_grand_total">Grand Total:</dt>
            <dd className="is_grand_total">${total.toFixed(2)}</dd>
          </dl>

          <div className="pos_order_ctas">
            <button
              type="button"
              className="btn_outline_black"
              onClick={clearCart}
              disabled={cart.length === 0}
            >
              <ShoppingBag />
              Clear
            </button>
            <button
              type="button"
              className="btn_primary_yellow"
              onClick={() => setPaymentOpen(true)}
              disabled={cart.length === 0 || !isBarista}
            >
              Make a Payment
              <span aria-hidden className="pos_cta_arrow">
                →
              </span>
            </button>
          </div>
        </aside>
      </div>

      <PosPaymentModal
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        items={paymentItems}
        total={Number(pendingOrder?.totalAmount ?? total)}
        orderTable={note || "Walk-in"}
        orderId={pendingOrder ? `#${pendingOrder.id.slice(0, 8)}` : `${itemCount} item${itemCount === 1 ? "" : "s"}`}
        onConfirm={handleConfirmPayment}
        isLoading={isCreating || isPaying}
      />
    </PageShell>
  );
}
