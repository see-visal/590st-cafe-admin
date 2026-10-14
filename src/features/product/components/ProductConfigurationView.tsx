"use client";

import { useCallback, useState, type ChangeEvent, type FormEvent } from "react";
import toast from "react-hot-toast";
import { PageShell } from "@/components/common/PageShell";
import { PageHeader } from "@/components/common/PageHeader";
import { AdminTopActions, DataCard, FormInput, FormSelect, MoneyField, Thumbnail } from "@/components/common/AdminKit";
import { MoneyInput } from "@/components/forms/MoneyInput";
import { formatAmount } from "@/lib/moneyInput";
import { apiErrorMessage } from "@/store/api/baseApi";
import { useI18n } from "@/contexts/I18nContext";
import {
  useAttachProductExtraMutation, useClearProductDiscountMutation, useCreateVariantMutation,
  useDeleteVariantMutation, useDetachProductExtraMutation, useGetProductQuery, useListProductExtrasQuery,
  useListVariantsQuery, useSetProductDiscountMutation, useUpdateProductExtraMutation, useUpdateVariantMutation,
} from "@/store/api/productApi";
import {
  useCreateExtraMutation, useDeleteExtraMutation, useListExtrasQuery, useRemoveExtraImageMutation,
  useUpdateExtraMutation, useUploadExtraImageMutation,
} from "@/store/api/extraApi";
import type {
  DiscountType, ExtraResponse, ProductExtraResponse, ProductResponse, ProductVariantResponse, VariantLabel,
} from "@/store/api/types";
import { humanise, productPriceLabel, titleCase } from "@/lib/utils";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { useCatalogAlerts } from "@/hooks/useCatalogAlerts";
import { parseForm } from "@/lib/validation";
import { attachExtraSchema, discountSchema, extraSchema, variantSchema } from "@/lib/formSchemas";

const inputClass = "mt-1 block w-full rounded border px-3 py-2 text-sm";
const discountTypes: Record<DiscountType, string> = { PERCENTAGE: "Percentage", FIXED: "Amount in USD" };
const VARIANT_LABELS: VariantLabel[] = ["MEDIUM", "LARGE", "PIECE"];

function DiscountForm({ product }: { product: ProductResponse }) {
  const { t } = useI18n();
  const [type, setType] = useState<DiscountType>(product.discountType ?? "PERCENTAGE");
  const [value, setValue] = useState(formatAmount(String(product.discountValue ?? ""), 2));
  const [start, setStart] = useState(product.discountStartAt?.slice(0, 16) ?? "");
  const [end, setEnd] = useState(product.discountEndAt?.slice(0, 16) ?? "");
  const [save, saveState] = useSetProductDiscountMutation();
  const [clear, clearState] = useClearProductDiscountMutation();
  const busy = saveState.isLoading || clearState.isLoading;

  async function submit(event: FormEvent) {
    event.preventDefault();
    const parsed = parseForm(discountSchema(type), { value, start, end });
    if (!parsed) return;
    try {
      await save({ id: product.id, body: { discountType: type, discountValue: parsed.value,
        ...(start ? { discountStartAt: `${start}:00` } : {}), ...(end ? { discountEndAt: `${end}:00` } : {}),
      } }).unwrap();
      toast.success(t("products.config.toast.discount_saved", "Product discount saved"));
    } catch (error) { toast.error(apiErrorMessage(error as never, t("products.config.errors.save_discount", "Could not save discount."))); }
  }

  async function remove() {
    try { await clear(product.id).unwrap(); toast.success(t("products.config.toast.discount_removed", "Discount removed")); }
    catch (error) { toast.error(apiErrorMessage(error as never, t("products.config.errors.remove_discount", "Could not remove discount."))); }
  }

  return <form onSubmit={submit} className="space-y-4 p-2">
    <p className="text-sm">{t("products.config.discount.current_price", "Current price: {price}. Discount applies on top of each variant's own price.", { price: productPriceLabel(product.variants) })}</p>
    <p className="text-sm text-muted-foreground">{product.discountType ? product.discountActive ? t("products.config.discount.active", "Discount is active.") : t("products.config.discount.scheduled_or_expired", "Discount is scheduled or expired.") : t("products.config.discount.none_set", "No discount is set.")} {t("products.config.discount.times_note", "Times use Cambodia time.")}</p>
    <div className="grid gap-4 md:grid-cols-2">
      <FormSelect label={t("products.config.discount.type", "Discount type")} value={type} onChange={(event) => setType(event.target.value as DiscountType)}>
        {Object.entries(discountTypes).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </FormSelect>
      <MoneyField label={type === "PERCENTAGE" ? t("products.config.discount.percentage_off", "Percentage off") : t("products.config.discount.usd_off", "USD off")} symbol={type === "PERCENTAGE" ? "%" : "$"} required value={value} onValueChange={setValue} />
      <FormInput label={t("products.config.discount.starts_at", "Starts at (optional)")} type="datetime-local" value={start} onChange={(event) => setStart(event.target.value)} />
      <FormInput label={t("products.config.discount.ends_at", "Ends at (optional)")} type="datetime-local" value={end} onChange={(event) => setEnd(event.target.value)} />
    </div>
    <div className="flex gap-3"><button className="btn_primary_black" disabled={busy}>{busy ? t("states.saving", "Saving...") : t("products.config.discount.save", "Save discount")}</button>
      {product.discountType && <button className="btn_outline_black" type="button" disabled={busy} onClick={remove}>{t("products.config.discount.remove", "Remove discount")}</button>}</div>
  </form>;
}

function VariantForm({ productId, variant, takenLabels }: { productId: string; variant?: ProductVariantResponse; takenLabels: VariantLabel[] }) {
  const { t } = useI18n();
  const { confirm, confirmDialog } = useConfirmDialog();
  const [name, setName] = useState<VariantLabel>(variant?.name ?? VARIANT_LABELS.find((l) => !takenLabels.includes(l)) ?? "MEDIUM");
  const [price, setPrice] = useState(formatAmount(String(variant?.price ?? ""), 2));
  const [sortOrder, setSortOrder] = useState(String(variant?.sortOrder ?? 0));
  const [create, createState] = useCreateVariantMutation();
  const [update, updateState] = useUpdateVariantMutation();
  const [remove, removeState] = useDeleteVariantMutation();
  const busy = createState.isLoading || updateState.isLoading || removeState.isLoading;

  async function submit(event: FormEvent) {
    event.preventDefault();
    const parsed = parseForm(variantSchema, { price, sortOrder });
    if (!parsed) return;
    const body = { name, price: parsed.price, sortOrder: parsed.sortOrder ?? 0 };
    try {
      if (variant) await update({ productId, id: variant.id, body }).unwrap();
      else { await create({ productId, body }).unwrap(); setPrice(""); setSortOrder("0"); }
      toast.success(t("products.config.toast.variant_saved", "Variant saved"));
    } catch (error) { toast.error(apiErrorMessage(error as never, t("products.config.errors.save_variant", "Could not save variant."))); }
  }
  async function toggleStatus() {
    if (!variant) return;
    try { await update({ productId, id: variant.id, body: { status: variant.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" } }).unwrap(); toast.success(t("products.config.toast.variant_status_updated", "Variant status updated")); }
    catch (error) { toast.error(apiErrorMessage(error as never, t("products.config.errors.update_variant", "Could not update variant."))); }
  }
  async function deleteVariant() {
    if (!variant) return;
    if (!(await confirm({ title: t("products.config.confirm.delete_variant_title", "Delete variant"), description: t("products.config.confirm.delete_variant_description", "Delete the {name} variant?", { name: humanise(variant.name) }), confirmLabel: t("actions.delete", "Delete"), tone: "danger" }))) return;
    try { await remove({ productId, id: variant.id }).unwrap(); toast.success(t("products.config.toast.variant_deleted", "Variant deleted")); }
    catch (error) { toast.error(apiErrorMessage(error as never, t("products.config.errors.delete_variant", "Could not delete variant."))); }
  }

  return <form onSubmit={submit} className="space-y-3 rounded-lg border p-4">
    <h3 className="font-semibold">{variant ? `${humanise(variant.name)} (${variant.status.toLowerCase()})` : t("products.config.variant.add_title", "Add a variant")}</h3>
    <div className="grid gap-3 md:grid-cols-3">
      <FormSelect label={t("products.fields.variant", "Variant")} value={name} onChange={(event) => setName(event.target.value as VariantLabel)} disabled={Boolean(variant)}>
        {VARIANT_LABELS.map((label) => <option key={label} value={label}>{humanise(label)}</option>)}
      </FormSelect>
      <label className="text-sm">{t("products.config.price_usd", "Price (USD)")}<MoneyInput wrapperClassName="mt-1" className={inputClass} required value={price} onValueChange={setPrice} /></label>
      <label className="text-sm">{t("products.config.variant.display_order", "Display order")}<input className={inputClass} required type="number" step="1" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} /></label>
    </div>
    <div className="flex flex-wrap gap-3"><button className="btn_primary_black" disabled={busy}>{busy ? t("states.saving", "Saving...") : variant ? t("products.config.variant.save", "Save variant") : t("products.config.variant.add", "Add variant")}</button>
      {variant && <><button className="btn_outline_black" type="button" disabled={busy} onClick={toggleStatus}>{variant.status === "ACTIVE" ? t("products.config.variant.disable", "Disable") : t("products.config.variant.enable", "Enable")}</button>
        <button className="btn_outline_black" type="button" disabled={busy} onClick={deleteVariant}>{t("actions.delete", "Delete")}</button></>}
    </div>
    {confirmDialog}
  </form>;
}

function ExtraCatalogForm({ extra }: { extra?: ExtraResponse }) {
  const { t } = useI18n();
  const { confirm, confirmDialog } = useConfirmDialog();
  const [name, setName] = useState(extra?.name ?? "");
  const [price, setPrice] = useState(formatAmount(String(extra?.price ?? ""), 2));
  const [tracked, setTracked] = useState(extra?.quantityOnHand != null);
  const [quantityOnHand, setQuantityOnHand] = useState(String(extra?.quantityOnHand ?? ""));
  const [create, createState] = useCreateExtraMutation();
  const [update, updateState] = useUpdateExtraMutation();
  const [remove, removeState] = useDeleteExtraMutation();
  const [uploadImage, uploadState] = useUploadExtraImageMutation();
  const [removeImage, removeImageState] = useRemoveExtraImageMutation();
  const busy = createState.isLoading || updateState.isLoading || removeState.isLoading;
  const imageBusy = uploadState.isLoading || removeImageState.isLoading;

  async function submit(event: FormEvent) {
    event.preventDefault();
    const parsed = parseForm(extraSchema, { name, price, quantityOnHand: tracked ? quantityOnHand : "" });
    if (!parsed) return;
    const body = { name: parsed.name, price: parsed.price, quantityOnHand: parsed.quantityOnHand };
    try {
      if (extra) await update({ id: extra.id, body }).unwrap();
      else { await create(body).unwrap(); setName(""); setPrice(""); setQuantityOnHand(""); }
      toast.success(t("products.config.toast.extra_saved", "Extra saved"));
    } catch (error) { toast.error(apiErrorMessage(error as never, t("products.config.errors.save_extra", "Could not save extra."))); }
  }
  async function deleteExtra() {
    if (!extra) return;
    if (!(await confirm({ title: t("products.config.confirm.delete_extra_title", "Delete extra"), description: t("products.config.confirm.delete_extra_description", "Delete \"{name}\" from the extras catalog?", { name: titleCase(extra.name) }), confirmLabel: t("actions.delete", "Delete"), tone: "danger" }))) return;
    try { await remove(extra.id).unwrap(); toast.success(t("products.config.toast.extra_deleted", "Extra deleted")); }
    catch (error) { toast.error(apiErrorMessage(error as never, t("products.config.errors.delete_extra", "Could not delete extra — it may still be offered on a product."))); }
  }
  async function handleImagePick(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !extra) return;
    try { await uploadImage({ id: extra.id, file }).unwrap(); toast.success(t("products.config.toast.extra_photo_updated", "Extra photo updated")); }
    catch (error) { toast.error(apiErrorMessage(error as never, t("products.config.errors.upload_photo", "Could not upload the photo."))); }
  }
  async function handleRemoveImage() {
    if (!extra) return;
    try { await removeImage(extra.id).unwrap(); toast.success(t("products.config.toast.extra_photo_removed", "Extra photo removed")); }
    catch (error) { toast.error(apiErrorMessage(error as never, t("products.config.errors.remove_photo", "Could not remove the photo."))); }
  }

  return <form onSubmit={submit} className="space-y-3 rounded-lg border p-4">
    <h3 className="font-semibold">{extra ? titleCase(extra.name) : t("products.config.extra.add_title", "Add an extra")}</h3>
    <div className="grid gap-3 md:grid-cols-3">
      <label className="text-sm">{t("fields.name", "Name")}<input className={inputClass} required value={name} onChange={(event) => setName(event.target.value)} /></label>
      <label className="text-sm">{t("products.config.price_usd", "Price (USD)")}<MoneyInput wrapperClassName="mt-1" className={inputClass} required value={price} onValueChange={setPrice} /></label>
      <label className="text-sm">
        <span className="mt-1 flex items-center gap-2">
          <input type="checkbox" checked={tracked} onChange={(event) => setTracked(event.target.checked)} /> {t("products.config.extra.track_stock", "Track stock")}
        </span>
        {tracked && <input className={inputClass} type="number" min="0" step="1" placeholder={t("products.config.extra.quantity_on_hand", "Quantity on hand")} value={quantityOnHand} onChange={(event) => setQuantityOnHand(event.target.value)} />}
      </label>
    </div>
    <div className="flex items-center gap-3">
      <Thumbnail src={extra?.imageUrl} kind="product" />
      {extra ? (
        <div className="flex flex-wrap items-center gap-2">
          <label className="btn_outline_black cursor-pointer text-xs">
            {imageBusy ? t("states.working", "Working...") : extra.imageUrl ? t("products.config.extra.change_photo", "Change photo") : t("products.config.extra.add_photo", "Add photo")}
            <input type="file" accept="image/*" className="hidden" disabled={imageBusy} onChange={handleImagePick} />
          </label>
          {extra.imageUrl && (
            <button type="button" className="text-xs text-red-600 underline" disabled={imageBusy} onClick={handleRemoveImage}>
              {t("products.config.extra.remove_photo", "Remove photo")}
            </button>
          )}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">{t("products.config.extra.save_first", "Save the extra first, then you can add a photo.")}</p>
      )}
    </div>
    <div className="flex flex-wrap gap-3"><button className="btn_primary_black" disabled={busy}>{busy ? t("states.saving", "Saving...") : extra ? t("products.config.extra.save", "Save extra") : t("products.config.extra.add", "Add extra")}</button>
      {extra && <button className="btn_outline_black" type="button" disabled={busy} onClick={deleteExtra}>{t("actions.delete", "Delete")}</button>}
    </div>
    {confirmDialog}
  </form>;
}

function ProductExtraRow({ productId, productExtra }: { productId: string; productExtra: ProductExtraResponse }) {
  const { t } = useI18n();
  const { confirm, confirmDialog } = useConfirmDialog();
  const [update, updateState] = useUpdateProductExtraMutation();
  const [detach, detachState] = useDetachProductExtraMutation();
  const busy = updateState.isLoading || detachState.isLoading;

  async function toggleStatus() {
    try {
      await update({ productId, id: productExtra.id, body: { status: productExtra.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" } }).unwrap();
      toast.success(t("products.config.toast.updated", "Updated"));
    } catch (error) { toast.error(apiErrorMessage(error as never, t("products.config.errors.update", "Could not update."))); }
  }
  async function remove() {
    if (!(await confirm({ title: t("products.config.confirm.remove_extra_title", "Remove extra"), description: t("products.config.confirm.remove_extra_description", "Stop offering \"{name}\" on this product?", { name: titleCase(productExtra.name) }), confirmLabel: t("actions.remove", "Remove"), tone: "danger" }))) return;
    try { await detach({ productId, id: productExtra.id }).unwrap(); toast.success(t("products.config.toast.extra_detached", "Extra removed from this product")); }
    catch (error) { toast.error(apiErrorMessage(error as never, t("products.config.errors.remove_extra", "Could not remove extra."))); }
  }

  return <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
    <div className="flex items-center gap-3">
      <Thumbnail src={productExtra.imageUrl} kind="product" />
      <div>
        <p className="font-semibold">{titleCase(productExtra.name)} — ${Number(productExtra.price).toFixed(2)}</p>
        <p className="text-xs text-muted-foreground">{productExtra.status === "ACTIVE" ? t("products.config.extra.offered_on_product", "Offered on this product") : t("products.config.extra.hidden_on_product", "Hidden on this product")}</p>
      </div>
    </div>
    <div className="flex gap-3">
      <button className="btn_outline_black" type="button" disabled={busy} onClick={toggleStatus}>{productExtra.status === "ACTIVE" ? t("products.config.extra.hide", "Hide") : t("products.config.extra.offer", "Offer")}</button>
      <button className="btn_outline_black" type="button" disabled={busy} onClick={remove}>{t("actions.remove", "Remove")}</button>
    </div>
    {confirmDialog}
  </div>;
}

function ExtrasSection({ productId }: { productId: string }) {
  const { t } = useI18n();
  const catalog = useListExtrasQuery();
  const offered = useListProductExtrasQuery(productId);
  const [attach, attachState] = useAttachProductExtraMutation();
  const [selectedExtraId, setSelectedExtraId] = useState("");

  useCatalogAlerts(
    useCallback(() => {
      void catalog.refetch();
      void offered.refetch();
    }, [catalog, offered])
  );

  const offeredIds = new Set((offered.data ?? []).map((e) => e.extraId));
  const attachable = (catalog.data ?? []).filter((e) => e.status === "ACTIVE" && !offeredIds.has(e.id));

  async function handleAttach(event: FormEvent) {
    event.preventDefault();
    const parsed = parseForm(attachExtraSchema, { extraId: selectedExtraId });
    if (!parsed) return;
    try {
      await attach({ productId, body: { extraId: parsed.extraId } }).unwrap();
      toast.success(t("products.config.toast.extra_offered", "Extra offered on this product"));
      setSelectedExtraId("");
    } catch (error) { toast.error(apiErrorMessage(error as never, t("products.config.errors.offer_extra", "Could not offer this extra."))); }
  }

  return <DataCard title={t("products.config.extras_on_product.title", "Extras on this product")} meta={t("products.config.extras_on_product.meta", "Add-ons (e.g. Pearl) a customer can add to this product.")}>
    <div className="space-y-4 p-2">
      {offered.isLoading ? <p role="status">{t("products.config.extras_on_product.loading", "Loading extras...")}</p> : offered.error ? <div role="alert">{apiErrorMessage(offered.error as never)} <button className="underline" onClick={() => offered.refetch()}>{t("actions.retry", "Retry")}</button></div> : <>
        {!offered.data?.length && <p className="text-sm text-muted-foreground">{t("products.config.extras_on_product.empty", "No extras offered on this product yet.")}</p>}
        {offered.data?.map((productExtra) => <ProductExtraRow key={productExtra.id} productId={productId} productExtra={productExtra} />)}
      </>}
      <form onSubmit={handleAttach} className="flex flex-wrap items-end gap-3 rounded-lg border p-4">
        <FormSelect label={t("products.config.extras_on_product.offer_label", "Offer an extra")} placeholder={t("products.config.extras_on_product.offer_placeholder", "Select an extra")} value={selectedExtraId} onChange={(event) => setSelectedExtraId(event.target.value)}>
          {attachable.map((extra) => <option key={extra.id} value={extra.id}>{titleCase(extra.name)} — ${Number(extra.price).toFixed(2)}</option>)}
        </FormSelect>
        <button className="btn_primary_black" disabled={attachState.isLoading || !attachable.length}>{attachState.isLoading ? t("products.config.extras_on_product.adding", "Adding...") : t("products.config.extras_on_product.offer_submit", "Offer on this product")}</button>
        {!catalog.data?.length && <p className="text-sm text-muted-foreground">{t("products.config.extras_on_product.no_catalog", "No extras exist yet — add one to the shop-wide catalog below first.")}</p>}
      </form>
    </div>
  </DataCard>;
}

export default function ProductConfigurationView({ productId }: { productId: string }) {
  const { t } = useI18n();
  const product = useGetProductQuery(productId);
  const variants = useListVariantsQuery(productId);
  const extraCatalog = useListExtrasQuery();
  const takenLabels = (variants.data ?? []).map((v) => v.name);

  useCatalogAlerts(
    useCallback(() => {
      void product.refetch();
      void variants.refetch();
      void extraCatalog.refetch();
    }, [product, variants, extraCatalog])
  );

  return <PageShell>
    <PageHeader title={product.data?.name ? titleCase(product.data.name) : t("products.config.title", "Product settings")} breadcrumbs={[{ label: t("breadcrumb.home", "Home"), href: "/" }, { label: t("products.breadcrumb.products", "Products"), href: "/products" }, { label: t("products.config.breadcrumb", "Variants and discount") }]} rightSlot={<AdminTopActions />} />
    {product.isLoading ? <p role="status">{t("products.config.loading_product", "Loading product...")}</p> : product.error ? <div role="alert">{apiErrorMessage(product.error as never)} <button className="underline" onClick={() => product.refetch()}>{t("actions.retry", "Retry")}</button></div> : product.data && <>
      <DataCard title={t("products.config.discount.title", "Product discount")}><DiscountForm key={JSON.stringify([product.data.id, product.data.discountType, product.data.discountValue, product.data.discountStartAt, product.data.discountEndAt])} product={product.data} /></DataCard>
      <DataCard title={t("products.fields.variants", "Variants")} meta={t("products.config.variants.meta", "Every product needs at least one variant to have a price.")}>
        <div className="space-y-4 p-2">
          {variants.isLoading ? <p role="status">{t("products.config.variants.loading", "Loading variants...")}</p> : variants.error ? <div role="alert">{apiErrorMessage(variants.error as never)} <button className="underline" onClick={() => variants.refetch()}>{t("actions.retry", "Retry")}</button></div> : <>
            {!variants.data?.length && <p className="text-sm text-muted-foreground">{t("products.config.variants.empty", "No variants yet — this product has no price until you add one.")}</p>}
            {variants.data?.map((variant) => <VariantForm key={variant.id} productId={productId} variant={variant} takenLabels={takenLabels} />)}
            {takenLabels.length < VARIANT_LABELS.length && <VariantForm productId={productId} takenLabels={takenLabels} />}
          </>}
        </div>
      </DataCard>
      <ExtrasSection productId={productId} />
      <DataCard title={t("products.config.catalog.title", "Extras catalog")} meta={t("products.config.catalog.meta", "The shop-wide add-ons that any product can offer.")}>
        <div className="space-y-4 p-2">
          {extraCatalog.isLoading ? <p role="status">{t("products.config.catalog.loading", "Loading extras catalog...")}</p> : extraCatalog.error ? <div role="alert">{apiErrorMessage(extraCatalog.error as never)} <button className="underline" onClick={() => extraCatalog.refetch()}>{t("actions.retry", "Retry")}</button></div> : <>
            {!extraCatalog.data?.length && <p className="text-sm text-muted-foreground">{t("products.config.catalog.empty", "No extras have been added yet.")}</p>}
            {extraCatalog.data?.map((extra) => <ExtraCatalogForm key={extra.id} extra={extra} />)}
            <ExtraCatalogForm />
          </>}
        </div>
      </DataCard>
    </>}
  </PageShell>;
}
