"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { PageShell } from "@/components/common/PageShell";
import { PageHeader } from "@/components/common/PageHeader";
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

      <FilterPanel>
        <TextField
          label="Product Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <SelectField
          label="Category"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </SelectField>
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
            label="Price (KHR) *"
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
