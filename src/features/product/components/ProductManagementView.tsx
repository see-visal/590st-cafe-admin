"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { CalendarDays } from "lucide-react";
import { PageShell } from "@/components/common/PageShell";
import { PageHeader } from "@/components/common/PageHeader";
import { DatePickerWithRange } from "@/components/forms/FilterDate";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  AdminTopActions,
  Cell,
  CheckBox,
  DataCard,
  DetailGrid,
  DetailItem,
  DetailModal,
  FilterActions,
  FilterPanel,
  PaginationFooter,
  Row,
  RowActions,
  SelectField,
  SimpleTable,
  StatusBadge,
  TableActions,
  TextField,
  Thumbnail,
} from "@/components/common/AdminKit";
import {
  useProducts,
  useCategories,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "@/features/product/hooks/useProducts";
import { ProductResponse, ProductRequest, ProductStatus } from "@/features/product/types/product.type";

export default function Products() {
  // State for UI
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductResponse | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // API hooks
  const { products, isLoading: productsLoading, refetch: refetchProducts } = useProducts();
  const { categories, refetch: refetchCategories } = useCategories();
  const { create: createProduct, isLoading: isCreating } = useCreateProduct();
  const { update: updateProduct, isLoading: isUpdating } = useUpdateProduct();
  const { delete: deleteProduct, isLoading: isDeleting } = useDeleteProduct();
  const [filterStatus, setFilterStatus] = useState("");


  // Form state
  const [formData, setFormData] = useState<ProductRequest>({
    name: "",
    price: 0,
    categoryId: 0,
    status: "ACTIVE",
    imageUrl: "",
  });

  // Load data on mount
  useEffect(() => {
    refetchProducts();
    refetchCategories();
  }, [refetchCategories, refetchProducts]);

  // Filtered products
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.categoryId === parseInt(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const handleOpenForm = (product?: ProductResponse) => {
    if (product) {
      setIsEditing(true);
      setSelectedProduct(product);
      setFormData({
        name: product.name,
        price: product.price,
        categoryId: product.categoryId,
        status: product.status,
        imageUrl: product.imageUrl || "",
      });
    } else {
      setIsEditing(false);
      setSelectedProduct(null);
      setFormData({
        name: "",
        price: 0,
        categoryId: categories[0]?.id || 0,
        status: "ACTIVE",
        imageUrl: "",
      });
    }
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setIsEditing(false);
    setSelectedProduct(null);
  };

  const handleSubmitForm = async () => {
    if (!formData.name || !formData.categoryId || formData.price <= 0) {
      alert("Please fill all required fields");
      return;
    }

    try {
      if (isEditing && selectedProduct) {
        await updateProduct(selectedProduct.id, formData);
      } else {
        await createProduct(formData);
      }
      handleCloseForm();
      refetchProducts();
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id);
        refetchProducts();
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  const handleViewDetail = (product: ProductResponse) => {
    setSelectedProduct(product);
    setDetailOpen(true);
  };

  const getCategoryName = (categoryId: number): string => {
    return categories.find((cat) => cat.id === categoryId)?.name || "Unknown";
  };

  const totalValue = filteredProducts.reduce((sum, product) => sum + product.price, 0);

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

      <FilterPanel onRegister={() => handleOpenForm()}>
        <TextField
          label="Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
         <TextField
          label="Amount"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <SelectField label="Status" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </SelectField>
        <DatePickerWithRange />
        <FilterActions />
      </FilterPanel>

      <DataCard
        title="Menu Items"
        meta={`Total Products: ${filteredProducts.length} | Total Value: ${totalValue.toLocaleString()} KHR`}
        actions={<TableActions onRegister={() => handleOpenForm()} />}
      >
        {productsLoading ? (
          <div className="py-8 text-center text-gray-500">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No products found</div>
        ) : (
          <>
            <SimpleTable
              headers={[
                "No",
                "",
                "Image",
                "Name",
                "Price",
                "Category",
                "Status",
                "Created",
                "Action",
              ]}
            >
              {filteredProducts.map((product, index) => (
                <Row key={product.id} striped={index % 2 === 1}>
                  <Cell>{index + 1}</Cell>
                  <Cell>
                    <CheckBox checked={false} />
                  </Cell>
                  <Cell>
                    {product.imageUrl ? (
                      <div className="relative h-10 w-10 overflow-hidden rounded border border-gray-200 bg-gray-100">
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <Thumbnail />
                    )}
                  </Cell>
                  <Cell>{product.name}</Cell>
                  <Cell>{product.price.toLocaleString()} KHR</Cell>
                  <Cell>{getCategoryName(product.categoryId)}</Cell>
                  <Cell>
                    <StatusBadge
                      label={product.status}
                      variant={product.status === "ACTIVE" ? "success" : "secondary"}
                    />
                  </Cell>
                  <Cell>{new Date(product.createdAt).toLocaleDateString()}</Cell>
                  <Cell>
                    <RowActions
                      onView={() => handleViewDetail(product)}
                      onEdit={() => handleOpenForm(product)}
                      onDelete={() => handleDeleteProduct(product.id)}
                      isLoading={isDeleting}
                    />
                  </Cell>
                </Row>
              ))}
            </SimpleTable>
            <PaginationFooter />
          </>
        )}
      </DataCard>

      {/* Create/Edit Form Modal */}
      <ProductRegisterModal
        open={formOpen}
        onOpenChange={handleCloseForm}
        isEditing={isEditing}
        formData={formData}
        setFormData={setFormData}
        categories={categories}
        onSubmit={handleSubmitForm}
        isLoading={isCreating || isUpdating}
      />

      {/* Detail Modal */}
      <DetailModal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        title="Product Details"
        onEdit={() => {
          setDetailOpen(false);
          if (selectedProduct) {
            handleOpenForm(selectedProduct);
          }
        }}
      >
        {selectedProduct && (
          <div className="rounded-lg bg-white p-4">
            <h3 className="mb-6 text-lg font-semibold">Product Information</h3>
            <DetailGrid>
              <DetailItem label="Name">{selectedProduct.name}</DetailItem>
              <DetailItem label="Price">
                {selectedProduct.price.toLocaleString()} KHR
              </DetailItem>
              <DetailItem label="Category">
                {getCategoryName(selectedProduct.categoryId)}
              </DetailItem>
              <DetailItem label="Status">
                <StatusBadge
                  label={selectedProduct.status}
                  variant={selectedProduct.status === "ACTIVE" ? "success" : "secondary"}
                />
              </DetailItem>
              <DetailItem label="Created">
                {new Date(selectedProduct.createdAt).toLocaleString()}
              </DetailItem>
              <DetailItem label="Updated">
                {selectedProduct.updatedAt
                  ? new Date(selectedProduct.updatedAt).toLocaleString()
                  : "—"}
              </DetailItem>
              {selectedProduct.imageUrl && (
                <DetailItem label="Image">
                  <div className="relative h-36 w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                    <Image
                      src={selectedProduct.imageUrl}
                      alt={selectedProduct.name}
                      fill
                      sizes="240px"
                      className="object-cover"
                    />
                  </div>
                </DetailItem>
              )}
            </DetailGrid>
          </div>
        )}
      </DetailModal>
    </PageShell>
  );
}

// ─── Product Register/Modify Modal ──────────────────────────────────────────
function ProductRegisterModal({
  open,
  onOpenChange,
  isEditing,
  formData,
  setFormData,
  categories,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  formData: import("@/features/product/types/product.type").ProductRequest;
  setFormData: (data: import("@/features/product/types/product.type").ProductRequest) => void;
  categories: { id: number; name: string }[];
  onSubmit: () => Promise<void> | void;
  isLoading: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFormData({ ...formData, imageUrl: URL.createObjectURL(file) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-0 rounded-xl p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="border-b border-gray-200 px-6 py-5">
          <DialogTitle className="text-lg font-semibold">
            Product Register/Modify
          </DialogTitle>
        </DialogHeader>

        {/* Body */}
        <div className="bg-gray-50 px-6 py-5 space-y-4">
          {/* Row 1: Name | Amount | Status */}
          <div className="grid grid-cols-3 gap-4">
            <label className="block text-sm font-medium text-gray-700">
              Name
              <input
                type="text"
                placeholder="Placeholder"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-500 outline-none transition focus:border-[#7ec900] focus:ring-2 focus:ring-lime-100"
              />
            </label>

            <label className="block text-sm font-medium text-gray-700">
              Amount
              <input
                type="number"
                placeholder="Placeholder"
                value={formData.price || ""}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="mt-1 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-500 outline-none transition focus:border-[#7ec900] focus:ring-2 focus:ring-lime-100"
              />
            </label>

            <label className="block text-sm font-medium text-gray-700">
              Status
              <span className="relative mt-1 block">
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as import("@/features/product/types/product.type").ProductStatus })
                  }
                  className="h-10 w-full appearance-none rounded-md border border-gray-300 bg-white px-3 pr-10 text-sm text-gray-500 outline-none transition focus:border-[#7ec900] focus:ring-2 focus:ring-lime-100"
                >
                  <option value="">Select Method</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
                <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </label>
          </div>

          {/* Row 2: Category | Payment Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm font-medium text-gray-700">
              Category
              <span className="relative mt-1 block">
                <select
                  value={formData.categoryId || ""}
                  onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
                  className="h-10 w-full appearance-none rounded-md border border-gray-300 bg-white px-3 pr-10 text-sm text-gray-500 outline-none transition focus:border-[#7ec900] focus:ring-2 focus:ring-lime-100"
                >
                  <option value="">Select Method</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </label>

            <label className="block text-sm font-medium text-gray-700">
              Payment Date Range
              <span className="relative mt-1 block">
                <input
                  readOnly
                  value="Start Date - End Date"
                  className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 pr-10 text-sm text-gray-500 outline-none"
                />
                <CalendarDays className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
              </span>
            </label>
          </div>

          {/* Row 3: Upload Product Image */}
          <div>
            <p className="mb-1 text-sm font-medium text-gray-700">Upload Product Image</p>
            <div className="flex items-center gap-2">
              <div className="flex h-10 flex-1 items-center rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-400">
                {fileName || "No File Chosen"}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="h-10 whitespace-nowrap rounded-md border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition"
              >
                Upload Image
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="border-t border-gray-200 px-6 py-4">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="h-10 rounded-md border border-black bg-white px-6 text-sm font-semibold disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isLoading}
            className="h-10 rounded-md bg-[#befe35] px-6 text-sm font-semibold text-black disabled:opacity-50"
          >
            {isLoading ? "Processing..." : isEditing ? "Update" : "Submit"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
