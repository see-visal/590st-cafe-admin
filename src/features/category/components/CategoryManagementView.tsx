"use client";

import { useEffect, useMemo, useState } from "react";
import { PageShell } from "@/components/common/PageShell";
import { PageHeader } from "@/components/common/PageHeader";
import {
  AdminTopActions,
  Cell,
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
} from "@/components/common/AdminKit";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
} from "@/features/product/hooks/useProducts";
import { Category, CategoryRequest, CategoryStatus } from "@/features/product/types/product.type";

export default function Categories() {
  const { categories, isLoading, refetch } = useCategories();
  const { create: createCategory, isLoading: isCreating } = useCreateCategory();
  const { update: updateCategory, isLoading: isUpdating } = useUpdateCategory();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryRequest>({
    name: "",
    status: "ACTIVE",
  });

  useEffect(() => {
    refetch();
  }, [refetch]);

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const matchesSearch = category.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus = !filterStatus || category.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [categories, searchTerm, filterStatus]);

  const handleOpenForm = (category?: Category) => {
    if (category) {
      setIsEditing(true);
      setSelectedCategory(category);
      setFormData({
        name: category.name,
        status: category.status,
      });
    } else {
      setIsEditing(false);
      setSelectedCategory(null);
      setFormData({
        name: "",
        status: "ACTIVE",
      });
    }
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setIsEditing(false);
    setSelectedCategory(null);
  };

  const handleSubmitForm = async () => {
    if (!formData.name.trim()) {
      alert("Please enter a category name");
      return;
    }

    try {
      if (isEditing && selectedCategory) {
        await updateCategory(selectedCategory.id, formData);
      } else {
        await createCategory(formData);
      }
      handleCloseForm();
      refetch();
    } catch (error) {
      console.error("Category form error:", error);
    }
  };

  const handleViewDetail = (category: Category) => {
    setSelectedCategory(category);
    setDetailOpen(true);
  };

  return (
    <PageShell>
      <PageHeader
        title="Categories"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Categories" }]}
        rightSlot={<AdminTopActions />}
      />

      <FilterPanel>
        <TextField
          label="Category Name"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <SelectField
          label="Status"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </SelectField>
        <FilterActions />
      </FilterPanel>

      <DataCard
        title="Category List"
        meta={`Total Categories: ${filteredCategories.length}`}
        actions={<TableActions onRegister={() => handleOpenForm()} />}
      >
        {isLoading ? (
          <div className="py-8 text-center text-gray-500">
            Loading categories...
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            No categories found
          </div>
        ) : (
          <>
            <SimpleTable
              headers={[
                "No",
                "Name",
                "Status",
                "Items",
                "Created",
                "Action",
              ]}
            >
              {filteredCategories.map((category, index) => (
                <Row key={category.id} striped={index % 2 === 1}>
                  <Cell>{index + 1}</Cell>
                  <Cell className="font-semibold">{category.name}</Cell>
                  <Cell>
                    <StatusBadge
                      label={category.status}
                      variant={
                        category.status === "ACTIVE"
                          ? "success"
                          : "secondary"
                      }
                    />
                  </Cell>
                  <Cell>{category.items ?? "-"}</Cell>
                  <Cell>{new Date(category.createdAt).toLocaleDateString()}</Cell>
                  <Cell>
                    <RowActions
                      onView={() => handleViewDetail(category)}
                      onEdit={() => handleOpenForm(category)}
                      isLoading={isCreating || isUpdating}
                    />
                  </Cell>
                </Row>
              ))}
            </SimpleTable>
            <PaginationFooter />
          </>
        )}
      </DataCard>

      <FormModal
        open={formOpen}
        onOpenChange={handleCloseForm}
        title={isEditing ? "Edit Category" : "Create Category"}
        submitLabel={isEditing ? "Update Category" : "Create Category"}
        onSubmit={handleSubmitForm}
        isLoading={isCreating || isUpdating}
      >
        <ModalGrid>
          <FormInput
            label="Category Name *"
            placeholder="e.g., Iced Drinks"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            required
          />
          <FormSelect
            label="Status"
            value={formData.status}
            onChange={(e) =>
              setFormData({
                ...formData,
                status: e.target.value as CategoryStatus,
              })
            }
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </FormSelect>
        </ModalGrid>
      </FormModal>

      <DetailModal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        title="Category Details"
        onEdit={() => {
          setDetailOpen(false);
          if (selectedCategory) {
            handleOpenForm(selectedCategory);
          }
        }}
      >
        {selectedCategory && (
          <div className="rounded-lg bg-white p-4">
            <h3 className="mb-6 text-lg font-semibold">Category Information</h3>
            <DetailGrid>
              <DetailItem label="Name">{selectedCategory.name}</DetailItem>
              <DetailItem label="Status">
                <StatusBadge
                  label={selectedCategory.status}
                  variant={
                    selectedCategory.status === "ACTIVE"
                      ? "success"
                      : "secondary"
                  }
                />
              </DetailItem>
              <DetailItem label="Items">{selectedCategory.items ?? "-"}</DetailItem>
              <DetailItem label="Created">
                {new Date(selectedCategory.createdAt).toLocaleString()}
              </DetailItem>
              {selectedCategory.updatedAt && (
                <DetailItem label="Updated">
                  {new Date(selectedCategory.updatedAt).toLocaleString()}
                </DetailItem>
              )}
            </DetailGrid>
          </div>
        )}
      </DetailModal>
    </PageShell>
  );
}
