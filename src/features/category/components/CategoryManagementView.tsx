"use client";

import { useMemo, useState } from "react";
import { type DateRange } from "react-day-picker";
import { PageShell } from "@/components/common/PageShell";
import { PageHeader } from "@/components/common/PageHeader";
import {
  AdminTopActions,
  Cell,
  DataCard,
  DateField,
  DetailGrid,
  DetailItem,
  DetailImage,
  DetailModal,
  FilterActions,
  FilterPanel,
  FormInput,
  FormModal,
  FormSelect,
  FormImageUpload,
  ModalGrid,
  PaginationFooter,
  Row,
  RowActions,
  SelectField,
  SimpleTable,
  StatTile,
  StatusBadge,
  TableActions,
  TextField,
  Thumbnail,
} from "@/components/common/AdminKit";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
} from "@/features/product/hooks/useProducts";
import { Category, CategoryRequest, CategoryStatus } from "@/features/product/types/product.type";

const CATEGORY_TABLE_HEADERS = [
  "No",
  "Image",
  "Category Name",
  "Description",
  "Total Products",
  "Created Date",
  "Status",
  "Action",
] as const;

const STATIC_CATEGORY_ROWS = [
  {
    id: "static-1",
    name: "Coffee",
    description: "Espresso-based drinks, cold brews, and seasonal specials",
    totalProducts: 42,
    createdDate: "10-Jan-2025",
    status: "Active",
    parentCategory: "1",
    sortOrder: "1",
  },
  {
    id: "static-2",
    name: "Tea",
    description: "Hot and iced teas, herbal infusions, and bubble tea",
    totalProducts: 28,
    createdDate: "10-Jan-2025",
    status: "Active",
    parentCategory: "1",
    sortOrder: "2",
  },
  {
    id: "static-3",
    name: "Pastries",
    description: "Fresh baked goods, croissants, muffins, and cakes",
    totalProducts: 35,
    createdDate: "10-Jan-2025",
    status: "Active",
    parentCategory: "1",
    sortOrder: "3",
  },
  {
    id: "static-4",
    name: "Smoothies",
    description: "Fruit smoothies, protein shakes, and blended drinks",
    totalProducts: 19,
    createdDate: "10-Jan-2025",
    status: "Inactive",
    parentCategory: "1",
    sortOrder: "4",
  },
  {
    id: "static-5",
    name: "Snacks",
    description: "Light bites, chips, nuts, and packaged snacks",
    totalProducts: 15,
    createdDate: "10-Jan-2025",
    status: "Active",
    parentCategory: "1",
    sortOrder: "5",
  },
] as const;

type StaticCategoryRow = (typeof STATIC_CATEGORY_ROWS)[number];

type CategoryDetailView = {
  name: string;
  description: string;
  parentCategory: string;
  sortOrder: string;
  status: string;
  imageUrl?: string;
  editCategory?: Category;
};

type CategoryFormFields = {
  name: string;
  description: string;
  parentCategoryId: string;
  sortOrder: string;
  status?: CategoryStatus;
  imageUrl: string;
};

const EMPTY_FORM: CategoryFormFields = {
  name: "",
  description: "",
  parentCategoryId: "",
  sortOrder: "",
  status: undefined,
  imageUrl: "",
};

function formatCreatedDate(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }
  return parsed
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .replace(/ /g, "-");
}

function getStatusTone(status: string): "success" | "danger" {
  return status.toUpperCase() === "ACTIVE" || status === "Active"
    ? "success"
    : "danger";
}

function getStatusLabel(status: CategoryStatus | string) {
  if (status === "ACTIVE" || status === "Active") return "Active";
  if (status === "INACTIVE" || status === "Inactive") return "Inactive";
  return status;
}

export default function Categories() {
  const { categories = [], refetch } = useCategories();
  const { create: createCategory, isLoading: isCreating } = useCreateCategory();
  const { update: updateCategory, isLoading: isUpdating } = useUpdateCategory();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [detailView, setDetailView] = useState<CategoryDetailView | null>(null);
  const [formFields, setFormFields] = useState<CategoryFormFields>(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const hasApiData = categories.length > 0;

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
      setFormFields({
        name: category.name,
        description: "Espresso-based drinks, cold brews, and seasonal specials",
        parentCategoryId: "1",
        sortOrder: String(category.items ?? "1"),
        status: category.status,
        imageUrl: "",
      });
      setImageFile(null);
    } else {
      setIsEditing(false);
      setSelectedCategory(null);
      setFormFields(EMPTY_FORM);
      setImageFile(null);
    }
    setFormOpen(true);
  };

  const handleOpenMockForm = (row: StaticCategoryRow) => {
    setIsEditing(true);
    setSelectedCategory(null);
    setFormFields({
      name: row.name,
      description: row.description,
      parentCategoryId: row.parentCategory,
      sortOrder: row.sortOrder,
      status: row.status === "Active" ? "ACTIVE" : "INACTIVE",
      imageUrl: "",
    });
    setImageFile(null);
    setFormOpen(true);
  };

  const handleOpenFormFromDetail = (detail: CategoryDetailView) => {
    setIsEditing(true);
    setSelectedCategory(detail.editCategory ?? null);
    setFormFields({
      name: detail.name,
      description: detail.description,
      parentCategoryId: detail.parentCategory,
      sortOrder: detail.sortOrder,
      status:
        detail.status === "Active"
          ? "ACTIVE"
          : detail.status === "Inactive"
          ? "INACTIVE"
          : undefined,
      imageUrl: detail.imageUrl ?? "",
    });
    setImageFile(null);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setIsEditing(false);
    setSelectedCategory(null);
    setFormFields(EMPTY_FORM);
    setImageFile(null);
  };

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    setFormFields((prev) => ({
      ...prev,
      imageUrl: file ? URL.createObjectURL(file) : prev.imageUrl || "",
    }));
  };

  const handleSubmitForm = async () => {
    if (!formFields.name.trim()) {
      alert("Please enter a category name");
      return;
    }

    const payload: CategoryRequest = {
      name: formFields.name.trim(),
      status: formFields.status ?? "ACTIVE",
    };

    try {
      if (isEditing && selectedCategory) {
        await updateCategory(selectedCategory.id, payload);
      } else {
        await createCategory(payload);
      }
      handleCloseForm();
      refetch();
    } catch (error) {
      console.error("Category form error:", error);
    }
  };

  const handleViewDetail = (category: Category) => {
    setSelectedCategory(category);
    setDetailView({
      name: category.name,
      description: "Espresso-based drinks, cold brews, and seasonal specials",
      parentCategory: "1",
      sortOrder: String(category.items ?? "1"),
      status: getStatusLabel(category.status),
      editCategory: category,
    });
    setDetailOpen(true);
  };

  const handleViewMockDetail = (row: StaticCategoryRow) => {
    setSelectedCategory(null);
    setDetailView({
      name: row.name,
      description: row.description,
      parentCategory: row.parentCategory,
      sortOrder: row.sortOrder,
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

  return (
    <PageShell>
      <PageHeader
        title="Categories List"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Categories" },
          { label: "Categories List" },
        ]}
        rightSlot={<AdminTopActions />}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatTile title="All Categories" value="3" tone="gray" />
        <StatTile title="Drink Focus" value="3" tone="gray" />
        <StatTile title="Food Focus" value="0" tone="gray" />
      </div>

      <FilterPanel>
        <TextField
          label="Category Name"
          placeholder="Placeholder"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <SelectField
          label="Status"
          placeholder="Select Method"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </SelectField>
        <DateField
          label="Select Date Range"
          value={dateRange}
          onChange={setDateRange}
        />
        <FilterActions />
      </FilterPanel>

      <DataCard
        title="Categories"
        meta="Total Categories: 28 Categories"
        actions={<TableActions onRegister={() => handleOpenForm()} primaryLabel="Register" />}
      >
        <SimpleTable headers={[...CATEGORY_TABLE_HEADERS]}>
          {hasApiData
            ? filteredCategories.map((category, index) => (
                <Row key={category.id} striped={index % 2 === 1}>
                  <Cell>{index + 1}</Cell>
                  <Cell>
                    <Thumbnail />
                  </Cell>
                  <Cell className="font-semibold">{category.name}</Cell>
                  <Cell>Espresso-based drinks, cold brews, and seasonal specials</Cell>
                  <Cell>{category.items ?? "-"}</Cell>
                  <Cell>{formatCreatedDate(category.createdAt)}</Cell>
                  <Cell>
                    <StatusBadge
                      label={getStatusLabel(category.status)}
                      tone={getStatusTone(category.status)}
                    />
                  </Cell>
                  <Cell>
                    <RowActions
                      onView={() => handleViewDetail(category)}
                      onEdit={() => handleOpenForm(category)}
                      onDelete={() => undefined}
                      isLoading={isCreating || isUpdating}
                    />
                  </Cell>
                </Row>
              ))
            : STATIC_CATEGORY_ROWS.map((category, index) => (
                <Row key={category.id} striped={index % 2 === 1}>
                  <Cell>{index + 1}</Cell>
                  <Cell>
                    <Thumbnail />
                  </Cell>
                  <Cell className="font-semibold">{category.name}</Cell>
                  <Cell>{category.description}</Cell>
                  <Cell>{category.totalProducts}</Cell>
                  <Cell>{category.createdDate}</Cell>
                  <Cell>
                    <StatusBadge
                      label={category.status}
                      tone={getStatusTone(category.status)}
                    />
                  </Cell>
                  <Cell>
                    <RowActions
                      onView={() => handleViewMockDetail(category)}
                      onEdit={() => handleOpenMockForm(category)}
                      onDelete={() => undefined}
                    />
                  </Cell>
                </Row>
              ))}
        </SimpleTable>
        <PaginationFooter />
      </DataCard>

      <FormModal
        open={formOpen}
        onOpenChange={handleCloseForm}
        title="Category Register/Modify"
        submitLabel="Submit"
        onSubmit={handleSubmitForm}
        isLoading={isCreating || isUpdating}
      >
        <ModalGrid>
          <FormInput
            label="Category Name"
            placeholder="Placeholder"
            value={formFields.name}
            onChange={(e) =>
              setFormFields({ ...formFields, name: e.target.value })
            }
            required
          />
          <FormInput
            label="Description"
            placeholder="Placeholder"
            value={formFields.description}
            onChange={(e) =>
              setFormFields({ ...formFields, description: e.target.value })
            }
          />
          <FormSelect
            label="Status"
            placeholder="Select Method"
            value={formFields.status ?? ""}
            onChange={(e) =>
              setFormFields({
                ...formFields,
                status: (e.target.value || undefined) as CategoryStatus | undefined,
              })
            }
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </FormSelect>
          <FormSelect
            label="Parent Category"
            placeholder="Select Method"
            value={formFields.parentCategoryId}
            onChange={(e) =>
              setFormFields({
                ...formFields,
                parentCategoryId: e.target.value,
              })
            }
          >
            {categories.length > 0
              ? categories.map((cat) => (
                  <option key={cat.id} value={String(cat.id)}>
                    {cat.name}
                  </option>
                ))
              : (
                <>
                  <option value="1">1</option>
                  <option value="2">2</option>
                </>
              )}
          </FormSelect>
          <FormInput
            label="Sort Order"
            placeholder="e.g. 1"
            value={formFields.sortOrder}
            onChange={(e) =>
              setFormFields({ ...formFields, sortOrder: e.target.value })
            }
          />
          <div className="md:col-span-3">
            <FormImageUpload
              label="Upload Category Image"
              file={imageFile}
              onChange={handleImageChange}
            />
          </div>
        </ModalGrid>
      </FormModal>

      <DetailModal
        open={detailOpen}
        onOpenChange={handleDetailOpenChange}
        title="Category Detail"
        onEdit={() => {
          const currentDetail = detailView;
          const categoryToEdit = detailView?.editCategory;
          setDetailOpen(false);
          setDetailView(null);
          if (categoryToEdit) {
            handleOpenForm(categoryToEdit);
          } else if (currentDetail) {
            handleOpenFormFromDetail(currentDetail);
          } else {
            handleOpenForm();
          }
        }}
      >
        {detailView && (
          <div className="admin_modal_form_wrap">
            <DetailGrid>
              <DetailItem label="Category Name">{detailView.name}</DetailItem>
              <DetailItem label="Description">{detailView.description}</DetailItem>
              <DetailItem label="Parent Category">{detailView.parentCategory}</DetailItem>
              <DetailItem label="Sort Order">{detailView.sortOrder}</DetailItem>
              <DetailItem label="Status">
                <StatusBadge label="Paid" tone="success" />
              </DetailItem>
              <div className="detail_item">
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
