"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import toast from "react-hot-toast";
import { PageShell } from "@/components/common/PageShell";
import { PageHeader } from "@/components/common/PageHeader";
import {
  AdminTopActions,
  Cell,
  DataCard,
  DetailGrid,
  DetailImage,
  DetailItem,
  DetailModal,
  FilterActions,
  FilterPanel,
  FormImageUpload,
  FormInput,
  FormModal,
  FormSelect,
  ModalGrid,
  PaginationFooter,
  Row,
  RowActions,
  SelectField,
  SimpleTable,
  StatTile,
  StatusBadge,
  TableActions,
  TableState,
  TextField,
  Thumbnail,
} from "@/components/common/AdminKit";
import { apiErrorMessage } from "@/store/api/baseApi";
import { usePageSize } from "@/contexts/AdminPreferencesContext";
import { useListCategoriesQuery } from "@/store/api/categoryApi";
import { useCurrentRole } from "@/store/api/useCurrentRole";
import {
  useCreateProductMutation,
  useDeleteProductMutation,
  useListProductsQuery,
  useUpdateProductMutation,
  useUploadProductImageMutation,
} from "@/store/api/productApi";
import type { ProductResponse, Status } from "@/store/api/types";

const PRODUCT_TABLE_HEADERS = [
  "No",
  "Image",
  "Name",
  "SKU",
  "Category",
  "Price",
  "Stock",
  "Status",
  "Action",
] as const;

type ProductFormFields = {
  name: string;
  description: string;
  sku: string;
  unit: string;
  price: string;
  categoryId: string;
  reorderLevel: string;
  discountPercent: string;
  status: Status;
};

const EMPTY_FORM: ProductFormFields = {
  name: "",
  description: "",
  sku: "",
  unit: "",
  price: "",
  categoryId: "",
  reorderLevel: "",
  discountPercent: "",
  status: "ACTIVE",
};

const money = (value: number | null | undefined) =>
  value == null ? "-" : `$${Number(value).toFixed(2)}`;

export default function Products() {
  const { isAdmin } = useCurrentRole();
  const [page, setPage] = useState(1);
  const [size, setSize] = usePageSize();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const {
    data: productPage,
    isFetching,
    error,
    refetch,
  } = useListProductsQuery({
    page,
    size,
    // The API filters by category server-side; status and name are narrowed client-side.
    ...(categoryFilter ? { categoryId: categoryFilter } : {}),
  });

  const { data: categoryPage, isSuccess: categoriesLoaded } = useListCategoriesQuery({
    page: 1,
    size: 200,
  });
  const categories = useMemo(() => categoryPage?.content ?? [], [categoryPage]);

  /**
   * Every product needs a category (the API rejects a null categoryId), so on a fresh install
   * the form cannot be completed at all until one exists. Wait for the query to actually
   * succeed before saying so — an empty list while loading is not the same as none existing.
   */
  const hasNoCategories = categoriesLoaded && categories.length === 0;

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const [uploadImage, { isLoading: isUploading }] = useUploadProductImageMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<ProductResponse | null>(null);
  const [formFields, setFormFields] = useState<ProductFormFields>(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const products = useMemo(() => productPage?.content ?? [], [productPage]);

  const visibleProducts = useMemo(
    () =>
      products.filter((product) => {
        const term = searchTerm.trim().toLowerCase();
        const matchesSearch =
          !term ||
          product.name.toLowerCase().includes(term) ||
          product.sku.toLowerCase().includes(term);
        const matchesStatus = !statusFilter || product.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [products, searchTerm, statusFilter]
  );

  const lowStockCount = products.filter(
    (p) => Number(p.quantityOnHand) <= Number(p.reorderLevel)
  ).length;
  const discountedCount = products.filter((p) => p.discountActive).length;

  const handleOpenForm = (product?: ProductResponse) => {
    if (!isAdmin) return;
    setSelected(product ?? null);
    setImageFile(null);
    setFormFields(
      product
        ? {
            name: product.name,
            description: product.description ?? "",
            sku: product.sku,
            unit: product.unit,
            price: String(product.price),
            categoryId: product.categoryId,
            reorderLevel: String(product.reorderLevel ?? ""),
            // Existing discounts are edited on the configuration screen, which also covers
            // fixed-amount discounts and schedules — the modal only offers one at creation.
            discountPercent: "",
            status: product.status,
          }
        : { ...EMPTY_FORM, categoryId: categories[0]?.id ?? "" }
    );
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setSelected(null);
    setFormFields(EMPTY_FORM);
    setImageFile(null);
  };

  const handleSubmitForm = async () => {
    if (!isAdmin) return;
    const name = formFields.name.trim();
    const price = Number(formFields.price);

    if (!name) {
      toast.error("Product name is required");
      return;
    }
    if (!formFields.categoryId) {
      // Telling someone to choose from an empty list is a dead end — on a fresh install there
      // is nothing to choose, and the category is required server-side.
      toast.error(
        hasNoCategories
          ? "Create a category first — a product has to belong to one."
          : "Please choose a category"
      );
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      toast.error("Enter a valid price");
      return;
    }

    const reorderLevel = formFields.reorderLevel.trim()
      ? Number(formFields.reorderLevel)
      : undefined;

    // Blank means "sell at full price" rather than "0% off", so it has to stay undefined —
    // the API treats a present discountValue as a discount to apply.
    const discountPercentText = formFields.discountPercent.trim();
    let discountPercent: number | undefined;
    if (discountPercentText) {
      discountPercent = Number(discountPercentText);
      if (!Number.isFinite(discountPercent) || discountPercent <= 0 || discountPercent > 100) {
        toast.error("Discount must be a percentage between 0 and 100");
        return;
      }
    }

    try {
      let productId: string;

      if (selected) {
        const updated = await updateProduct({
          id: selected.id,
          body: {
            name,
            description: formFields.description.trim() || undefined,
            unit: formFields.unit.trim() || undefined,
            price,
            categoryId: formFields.categoryId,
            status: formFields.status,
            reorderLevel,
          },
        }).unwrap();
        productId = updated.id;
      } else {
        if (!formFields.sku.trim()) {
          toast.error("SKU is required");
          return;
        }
        if (!formFields.unit.trim()) {
          toast.error("Unit is required");
          return;
        }
        const created = await createProduct({
          name,
          description: formFields.description.trim() || undefined,
          sku: formFields.sku.trim(),
          unit: formFields.unit.trim(),
          price,
          categoryId: formFields.categoryId,
          reorderLevel,
          ...(discountPercent !== undefined
            ? { discountType: "PERCENTAGE" as const, discountValue: discountPercent }
            : {}),
        }).unwrap();
        productId = created.id;
      }

      // The image is a separate multipart endpoint, so it only runs once the product exists.
      if (imageFile) {
        await uploadImage({ id: productId, file: imageFile }).unwrap();
      }

      toast.success(selected ? "Product updated" : "Product created");
      handleCloseForm();
    } catch (err) {
      toast.error(apiErrorMessage(err as never, "Could not save the product."));
    }
  };

  const handleDelete = async (product: ProductResponse) => {
    if (!isAdmin) return;
    if (!window.confirm(`Delete product "${product.name}"?`)) return;
    try {
      await deleteProduct(product.id).unwrap();
      toast.success("Product deleted");
    } catch (err) {
      toast.error(apiErrorMessage(err as never, "Could not delete the product."));
    }
  };

  const isSaving = isCreating || isUpdating || isUploading;

  // Shows what a customer will actually pay while the admin types the discount, so a typo like
  // 90 instead of 9 is obvious before submitting. Null whenever the numbers do not make sense yet.
  const discountedPreview = (() => {
    const price = Number(formFields.price);
    const percent = Number(formFields.discountPercent);
    if (!formFields.discountPercent.trim() || !Number.isFinite(price) || !Number.isFinite(percent)) {
      return null;
    }
    // A zero/blank price would render a pointless "$0.00 instead of $0.00" line.
    if (price <= 0 || percent <= 0 || percent > 100) return null;
    return price - (price * percent) / 100;
  })();

  return (
    <PageShell>
      <PageHeader
        title="Products List"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Products" },
          { label: "Products List" },
        ]}
        rightSlot={<AdminTopActions />}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatTile
          title="All Products"
          value={String(productPage?.totalElements ?? 0)}
          tone="gray"
        />
        <StatTile
          title="Low Stock (this page)"
          value={String(lowStockCount)}
          tone={lowStockCount > 0 ? "red" : "gray"}
        />
        <StatTile title="On Discount" value={String(discountedCount)} tone="green" />
      </div>

      <FilterPanel>
        <TextField
          label="Name or SKU"
          placeholder="Search products"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <SelectField
          label="Category"
          placeholder="All categories"
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Status"
          placeholder="All statuses"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </SelectField>
        <FilterActions onClear={() => { setSearchTerm(""); setStatusFilter(""); setCategoryFilter(""); setPage(1); }} onSearch={refetch} />
      </FilterPanel>

      <DataCard
        title="Products"
        meta={`Total Products: ${productPage?.totalElements ?? 0}`}
        actions={
          isAdmin ? <TableActions onRegister={() => handleOpenForm()} primaryLabel="Register" /> : undefined
        }
      >
        <SimpleTable headers={[...PRODUCT_TABLE_HEADERS]}>
          <TableState
            colSpan={PRODUCT_TABLE_HEADERS.length}
            isLoading={isFetching}
            error={error}
            isEmpty={visibleProducts.length === 0}
            emptyLabel={
              !isAdmin ? "No products found." : hasNoCategories
                ? "No products yet — and no categories to file one under. Create a category first, then Register a product."
                : "No products yet. Use Register to add the first one."
            }
            onRetry={refetch}
          />
          {!isFetching &&
            !error &&
            visibleProducts.map((product, index) => (
              <Row key={product.id} striped={index % 2 === 1}>
                <Cell>{(page - 1) * size + index + 1}</Cell>
                <Cell>
                  <Thumbnail src={product.imageUrl ?? undefined} />
                </Cell>
                <Cell className="font-semibold">{product.name}</Cell>
                <Cell>{product.sku}</Cell>
                <Cell>{product.categoryName}</Cell>
                <Cell>
                  {product.discountActive ? (
                    <span className="flex flex-col">
                      <span className="font-semibold">{money(product.finalPrice)}</span>
                      <span className="text-xs text-muted-foreground line-through">
                        {money(product.price)}
                      </span>
                    </span>
                  ) : (
                    money(product.price)
                  )}
                </Cell>
                <Cell>
                  <span
                    className={
                      Number(product.quantityOnHand) <= Number(product.reorderLevel)
                        ? "font-semibold text-red-600"
                        : undefined
                    }
                  >
                    {Number(product.quantityOnHand)} {product.unit}
                  </span>
                </Cell>
                <Cell>
                  <StatusBadge
                    label={product.status === "ACTIVE" ? "Active" : "Inactive"}
                    tone={product.status === "ACTIVE" ? "success" : "danger"}
                  />
                </Cell>
                <Cell>
                  <RowActions
                    onView={() => {
                      setSelected(product);
                      setDetailOpen(true);
                    }}
                    onEdit={isAdmin ? () => handleOpenForm(product) : undefined}
                    onDelete={isAdmin ? () => handleDelete(product) : undefined}
                    isLoading={isSaving}
                  />
                </Cell>
              </Row>
            ))}
        </SimpleTable>
        <PaginationFooter
          page={productPage?.page ?? page}
          totalPages={productPage?.totalPages ?? 1}
          size={size}
          totalElements={productPage?.totalElements}
          onPageChange={setPage}
          onSizeChange={(next) => {
            setSize(next);
            setPage(1);
          }}
        />
      </DataCard>

      <FormModal
        open={isAdmin && formOpen}
        onOpenChange={handleCloseForm}
        title={selected ? "Modify Product" : "Register Product"}
        submitLabel="Submit"
        onSubmit={handleSubmitForm}
        isLoading={isSaving}
      >
        {hasNoCategories && !selected ? (
          <div
            className="mx-6 mt-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3"
            role="status"
          >
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p className="text-sm text-amber-900">
              There are no categories yet, and every product belongs to one.{" "}
              <Link href="/categories" className="font-semibold underline">
                Create a category
              </Link>{" "}
              first, then come back here.
            </p>
          </div>
        ) : null}
        <ModalGrid>
          <FormInput
            label="Product Name"
            placeholder="e.g. Iced Latte"
            value={formFields.name}
            onChange={(e) => setFormFields({ ...formFields, name: e.target.value })}
            required
          />
          {/* SKU is immutable once set — UpdateProductRequest has no sku field. */}
          <FormInput
            label="SKU"
            placeholder="e.g. DRK-LAT-01"
            value={formFields.sku}
            onChange={(e) => setFormFields({ ...formFields, sku: e.target.value })}
            readOnly={Boolean(selected)}
            required={!selected}
          />
          <FormInput
            label="Unit"
            placeholder="e.g. cup"
            value={formFields.unit}
            onChange={(e) => setFormFields({ ...formFields, unit: e.target.value })}
            required={!selected}
          />
          <FormInput
            label="Price (USD)"
            type="number"
            placeholder="0.00"
            value={formFields.price}
            onChange={(e) => setFormFields({ ...formFields, price: e.target.value })}
            required
          />
          <FormSelect
            label="Category"
            placeholder="Select category"
            value={formFields.categoryId}
            onChange={(e) =>
              setFormFields({ ...formFields, categoryId: e.target.value })
            }
            required
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </FormSelect>
          <FormInput
            label="Reorder Level"
            type="number"
            placeholder="e.g. 10"
            value={formFields.reorderLevel}
            onChange={(e) =>
              setFormFields({ ...formFields, reorderLevel: e.target.value })
            }
          />
          {/* Creation only. Changing an existing discount — or setting a fixed-amount one, or
              scheduling it — happens on the product configuration screen linked below. */}
          {!selected ? (
            <FormInput
              label="Discount (%)"
              type="number"
              placeholder="e.g. 10"
              min={0}
              max={100}
              value={formFields.discountPercent}
              onChange={(e) =>
                setFormFields({ ...formFields, discountPercent: e.target.value })
              }
            />
          ) : null}
          {!selected ? (
            <p className="text-sm text-muted-foreground md:col-span-3">
              {discountedPreview !== null
                ? `Customers pay ${money(discountedPreview)} instead of ${money(Number(formFields.price))} while the discount is on.`
                : "Optional — leave empty to sell at full price. Entering 10 puts the product on the menu at 10% off."}
            </p>
          ) : null}
          {selected ? (
            <p className="text-sm text-muted-foreground md:col-span-3">
              Discount:{" "}
              {selected.discountValue != null
                ? `${Number(selected.discountValue)}${
                    selected.discountType === "PERCENTAGE" ? "%" : " USD"
                  } off`
                : "none"}{" "}
              —{" "}
              <Link
                href={`/products/${selected.id}/configuration`}
                className="font-semibold underline"
              >
                manage discount and sizes
              </Link>
            </p>
          ) : null}
          {selected ? (
            <FormSelect
              label="Status"
              placeholder="Select status"
              value={formFields.status}
              onChange={(e) =>
                setFormFields({ ...formFields, status: e.target.value as Status })
              }
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </FormSelect>
          ) : null}
          <FormInput
            label="Description"
            placeholder="Short description"
            value={formFields.description}
            onChange={(e) =>
              setFormFields({ ...formFields, description: e.target.value })
            }
          />
          <div className="md:col-span-3">
            <FormImageUpload
              label="Product Image"
              file={imageFile}
              onChange={setImageFile}
            />
          </div>
        </ModalGrid>
      </FormModal>

      <DetailModal
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) setSelected(null);
        }}
        title="Product Detail"
        onEdit={isAdmin ? () => {
          const product = selected;
          setDetailOpen(false);
          if (product) handleOpenForm(product);
        } : undefined}
      >
        {selected && (
          <div className="admin_modal_form_wrap">
            {isAdmin && <Link href={`/products/${selected.id}/configuration`} className="mb-4 inline-block underline">Manage sizes and discount</Link>}
            <DetailGrid>
              <DetailItem label="Name">{selected.name}</DetailItem>
              <DetailItem label="SKU">{selected.sku}</DetailItem>
              <DetailItem label="Category">{selected.categoryName}</DetailItem>
              <DetailItem label="Price">{money(selected.price)}</DetailItem>
              <DetailItem label="Final Price">{money(selected.finalPrice)}</DetailItem>
              <DetailItem label="Discount">
                {selected.discountActive
                  ? `${selected.discountValue}${
                      selected.discountType === "PERCENTAGE" ? "%" : " USD"
                    } off`
                  : "None"}
              </DetailItem>
              <DetailItem label="Stock">
                {Number(selected.quantityOnHand)} {selected.unit}
              </DetailItem>
              <DetailItem label="Reorder Level">
                {Number(selected.reorderLevel)} {selected.unit}
              </DetailItem>
              <DetailItem label="Status">
                <StatusBadge
                  label={selected.status === "ACTIVE" ? "Active" : "Inactive"}
                  tone={selected.status === "ACTIVE" ? "success" : "danger"}
                />
              </DetailItem>
              <DetailItem label="Size Options">
                {selected.sizeOptions.length > 0
                  ? selected.sizeOptions
                      .map((option) => `${option.name} (+${Number(option.priceDelta)})`)
                      .join(", ")
                  : "None"}
              </DetailItem>
              <DetailItem label="Description">{selected.description || "-"}</DetailItem>
              <div className="detail_item">
                <p className="detail_item_label">Image :</p>
                <DetailImage src={selected.imageUrl ?? undefined} alt={selected.name} />
              </div>
            </DetailGrid>
          </div>
        )}
      </DetailModal>
    </PageShell>
  );
}
