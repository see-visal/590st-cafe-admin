"use client";

import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { PageShell } from "@/components/common/PageShell";
import { PageHeader } from "@/components/common/PageHeader";
import { AdminTopActions, DataCard } from "@/components/common/AdminKit";
import { apiErrorMessage } from "@/store/api/baseApi";
import {
  useClearProductDiscountMutation, useCreateSizeOptionMutation, useDeleteSizeOptionMutation,
  useGetProductQuery, useListSizeOptionsQuery, useSetProductDiscountMutation, useUpdateSizeOptionMutation,
} from "@/store/api/productApi";
import type { DiscountType, ProductResponse, ProductSizeOptionResponse } from "@/store/api/types";

const inputClass = "mt-1 block w-full rounded border px-3 py-2 text-sm";
const discountTypes: Record<DiscountType, string> = { PERCENTAGE: "Percentage", FIXED: "Amount in USD" };

function DiscountForm({ product }: { product: ProductResponse }) {
  const [type, setType] = useState<DiscountType>(product.discountType ?? "PERCENTAGE");
  const [value, setValue] = useState(String(product.discountValue ?? ""));
  const [start, setStart] = useState(product.discountStartAt?.slice(0, 16) ?? "");
  const [end, setEnd] = useState(product.discountEndAt?.slice(0, 16) ?? "");
  const [save, saveState] = useSetProductDiscountMutation();
  const [clear, clearState] = useClearProductDiscountMutation();
  const busy = saveState.isLoading || clearState.isLoading;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (start && end && end <= start) { toast.error("End time must be after start time."); return; }
    try {
      await save({ id: product.id, body: { discountType: type, discountValue: Number(value),
        ...(start ? { discountStartAt: `${start}:00` } : {}), ...(end ? { discountEndAt: `${end}:00` } : {}),
      } }).unwrap();
      toast.success("Product discount saved");
    } catch (error) { toast.error(apiErrorMessage(error as never, "Could not save discount.")); }
  }

  async function remove() {
    try { await clear(product.id).unwrap(); toast.success("Discount removed"); }
    catch (error) { toast.error(apiErrorMessage(error as never, "Could not remove discount.")); }
  }

  return <form onSubmit={submit} className="space-y-4 p-2">
    <p className="text-sm">Base price: ${Number(product.price).toFixed(2)}. Current price: ${Number(product.finalPrice).toFixed(2)}.</p>
    <p className="text-sm text-muted-foreground">{product.discountType ? product.discountActive ? "Discount is active." : "Discount is scheduled or expired." : "No discount is set."} Times use Cambodia time.</p>
    <div className="grid gap-4 md:grid-cols-2">
      <label className="text-sm">Discount type<select className={inputClass} value={type} onChange={(event) => setType(event.target.value as DiscountType)}>
        {Object.entries(discountTypes).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select></label>
      <label className="text-sm">{type === "PERCENTAGE" ? "Percentage off" : "USD off"}<input className={inputClass} type="number" min="0.01" step="0.01" max={type === "PERCENTAGE" ? 100 : undefined} required value={value} onChange={(event) => setValue(event.target.value)} /></label>
      <label className="text-sm">Starts at (optional)<input className={inputClass} type="datetime-local" value={start} onChange={(event) => setStart(event.target.value)} /></label>
      <label className="text-sm">Ends at (optional)<input className={inputClass} type="datetime-local" value={end} onChange={(event) => setEnd(event.target.value)} /></label>
    </div>
    <div className="flex gap-3"><button className="btn_primary_black" disabled={busy}>{busy ? "Saving..." : "Save discount"}</button>
      {product.discountType && <button className="btn_outline_black" type="button" disabled={busy} onClick={remove}>Remove discount</button>}</div>
  </form>;
}

function SizeForm({ productId, option }: { productId: string; option?: ProductSizeOptionResponse }) {
  const [name, setName] = useState(option?.name ?? "");
  const [price, setPrice] = useState(String(option?.priceDelta ?? 0));
  const [sortOrder, setSortOrder] = useState(String(option?.sortOrder ?? 0));
  const [create, createState] = useCreateSizeOptionMutation();
  const [update, updateState] = useUpdateSizeOptionMutation();
  const [remove, removeState] = useDeleteSizeOptionMutation();
  const busy = createState.isLoading || updateState.isLoading || removeState.isLoading;
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) { toast.error("Enter a size name."); return; }
    const body = { name: name.trim(), priceDelta: Number(price), sortOrder: Number(sortOrder) };
    try {
      if (option) await update({ productId, id: option.id, body }).unwrap();
      else { await create({ productId, body }).unwrap(); setName(""); setPrice("0"); setSortOrder("0"); }
      toast.success("Size saved");
    } catch (error) { toast.error(apiErrorMessage(error as never, "Could not save size.")); }
  }
  async function toggleStatus() {
    if (!option) return;
    try { await update({ productId, id: option.id, body: { status: option.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" } }).unwrap(); toast.success("Size status updated"); }
    catch (error) { toast.error(apiErrorMessage(error as never, "Could not update size.")); }
  }
  async function deleteSize() {
    if (!option || !window.confirm(`Delete size "${option.name}"?`)) return;
    try { await remove({ productId, id: option.id }).unwrap(); toast.success("Size deleted"); }
    catch (error) { toast.error(apiErrorMessage(error as never, "Could not delete size.")); }
  }
  return <form onSubmit={submit} className="space-y-3 rounded-lg border p-4">
    <h3 className="font-semibold">{option ? `${option.name} (${option.status.toLowerCase()})` : "Add a size"}</h3>
    <div className="grid gap-3 md:grid-cols-3">
      <label className="text-sm">Size name<input className={inputClass} required value={name} onChange={(event) => setName(event.target.value)} /></label>
      <label className="text-sm">Price add-on (USD)<input className={inputClass} required type="number" min="0" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} /></label>
      <label className="text-sm">Display order<input className={inputClass} required type="number" step="1" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} /></label>
    </div>
    <div className="flex flex-wrap gap-3"><button className="btn_primary_black" disabled={busy}>{busy ? "Saving..." : option ? "Save size" : "Add size"}</button>
      {option && <><button className="btn_outline_black" type="button" disabled={busy} onClick={toggleStatus}>{option.status === "ACTIVE" ? "Disable" : "Enable"}</button>
        <button className="btn_outline_black" type="button" disabled={busy} onClick={deleteSize}>Delete</button></>}
    </div>
  </form>;
}

export default function ProductConfigurationView({ productId }: { productId: string }) {
  const product = useGetProductQuery(productId);
  const sizes = useListSizeOptionsQuery(productId);
  return <PageShell>
    <PageHeader title={product.data?.name ?? "Product settings"} breadcrumbs={[{ label: "Home", href: "/" }, { label: "Products", href: "/products" }, { label: "Sizes and discount" }]} rightSlot={<AdminTopActions />} />
    {product.isLoading ? <p role="status">Loading product...</p> : product.error ? <div role="alert">{apiErrorMessage(product.error as never)} <button className="underline" onClick={() => product.refetch()}>Retry</button></div> : product.data && <>
      <DataCard title="Product discount"><DiscountForm key={JSON.stringify([product.data.id, product.data.discountType, product.data.discountValue, product.data.discountStartAt, product.data.discountEndAt])} product={product.data} /></DataCard>
      <DataCard title="Size options" meta="Set the sizes and price add-ons customers can select.">
        <div className="space-y-4 p-2">
          {sizes.isLoading ? <p role="status">Loading sizes...</p> : sizes.error ? <div role="alert">{apiErrorMessage(sizes.error as never)} <button className="underline" onClick={() => sizes.refetch()}>Retry</button></div> : <>
            {!sizes.data?.length && <p className="text-sm text-muted-foreground">No sizes have been added.</p>}
            {sizes.data?.map((option) => <SizeForm key={JSON.stringify(option)} productId={productId} option={option} />)}
            <SizeForm productId={productId} />
          </>}
        </div>
      </DataCard>
    </>}
  </PageShell>;
}
