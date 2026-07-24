"use client";

import { useState } from "react";
import Image from "next/image";
import { type DateRange } from "react-day-picker";
import { PageShell } from "@/components/common/PageShell";
import { PageHeader } from "@/components/common/PageHeader";
import {
  AdminTopActions,
  Cell,
  CheckBox,
  DataCard,
  DateField,
  DetailGrid,
  DetailItem,
  DetailModal,
  FilterActions,
  FilterPanel,
  FormInput,
  FormModal,
  FormSelect,
  ModalGrid,
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

const PRODUCT_TABLE_HEADERS = [
  "No",
  "",
  "Image",
  "Name",
  "Amount",
  "Category",
  "Payment Start Date",
  "Payment End Date",
  "Status",
  "Action",
] as const;

/** Static preview rows matching design mockup when API has no products */
const STATIC_PRODUCT_ROWS = [
  {
    id: "static-1",
    checked: false,
    name: "John Doe",
    amount: "$850.00",
    category: "1",
    startDate: "10-Jan-2025",
    endDate: "10-Feb-2025",
    status: "Paid",
  },
  {
    id: "static-2",
    checked: true,
    name: "John Doe",
    amount: "$850.00",
    category: "1",
    startDate: "10-Jan-2025",
    endDate: "10-Feb-2025",
    status: "Paid",
  },
  {
    id: "static-3",
    checked: false,
    name: "John Doe",
    amount: "$850.00",
    category: "1",
    startDate: "10-Jan-2025",
    endDate: "10-Feb-2025",
    status: "Paid",
  },
  {
    id: "static-4",
    checked: false,
    name: "John Doe",
    amount: "$850.00",
    category: "1",
    startDate: "10-Jan-2025",
    endDate: "10-Feb-2025",
    status: "Paid",
  },
  {
    id: "static-5",
    checked: false,
    name: "John Doe",
    amount: "$850.00",
    category: "1",
    startDate: "10-Jan-2025",
    endDate: "10-Feb-2025",
    status: "Paid",
  },
] as const;

export default function Products() {
  // State for UI
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductResponse | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [amountSearch, setAmountSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // API hooks
  const { products = [], isLoading: productsLoading, refetch: refetchProducts } = useProducts();
  const { categories = [], refetch: refetchCategories } = useCategories();
  const { create: createProduct, isLoading: isCreating } = useCreateProduct();
  const { update: updateProduct, isLoading: isUpdating } = useUpdateProduct();
  const { delete: deleteProduct, isLoading: isDeleting } = useDeleteProduct();

  // Form state
  const [formData, setFormData] = useState<ProductRequest>({
    name: "",
    price: 0,
    categoryId: 0,
    status: "ACTIVE",
    imageUrl: "",
  });

  const hasApiData = products && products.length > 0;

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
    return categories.find((cat) => cat.id === categoryId)?.name || "1";
  };

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

      <FilterPanel>
        <TextField
          label="Name"
          placeholder="Placeholder"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <TextField
          label="Amount"
          placeholder="Placeholder"
          value={amountSearch}
          onChange={(e) => setAmountSearch(e.target.value)}
        />
        <SelectField
          label="Status"
          placeholder="Select Method"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="Paid">Paid</option>
          <option value="Unpaid">Unpaid</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </SelectField>
        <DateField
          label="Payment Date Range"
          value={dateRange}
          onChange={setDateRange}
        />
        <FilterActions />
      </FilterPanel>

      <DataCard
        title="Menu items"
        meta="Total Products Amount: 1500 USD"
        actions={<TableActions onRegister={() => handleOpenForm()} primaryLabel="Register" />}
      >
        <SimpleTable headers={[...PRODUCT_TABLE_HEADERS]}>
          {hasApiData
            ? products.map((product, index) => (
                <Row key={product.id} striped={index % 2 === 1}>
                  <Cell>{index + 1}</Cell>
                  <Cell>
                    <CheckBox checked={false} />
                  </Cell>
                  <Cell>
                    <Thumbnail src={product.imageUrl} />
                  </Cell>
                  <Cell>{product.name}</Cell>
                  <Cell>${product.price.toFixed(2)}</Cell>
                  <Cell>{getCategoryName(product.categoryId)}</Cell>
                  <Cell>10-Jan-2025</Cell>
                  <Cell>10-Feb-2025</Cell>
                  <Cell>
                    <StatusBadge label="Paid" tone="success" />
                  </Cell>
                  <Cell>
                    <RowActions
                      onView={() => handleViewDetail(product)}
                      onEdit={() => handleOpenForm(product)}
                      onDelete={() => handleDeleteProduct(product.id)}
                      isLoading={isDeleting}
                    />
                  </Cell>
                </Row>
              ))
            : STATIC_PRODUCT_ROWS.map((product, index) => (
                <Row key={product.id} striped={index % 2 === 1}>
                  <Cell>{index + 1}</Cell>
                  <Cell>
                    <CheckBox checked={product.checked} />
                  </Cell>
                  <Cell>
                    <Thumbnail />
                  </Cell>
                  <Cell>{product.name}</Cell>
                  <Cell>{product.amount}</Cell>
                  <Cell>{product.category}</Cell>
                  <Cell>{product.startDate}</Cell>
                  <Cell>{product.endDate}</Cell>
                  <Cell>
                    <StatusBadge label={product.status} tone="success" />
                  </Cell>
                  <Cell>
                    <RowActions
                      onView={() => undefined}
                      onEdit={() => handleOpenForm()}
                      onDelete={() => undefined}
                    />
                  </Cell>
                </Row>
              ))}
        </SimpleTable>
        <PaginationFooter />
      </DataCard>

      {/* Create/Edit Form Modal */}
      <FormModal
        open={formOpen}
        onOpenChange={handleCloseForm}
        title={isEditing ? "Edit Product" : "Create New Product"}
        submitLabel={isEditing ? "Update Product" : "Create Product"}
        onSubmit={handleSubmitForm}
        isLoading={isCreating || isUpdating}
      >
        <ModalGrid>
          <FormInput
            label="Product Name *"
            placeholder="e.g., Coffee, Tea"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <FormInput
            label="Price (USD) *"
            type="number"
            placeholder="0"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
            required
          />
          <FormSelect
            label="Category *"
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
            required
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </FormSelect>
          <FormSelect
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as ProductStatus })}
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </FormSelect>
          <div className="md:col-span-2">
            <FormInput
              label="Image URL"
              placeholder="https://example.com/image.jpg"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            />
          </div>
        </ModalGrid>
      </FormModal>

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
          <div className="admin_modal_form_wrap">
            <h3 className="mb-6 text-lg font-semibold text-[#1E1E1E]">Product Information</h3>
            <DetailGrid>
              <DetailItem label="Name">{selectedProduct.name}</DetailItem>
              <DetailItem label="Price">
                ${selectedProduct.price.toFixed(2)}
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
            </DetailGrid>
          </div>
        )}
      </DetailModal>
    </PageShell>
  );
}
