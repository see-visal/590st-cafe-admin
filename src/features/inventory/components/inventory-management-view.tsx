"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { type DateRange } from "react-day-picker";
import { PageShell } from "@/components/shared/page-shell";
import { PageHeader } from "@/components/shared/page-header";
import {
  AdminTopActions,
  Cell,
  DataCard,
  DateField,
  FilterActions,
  FilterPanel,
  FormInput,
  FormModal,
  FormProductSelect,
  FormSelect,
  FormTextarea,
  ModalGrid,
  PaginationFooter,
  ProductSelectOption,
  Row,
  RowActions,
  SelectField,
  SelectItem,
  SimpleTable,
  StatTile,
  StatusBadge,
  TableActions,
  TextField,
} from "@/components/shared/admin-kit";
import {
  getProductOptionById,
  MOCK_STOCK_PRODUCTS,
  STATIC_INVENTORY_ROWS,
  type InventoryListRow,
} from "@/features/inventory/constants/inventory.mock";
import { useInventory } from "@/features/inventory/hooks/use-inventory";
import { useAdjustInventory } from "@/features/inventory/hooks/use-adjust-inventory";
import { autoColumns, downloadCsv } from "@/lib/export-csv";
import { usePagination } from "@/hooks/use-pagination";

const INVENTORY_TABLE_HEADERS = [
  "No",
  "Product Name",
  "SKU",
  "Current Stock",
  "Unit",
  "Status",
  "Action",
] as const;

type AdjustmentType = "ADD" | "REMOVE" | "SET";

interface InventoryItem {
  id: number;
  item: string;
  amount: number;
  status: string;
}

function getStatusTone(status: string): "success" | "danger" | "warning" {
  const normalized = status.toLowerCase();
  if (normalized.includes("low")) return "warning";
  if (normalized.includes("out")) return "danger";
  return "success";
}

function calculateNewQuantity(
  current: number,
  quantity: number,
  adjustmentType: AdjustmentType
) {
  if (adjustmentType === "ADD") return current + quantity;
  if (adjustmentType === "REMOVE") return Math.max(0, current - quantity);
  return quantity;
}

export default function Inventory() {
  const router = useRouter();
  const { inventory, refetch } = useInventory();
  const { adjust, isLoading: isAdjusting } = useAdjustInventory();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [formOpen, setFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductSelectOption | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>("ADD");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");

  const items = useMemo(() => {
    return (inventory as unknown as InventoryItem[]) || [];
  }, [inventory]);

  const hasApiData = items.length > 0;

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.item.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        !statusFilter || item.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [items, searchTerm, statusFilter]);

  const parsedQuantity = parseInt(quantity, 10) || 0;
  const newQuantity = selectedProduct
    ? calculateNewQuantity(
        selectedProduct.currentStock,
        parsedQuantity,
        adjustmentType
      )
    : 0;

  const handleOpenForm = (product?: ProductSelectOption | null) => {
    setSelectedProduct(product ?? null);
    setAdjustmentType("ADD");
    setQuantity("");
    setReason("");
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setSelectedProduct(null);
    setQuantity("");
    setReason("");
  };

  const handleOpenFormFromRow = (row: InventoryListRow) => {
    handleOpenForm(getProductOptionById(row.productId) ?? null);
  };

  const handleViewDetail = (productId: string) => {
    router.push(`/inventory/${productId}`);
  };

  const handleSubmitForm = async () => {
    if (!selectedProduct) {
      alert("Please select a product");
      return;
    }
    if (!parsedQuantity && adjustmentType !== "SET") {
      alert("Please enter a quantity");
      return;
    }

    try {
      const inventoryId = parseInt(selectedProduct.id, 10);
      const delta =
        adjustmentType === "ADD"
          ? parsedQuantity
          : adjustmentType === "REMOVE"
          ? -parsedQuantity
          : newQuantity - selectedProduct.currentStock;
      await adjust(inventoryId, delta);
      handleCloseForm();
      refetch();
    } catch (err) {
      console.error("Adjustment failed:", err);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setDateRange(undefined);
  };

  const apiPage = usePagination(filteredItems);
  const mockPage = usePagination(STATIC_INVENTORY_ROWS);
  const activePage = hasApiData ? apiPage : mockPage;

  const handleExport = () =>
    downloadCsv("inventory", filteredItems as never[], autoColumns(filteredItems as never[]));

  return (
    <PageShell>
      <PageHeader
        title="Inventory List"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Inventory" },
          { label: "Inventory List" },
        ]}
        rightSlot={<AdminTopActions />}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatTile title="Total Products" value="5" tone="gray" />
        <StatTile title="In Stock" value="3" tone="green" />
        <StatTile title="Low Stock" value="2" tone="orange" />
      </div>

      <FilterPanel>
        <TextField
          label="Product Name"
          placeholder="Placeholder"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <SelectField
          label="Status"
          value={statusFilter}
          onValueChange={(e) => setStatusFilter(e)}
        >
          <SelectItem value="in stock">In Stock</SelectItem>
          <SelectItem value="low stock">Low Stock</SelectItem>
          <SelectItem value="out of stock">Out of Stock</SelectItem>
        </SelectField>
        <DateField
          label="Select Date Range"
          value={dateRange}
          onChange={setDateRange}
        />
        <FilterActions onClear={handleClearFilters} />
      </FilterPanel>

      <DataCard
        title="Inventory"
        meta="Total Items: 5 Products"
        actions={
          <TableActions
            onExport={handleExport}
            onRegister={() => handleOpenForm(MOCK_STOCK_PRODUCTS[0])}
            primaryLabel="Stock Adjustment"
            showRegister
          />
        }
      >
        <SimpleTable headers={[...INVENTORY_TABLE_HEADERS]}>
          {hasApiData
            ? apiPage.pageRows.map((item, index) => (
                <Row key={item.id} striped={index % 2 === 1}>
                  <Cell>{index + 1}</Cell>
                  <Cell className="font-semibold">{item.item}</Cell>
                  <Cell>SKU-{String(item.id).padStart(3, "0")}</Cell>
                  <Cell>{item.amount.toLocaleString()}</Cell>
                  <Cell>units</Cell>
                  <Cell>
                    <StatusBadge
                      label={item.status}
                      tone={getStatusTone(item.status)}
                    />
                  </Cell>
                  <Cell>
                    <RowActions
                      onView={() => handleViewDetail(String(item.id))}
                      onEdit={() =>
                        handleOpenForm(
                          MOCK_STOCK_PRODUCTS.find(
                            (product) => product.name === item.item
                          ) ?? null
                        )
                      }
                    />
                  </Cell>
                </Row>
              ))
            : mockPage.pageRows.map((row, index) => (
                <Row key={row.id} striped={index % 2 === 1}>
                  <Cell>{index + 1}</Cell>
                  <Cell className="font-semibold">{row.name}</Cell>
                  <Cell>{row.sku}</Cell>
                  <Cell>{row.stock}</Cell>
                  <Cell>{row.unit}</Cell>
                  <Cell>
                    <StatusBadge label={row.status} tone={getStatusTone(row.status)} />
                  </Cell>
                  <Cell>
                    <RowActions
                      onView={() => handleViewDetail(row.productId)}
                      onEdit={() => handleOpenFormFromRow(row)}
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

      <FormModal
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseForm();
        }}
        title="Stock Adjustment"
        submitLabel="Submit"
        onSubmit={handleSubmitForm}
        isLoading={isAdjusting}
      >
        <ModalGrid>
          <div className="md:col-span-3">
            <FormProductSelect
              label="Select Product"
              required
              options={MOCK_STOCK_PRODUCTS}
              value={selectedProduct}
              onChange={setSelectedProduct}
            />
          </div>

          {selectedProduct && (
            <div className="grid grid-cols-1 gap-4 rounded-lg border border-[#EDEDED] bg-white p-4 md:col-span-3 md:grid-cols-3">
              <FormInput label="Product Name" value={selectedProduct.name} readOnly />
              <FormInput label="SKU" value={selectedProduct.sku} readOnly />
              <FormInput
                label="Current Stock"
                value={`${selectedProduct.currentStock} ${selectedProduct.unit}`}
                readOnly
              />
            </div>
          )}

          <FormSelect
            label="Adjustment Type"
            required
            value={adjustmentType}
            onValueChange={(e) => setAdjustmentType(e as AdjustmentType)}
          >
            <SelectItem value="ADD">Add Stock</SelectItem>
            <SelectItem value="REMOVE">Remove Stock</SelectItem>
            <SelectItem value="SET">Set Stock</SelectItem>
          </FormSelect>
          <FormInput
            label="Quantity"
            required
            type="number"
            placeholder="Enter quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
          <FormInput
            label="New Quantity"
            value={selectedProduct ? String(newQuantity) : ""}
            readOnly
          />
          <div className="md:col-span-3">
            <FormTextarea
              label="Reason / Notes"
              placeholder="Enter reason for adjustment..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
            />
          </div>
        </ModalGrid>
      </FormModal>
    </PageShell>
  );
}
