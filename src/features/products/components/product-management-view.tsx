"use client";

import { useState } from "react";
import { type DateRange } from "react-day-picker";
import { PageShell } from "@/components/shared/page-shell";
import { PageHeader } from "@/components/shared/page-header";
import {
  AdminTopActions,
  Cell,
  CheckBox,
  DataCard,
  DateField,
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
  SelectItem,
  SimpleTable,
  StatusBadge,
  TableActions,
  TextField,
  Thumbnail,
} from "@/components/shared/admin-kit";
import { useProducts } from "@/features/products/hooks/use-products";
import { useCreateProduct } from "@/features/products/hooks/use-create-product";
import { useUpdateProduct } from "@/features/products/hooks/use-update-product";
import { useDeleteProduct } from "@/features/products/hooks/use-delete-product";
import { useCategories } from "@/features/categories/hooks/use-categories";
import { ProductResponse, ProductRequest, ProductStatus } from "@/features/products/types/product.type";
import { autoColumns, downloadCsv } from "@/lib/export-csv";
import { usePagination } from "@/hooks/use-pagination";

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

type StaticProductRow = (typeof STATIC_PRODUCT_ROWS)[number];

type ProductDetailView = {
  name: string;
  amount: string;
  category: string;
  paymentStartDate: string;
  paymentEndDate: string;
  status: string;
  imageUrl?: string;
  editProduct?: ProductResponse;
};

export default function Products() {
  // State for UI
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductResponse | null>(null);
  const [detailView, setDetailView] = useState<ProductDetailView | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [amountSearch, setAmountSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [formDateRange, setFormDateRange] = useState<DateRange | undefined>();
  const [imageFile, setImageFile] = useState<File | null>(null);

  // API hooks
  const { products = [], refetch: refetchProducts } = useProducts();
  const { categories = [] } = useCategories();
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
      setFormDateRange(undefined);
      setImageFile(null);
    } else {
      setIsEditing(false);
      setSelectedProduct(null);
      setFormData({
        name: "",
        price: 0,
        categoryId: 0,
        status: undefined,
        imageUrl: "",
      });
      setFormDateRange(undefined);
      setImageFile(null);
    }
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setIsEditing(false);
    setSelectedProduct(null);
    setFormDateRange(undefined);
    setImageFile(null);
  };

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    setFormData((prev) => ({
      ...prev,
      imageUrl: file ? URL.createObjectURL(file) : prev.imageUrl || "",
    }));
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
    setDetailView({
      name: product.name,
      amount: `$${product.price.toFixed(2)}`,
      category: getCategoryName(product.categoryId),
      paymentStartDate: "10-Jan-2025",
      paymentEndDate: "10-Feb-2025",
      status: "Paid",
      imageUrl: product.imageUrl,
      editProduct: product,
    });
    setDetailOpen(true);
  };

  const handleViewMockDetail = (row: StaticProductRow) => {
    setSelectedProduct(null);
    setDetailView({
      name: row.name,
      amount: row.amount,
      category: row.category,
      paymentStartDate: row.startDate,
      paymentEndDate: row.endDate,
      status: row.status,
    });
    setDetailOpen(true);
  };

  const handleDetailOpenChange = (open: boolean) => {
    setDetailOpen(open);
    if (!open) {
      setDetailView(null);
    }
  };

  const getCategoryName = (categoryId: number): string => {
    return categories.find((cat) => cat.id === categoryId)?.name || "1";
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setAmountSearch("");
    setStatusFilter("");
    setDateRange(undefined);
  };

  const apiPage = usePagination(products);
  const mockPage = usePagination(STATIC_PRODUCT_ROWS);
  const activePage = hasApiData ? apiPage : mockPage;

  const handleExport = () =>
    downloadCsv("products", products as never[], autoColumns(products as never[]));

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
          value={statusFilter}
          onValueChange={(e) => setStatusFilter(e)}
        >
          <SelectItem value="Paid">Paid</SelectItem>
          <SelectItem value="Unpaid">Unpaid</SelectItem>
          <SelectItem value="ACTIVE">Active</SelectItem>
          <SelectItem value="INACTIVE">Inactive</SelectItem>
        </SelectField>
        <DateField
          label="Payment Date Range"
          value={dateRange}
          onChange={setDateRange}
        />
        <FilterActions onClear={handleClearFilters} />
      </FilterPanel>

      <DataCard
        title="Menu items"
        meta="Total Products Amount: 1500 USD"
        actions={<TableActions onRegister={() => handleOpenForm()} onExport={handleExport} primaryLabel="Register" />}
      >
        <SimpleTable headers={[...PRODUCT_TABLE_HEADERS]}>
          {hasApiData
            ? apiPage.pageRows.map((product, index) => (
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
            : mockPage.pageRows.map((product, index) => (
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
                      onView={() => handleViewMockDetail(product)}
                      onEdit={() => handleOpenForm()}
                      onDelete={() => undefined}
                    />
                  </Cell>
                </Row>
              ))}
        </SimpleTable>
        <PaginationFooter
          page={activePage.page}
          totalPages={activePage.totalPages}
          pageSize={activePage.pageSize}
          onPageChange={activePage.setPage}
          onPageSizeChange={activePage.setPageSize}
        />
      </DataCard>

      {/* Create/Edit Form Modal */}
      <FormModal
        open={formOpen}
        onOpenChange={handleCloseForm}
        title="Product Register/Modify"
        submitLabel="Submit"
        onSubmit={handleSubmitForm}
        isLoading={isCreating || isUpdating}
      >
        <ModalGrid>
          <FormInput
            label="Name"
            placeholder="Placeholder"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <FormInput
            label="Amount"
            type="number"
            placeholder="Placeholder"
            value={formData.price || ""}
            onChange={(e) =>
              setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
            }
            required
          />
          <FormSelect
            label="Status"
            value={formData.status ?? ""}
            onValueChange={(e) =>
              setFormData({
                ...formData,
                status: (e || undefined) as ProductStatus | undefined,
              })
            }
          >
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
          </FormSelect>
          <FormSelect
            label="Category"
            value={formData.categoryId || ""}
            onValueChange={(e) =>
              setFormData({ ...formData, categoryId: parseInt(e, 10) })
            }
            required
          >
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={String(cat.id)}>
                {cat.name}
              </SelectItem>
            ))}
          </FormSelect>
          <div className="md:col-span-2">
            <DateField
              label="Payment Date Range"
              value={formDateRange}
              onChange={setFormDateRange}
            />
          </div>
          <div className="md:col-span-3">
            <FormImageUpload
              label="Upload Product Image"
              file={imageFile}
              onChange={handleImageChange}
            />
          </div>
        </ModalGrid>
      </FormModal>

      {/* Detail Modal */}
      <DetailModal
        open={detailOpen}
        onOpenChange={handleDetailOpenChange}
        title="Product Detail"
        onEdit={() => {
          const productToEdit = detailView?.editProduct;
          setDetailOpen(false);
          setDetailView(null);
          if (productToEdit) {
            handleOpenForm(productToEdit);
          } else {
            handleOpenForm();
          }
        }}
      >
        {detailView && (
          <div className="admin_modal_form_wrap">
            <DetailGrid>
              <DetailItem label="Name">{detailView.name}</DetailItem>
              <DetailItem label="Amount">{detailView.amount}</DetailItem>
              <DetailItem label="Category">{detailView.category}</DetailItem>
              <DetailItem label="Payment Start Date">
                {detailView.paymentStartDate}
              </DetailItem>
              <DetailItem label="Payment End Date">
                {detailView.paymentEndDate}
              </DetailItem>
              <DetailItem label="Status">
                <StatusBadge label={detailView.status} tone="success" />
              </DetailItem>
              <div className="detail_item md:col-span-1">
                <p className="detail_item_label">Image :</p>
                <DetailImage src={detailView.imageUrl} alt={detailView.name} />
              </div>
            </DetailGrid>
          </div>
        )}
      </DetailModal>
    </PageShell>
  );
}
