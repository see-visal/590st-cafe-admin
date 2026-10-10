"use client";

import { useCallback, useMemo } from "react";
import toast from "react-hot-toast";
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
  StatTile,
  StatusBadge,
  TableActions,
  TableState,
  listLoadState,
  TextField,
} from "@/components/common/AdminKit";
import { apiErrorMessage } from "@/store/api/baseApi";
import { usePageSize } from "@/contexts/AdminPreferencesContext";
import {
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useListCategoriesQuery,
  useUpdateCategoryMutation,
} from "@/store/api/categoryApi";
import { useListProductsQuery } from "@/store/api/productApi";
import { useCurrentRole } from "@/store/api/useCurrentRole";
import type { CategoryGroup, CategoryResponse, Status } from "@/store/api/types";
import { humanise, titleCase } from "@/lib/utils";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { useCatalogAlerts } from "@/hooks/useCatalogAlerts";
import { usePersistentState } from "@/hooks/usePersistentState";
import { filteredPage, filteredQueryArgs } from "@/hooks/useFilteredPaging";
import { parseForm } from "@/lib/validation";
import { categorySchema } from "@/lib/formSchemas";

const CATEGORY_GROUPS: CategoryGroup[] = ["FRESH_DRINK", "BEVERAGE", "SNACK"];

const CATEGORY_TABLE_HEADERS = [
  "No",
  "Category Name",
  "Description",
  "Total Products",
  "Created Date",
  "Created By",
  "Status",
  "Action",
] as const;

type CategoryFormFields = {
  name: string;
  description: string;
  status: Status;
  categoryGroup: CategoryGroup | "";
};

const EMPTY_FORM: CategoryFormFields = {
  name: "",
  description: "",
  status: "ACTIVE",
  categoryGroup: "",
};

function formatCreatedDate(date: string | null) {
  if (!date) return "-";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed
    .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    .replace(/ /g, "-");
}

function statusTone(status: Status): "success" | "danger" {
  return status === "ACTIVE" ? "success" : "danger";
}

function statusLabel(status: Status) {
  return status === "ACTIVE" ? "Active" : "Inactive";
}

export default function Categories() {
  const { isAdmin } = useCurrentRole();
  const { confirm, confirmDialog } = useConfirmDialog();
  const [page, setPage] = usePersistentState("categories:page", 1);
  const [size, setSize] = usePageSize();
  const [searchTerm, setSearchTerm] = usePersistentState("categories:searchTerm", "");
  const [filterStatus, setFilterStatus] = usePersistentState("categories:filterStatus", "");
  const isFiltering = Boolean(searchTerm.trim() || filterStatus);

  const {
    data: categoryPage,
    currentData,
    isFetching,
    error,
    refetch,
  } = useListCategoriesQuery(filteredQueryArgs(page, size, isFiltering));
  const list = listLoadState({ isFetching, currentData, error });

  const { data: productPage, refetch: refetchProducts } = useListProductsQuery({ page: 1, size: 500 });

  useCatalogAlerts(
    useCallback(() => {
      void refetch();
      void refetchProducts();
    }, [refetch, refetchProducts])
  );

  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const [formOpen, setFormOpen] = usePersistentState("categories:formOpen", false);
  const [detailOpen, setDetailOpen] = usePersistentState("categories:detailOpen", false);
  const [selected, setSelected] = usePersistentState<CategoryResponse | null>("categories:selected", null);
  const [formFields, setFormFields] = usePersistentState<CategoryFormFields>("categories:formFields", EMPTY_FORM);

  const categories = useMemo(() => categoryPage?.content ?? [], [categoryPage]);

  const productCountByCategory = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of productPage?.content ?? []) {
      counts.set(product.categoryId, (counts.get(product.categoryId) ?? 0) + 1);
    }
    return counts;
  }, [productPage]);

  const matchingCategories = useMemo(
    () =>
      categories.filter((category) => {
        const matchesSearch = category.name
          .toLowerCase()
          .includes(searchTerm.trim().toLowerCase());
        const matchesStatus = !filterStatus || category.status === filterStatus;
        return matchesSearch && matchesStatus;
      }),
    [categories, searchTerm, filterStatus]
  );
  const view = filteredPage(matchingCategories, categoryPage, page, size, isFiltering);
  const visibleCategories = view.rows;

  const activeCount = categories.filter((c) => c.status === "ACTIVE").length;

  const handleOpenForm = (category?: CategoryResponse) => {
    if (!isAdmin) return;
    setSelected(category ?? null);
    setFormFields(
      category
        ? {
            name: category.name,
            description: category.description ?? "",
            status: category.status,
            categoryGroup: category.categoryGroup ?? "",
          }
        : EMPTY_FORM
    );
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setSelected(null);
    setFormFields(EMPTY_FORM);
  };

  const handleSubmitForm = async () => {
    if (!isAdmin) return;
    const parsed = parseForm(categorySchema, formFields);
    if (!parsed) return;
    const { name, description } = parsed;
    const categoryGroup = formFields.categoryGroup || undefined;

    try {
      if (selected) {
        await updateCategory({
          id: selected.id,
          body: { name, description, status: formFields.status, categoryGroup },
        }).unwrap();
        toast.success("Category updated");
      } else {
        await createCategory({ name, description, categoryGroup }).unwrap();
        toast.success("Category created");
      }
      handleCloseForm();
    } catch (err) {
      toast.error(apiErrorMessage(err as never, "Could not save the category."));
    }
  };

  const handleDelete = async (category: CategoryResponse) => {
    if (!isAdmin) return;
    if (!(await confirm({ title: "Delete category", description: `Delete category "${category.name}"?`, confirmLabel: "Delete", tone: "danger" }))) return;
    try {
      await deleteCategory(category.id).unwrap();
      toast.success("Category deleted");
    } catch (err) {
      toast.error(apiErrorMessage(err as never, "Could not delete the category."));
    }
  };

  const handleViewDetail = (category: CategoryResponse) => {
    setSelected(category);
    setDetailOpen(true);
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
        <StatTile
          title="All Categories"
          value={String(categoryPage?.totalElements ?? 0)}
          tone="gray"
        />
        <StatTile title="Active (this page)" value={String(activeCount)} tone="gray" />
        <StatTile
          title="Products Categorised"
          value={String(productPage?.totalElements ?? 0)}
          tone="gray"
        />
      </div>

      <FilterPanel>
        <TextField
          label="Category Name"
          placeholder="Search by name"
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
        />
        <SelectField
          label="Status"
          placeholder="All statuses"
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
        >
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </SelectField>
        <FilterActions onClear={() => { setSearchTerm(""); setFilterStatus(""); setPage(1); }} onSearch={refetch} />
      </FilterPanel>

      <DataCard
        title="Categories"
        meta={`Total Categories: ${categoryPage?.totalElements ?? 0}`}
        actions={
          isAdmin ? <TableActions onRegister={() => handleOpenForm()} primaryLabel="Register" /> : undefined
        }
      >
        <SimpleTable headers={[...CATEGORY_TABLE_HEADERS]}>
          <TableState
            colSpan={CATEGORY_TABLE_HEADERS.length}
            isLoading={list.isLoading}
            error={list.error}
            isEmpty={visibleCategories.length === 0}
            emptyLabel={isFiltering ? "No categories match these filters." : isAdmin ? "No categories yet. Use Register to add the first one." : "No categories found."}
            onRetry={refetch}
          />
          {list.showRows &&
            visibleCategories.map((category, index) => (
              <Row key={category.id} striped={index % 2 === 1}>
                <Cell>{view.offset + index + 1}</Cell>
                <Cell className="font-semibold">{titleCase(category.name)}</Cell>
                <Cell>{category.description || "-"}</Cell>
                <Cell>{productCountByCategory.get(category.id) ?? 0}</Cell>
                <Cell>{formatCreatedDate(category.createdAt)}</Cell>
                <Cell>{category.createdByName ? titleCase(category.createdByName) : "-"}</Cell>
                <Cell>
                  <StatusBadge
                    label={statusLabel(category.status)}
                    tone={statusTone(category.status)}
                  />
                </Cell>
                <Cell>
                  <RowActions
                    onView={() => handleViewDetail(category)}
                    onEdit={isAdmin ? () => handleOpenForm(category) : undefined}
                    onDelete={isAdmin ? () => handleDelete(category) : undefined}
                    isLoading={isCreating || isUpdating}
                  />
                </Cell>
              </Row>
            ))}
        </SimpleTable>
        <PaginationFooter
          page={view.page}
          totalPages={view.totalPages}
          size={size}
          totalElements={view.totalElements}
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
        title={selected ? "Modify Category" : "Register Category"}
        submitLabel="Submit"
        onSubmit={handleSubmitForm}
        isLoading={isCreating || isUpdating}
      >
        <ModalGrid>
          <FormInput
            label="Category Name"
            placeholder="e.g. Coffee"
            value={formFields.name}
            onChange={(e) => setFormFields({ ...formFields, name: e.target.value })}
            required
          />
          <FormInput
            label="Description"
            placeholder="Short description"
            value={formFields.description}
            onChange={(e) =>
              setFormFields({ ...formFields, description: e.target.value })
            }
          />
          <FormSelect
            label="Menu Group"
            placeholder="Internal (not on the customer menu)"
            value={formFields.categoryGroup}
            onChange={(e) =>
              setFormFields({ ...formFields, categoryGroup: e.target.value as CategoryGroup })
            }
          >
            {CATEGORY_GROUPS.map((group) => (
              <option key={group} value={group}>
                {humanise(group)}
              </option>
            ))}
          </FormSelect>
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
        </ModalGrid>
      </FormModal>

      <DetailModal
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) setSelected(null);
        }}
        title="Category Detail"
        onEdit={isAdmin ? () => {
          const category = selected;
          setDetailOpen(false);
          if (category) handleOpenForm(category);
        } : undefined}
      >
        {selected && (
          <div className="admin_modal_form_wrap">
            <DetailGrid>
              <DetailItem label="Category Name">{titleCase(selected.name)}</DetailItem>
              <DetailItem label="Description">{selected.description || "-"}</DetailItem>
              <DetailItem label="Menu Group">
                {selected.categoryGroup ? humanise(selected.categoryGroup) : "Internal (not on the customer menu)"}
              </DetailItem>
              <DetailItem label="Total Products">
                {productCountByCategory.get(selected.id) ?? 0}
              </DetailItem>
              <DetailItem label="Status">
                <StatusBadge
                  label={statusLabel(selected.status)}
                  tone={statusTone(selected.status)}
                />
              </DetailItem>
              <DetailItem label="Created">
                {formatCreatedDate(selected.createdAt)}
                {selected.createdByName ? ` by ${titleCase(selected.createdByName)}` : ""}
              </DetailItem>
              <DetailItem label="Last Updated">
                {formatCreatedDate(selected.updatedAt)}
                {selected.updatedByName ? ` by ${titleCase(selected.updatedByName)}` : ""}
              </DetailItem>
            </DetailGrid>
          </div>
        )}
      </DetailModal>
      {confirmDialog}
    </PageShell>
  );
}
