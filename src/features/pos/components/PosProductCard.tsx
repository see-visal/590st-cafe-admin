"use client";

import { memo, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { Coffee, Minus, Plus } from "lucide-react";
import type { ProductResponse, ProductVariantResponse } from "@/store/api/types";
import { cn, humanise, titleCase } from "@/lib/utils";
import { useI18n } from "@/contexts/I18nContext";

// How much of one product is already in the order, in total and per size.
export type CartCounts = { total: number; byVariant: Readonly<Record<string, number>> };

// Shared by every product that isn't in the order, so those cards skip re-rendering when the cart changes.
export const EMPTY_CART_COUNTS: CartCounts = { total: 0, byVariant: {} };

const money = (value: number) => `$${value.toFixed(2)}`;

function ProductImage({ src }: { src: string | null }) {
  // A broken image link falls back to the placeholder instead of an empty box.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const image = src && src !== failedSrc ? src : null;
  return image ? (
    <Image
      src={image}
      alt=""
      fill
      sizes="(max-width: 520px) 50vw, 240px"
      className="pos_product_img"
      onError={() => setFailedSrc(image)}
    />
  ) : (
    <Coffee aria-hidden className="pos_product_placeholder" strokeWidth={1.5} />
  );
}

export const PosProductCard = memo(function PosProductCard({
  product,
  counts,
  onAdd,
  onDecrease,
}: {
  product: ProductResponse;
  counts: CartCounts;
  onAdd: (product: ProductResponse, variant: ProductVariantResponse) => void;
  onDecrease: (product: ProductResponse) => void;
}) {
  const { t } = useI18n();
  const name = titleCase(product.name);
  const stock = Number(product.quantityOnHand);
  const outOfStock = stock <= 0;
  const lowStock = !outOfStock && stock <= Number(product.reorderLevel);
  const stockUnit = humanise(product.stockUnit);
  const inCart = counts.total;

  const activeVariants = product.variants
    .filter((v) => v.status === "ACTIVE")
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const onlyVariant = activeVariants.length === 1 ? activeVariants[0] : null;
  const prices = activeVariants.map((v) => Number(v.finalPrice));
  const lowest = Math.min(...prices);
  const highest = Math.max(...prices);
  const priceLabel = prices.length > 1 && lowest !== highest ? `${money(lowest)}–${money(highest)}` : money(prices[0] ?? 0);
  const originalPrice =
    onlyVariant && Number(onlyVariant.price) > Number(onlyVariant.finalPrice) ? Number(onlyVariant.price) : null;
  const discountLabel =
    !product.discountActive || product.discountValue == null
      ? null
      : product.discountType === "PERCENTAGE"
        ? t("pos.product.discount_off", "{amount} off", { amount: `${Number(product.discountValue)}%` })
        : t("pos.product.discount_off", "{amount} off", { amount: money(Number(product.discountValue)) });

  // Tapping the photo is the quick way to ring up one more; the Add/+ button below does the same for keyboards.
  const addFromPhoto = () => {
    if (outOfStock) {
      toast.error(t("pos.toast.out_of_stock", "{name} is out of stock.", { name: product.name }));
      return;
    }
    if (onlyVariant) onAdd(product, onlyVariant);
  };

  return (
    <article className={cn("pos_product_card", inCart > 0 && "is_in_cart", outOfStock && "is_out_of_stock")}>
      <div className={cn("pos_product_media", onlyVariant && "is_tappable")} onClick={onlyVariant ? addFromPhoto : undefined}>
        <ProductImage src={product.imageUrl} />
        {discountLabel ? <span className="pos_product_discount">{discountLabel}</span> : null}
        {inCart > 0 ? (
          // Keyed by the count so the badge pops each time the quantity changes.
          <span key={inCart} className="pos_product_in_cart" aria-hidden>
            {inCart}
          </span>
        ) : null}
      </div>

      <div className="pos_product_body">
        <h2 className="pos_product_name" title={name}>
          {name}
        </h2>
        <p className="pos_product_price">
          <strong>{priceLabel}</strong>
          {originalPrice !== null ? <s>{money(originalPrice)}</s> : null}
          <span>{t("pos.product.per_unit", "per {unit}", { unit: humanise(product.sellUnit) })}</span>
        </p>
        <p className={cn("pos_product_stock", lowStock && "is_low", outOfStock && "is_out")}>
          {outOfStock
            ? t("pos.product.out_of_stock", "Out of stock")
            : lowStock
              ? t("pos.product.low_stock", "Low stock · {count} {unit}", { count: stock, unit: stockUnit })
              : t("pos.product.stock", "{count} {unit} in stock", { count: stock, unit: stockUnit })}
        </p>

        <div className="pos_product_action">
          {onlyVariant ? (
            <div
              role="group"
              aria-label={t("pos.product.quantity_of", "Quantity of {name}", { name })}
              className={cn("pos_product_stepper", inCart === 0 && "is_empty")}
            >
              {inCart > 0 && (
                <button type="button" aria-label={t("pos.quantity.decrease", "Decrease quantity")} onClick={() => onDecrease(product)}>
                  <Minus aria-hidden />
                </button>
              )}
              {inCart > 0 && <span aria-live="polite">{inCart}</span>}
              {/* Stays the same element from "Add" to "+", so keyboard focus survives the first tap. */}
              <button
                type="button"
                className="is_add"
                disabled={outOfStock}
                aria-label={
                  inCart > 0
                    ? t("pos.quantity.increase", "Increase quantity")
                    : outOfStock
                      ? undefined
                      : t("pos.product.add_to_order", "Add {name} to the order", { name })
                }
                onClick={() => onAdd(product, onlyVariant)}
              >
                {inCart === 0 && outOfStock ? (
                  t("pos.product.out_of_stock", "Out of stock")
                ) : (
                  <>
                    <Plus aria-hidden />
                    {inCart === 0 ? t("pos.product.add", "Add") : null}
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="pos_product_variants">
              {activeVariants.map((variant) => {
                const count = counts.byVariant[variant.id] ?? 0;
                return (
                  <button
                    key={variant.id}
                    type="button"
                    disabled={outOfStock}
                    onClick={() => onAdd(product, variant)}
                    className={cn("pos_product_variant", count > 0 && "is_selected")}
                    aria-label={t("pos.product.add_variant", "Add {variant} {name}, {price}", {
                      variant: humanise(variant.name),
                      name,
                      price: money(Number(variant.finalPrice)),
                    })}
                  >
                    <span>{humanise(variant.name)}</span>
                    <b>{money(Number(variant.finalPrice))}</b>
                    {count > 0 ? (
                      <span key={count} className="pos_product_variant_count" aria-hidden>
                        {count}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </article>
  );
});
