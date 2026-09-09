"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { type DateRange } from "react-day-picker";
import { PageShell } from "@/components/common/PageShell";
import { PageHeader } from "@/components/common/PageHeader";
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
  SimpleTable,
  StatTile,
  StatusBadge,
  TableActions,
  TextField,
} from "@/components/common/AdminKit";
import {
  getProductOptionById,
  MOCK_STOCK_PRODUCTS,
  STATIC_INVENTORY_ROWS,
  type InventoryListRow,
} from "@/features/inventory/constants/inventory.mock";
import { useInventory, useAdjustInventory } from "@/hooks/useAdmin";

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
          placeholder="Select Method"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="in stock">In Stock</option>
          <option value="low stock">Low Stock</option>
          <option value="out of stock">Out of Stock</option>
        </SelectField>
        <DateField
          label="Select Date Range"
          value={dateRange}
          onChange={setDateRange}
        />
        <FilterActions />
      </FilterPanel>

      <DataCard
        title="Inventory"
        meta="Total Items: 5 Products"
        actions={
          <TableActions
            onRegister={() => handleOpenForm(MOCK_STOCK_PRODUCTS[0])}
            primaryLabel="Stock Adjustment"
            showRegister
          />
        }
      >
        <SimpleTable headers={[...INVENTORY_TABLE_HEADERS]}>
          {hasApiData
            ? filteredItems.map((item, index) => (
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
            : STATIC_INVENTORY_ROWS.map((row, index) => (
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
        <PaginationFooter />
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
            <div className="inventory_form_summary md:col-span-3">
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
            placeholder="Select Method"
            value={adjustmentType}
            onChange={(e) => setAdjustmentType(e.target.value as AdjustmentType)}
          >
            <option value="ADD">Add Stock</option>
            <option value="REMOVE">Remove Stock</option>
            <option value="SET">Set Stock</option>
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
