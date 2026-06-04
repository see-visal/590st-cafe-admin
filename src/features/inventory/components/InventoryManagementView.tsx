"use client";

import { useEffect, useState, useMemo } from "react";
import { PageShell } from "@/components/common/PageShell";
import { PageHeader } from "@/components/common/PageHeader";
import {
  AdminTopActions,
  Cell,
  DataCard,
  FilterActions,
  FilterPanel,
  FormInput,
  FormModal,
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
} from "@/components/common/AdminKit";
import { useInventory, useAdjustInventory } from "@/hooks/useAdmin";

interface InventoryItem {
  id: number;
  item: string;
  amount: number;
  status: string;
}

export default function Inventory() {
  const { inventory, isLoading, refetch } = useInventory();
  const { adjust, isLoading: isAdjusting } = useAdjustInventory();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(0);

  // Load data
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Cast inventory items safely from API structure
  const items = useMemo(() => {
    return (inventory as unknown as InventoryItem[]) || [];
  }, [inventory]);

  // Filters
  const filteredItems = useMemo(() => {
    return items.filter((i) => {
      const matchesSearch = i.item.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || i.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [items, searchTerm, statusFilter]);

  // Stat counts
  const totalItems = items.length;
  const lowStockCount = items.filter((i) => i.status.toLowerCase() === "low").length;
  const inStockCount = totalItems - lowStockCount;

  const handleOpenForm = (item: InventoryItem) => {
    setSelectedItem(item);
    setAdjustAmount(0);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setSelectedItem(null);
  };

  const handleSubmitForm = async () => {
    if (!selectedItem) return;
    try {
      await adjust(selectedItem.id, adjustAmount);
      handleCloseForm();
      refetch();
    } catch (err) {
      console.error("Adjustment failed:", err);
    }
  };

  return (
    <PageShell>
      <PageHeader
        title="Inventory"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Inventory" }]}
        rightSlot={<AdminTopActions />}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatTile title="Total Ingredients" value={String(totalItems)} hint="Tracked raw materials" />
        <StatTile
          title="Low Stock Warning"
          value={String(lowStockCount)}
          tone={lowStockCount > 0 ? "red" : "green"}
          hint="Items below threshold"
        />
        <StatTile title="In Stock" value={String(inStockCount)} tone="green" hint="Healthy stock levels" />
      </div>

      <FilterPanel>
        <TextField
          label="Ingredient Name"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <SelectField
          label="Stock Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="In Stock">In Stock</option>
          <option value="Low">Low Stock</option>
        </SelectField>
        <FilterActions />
      </FilterPanel>

      <DataCard
        title="Stock Directory"
        meta={`Ingredients found: ${filteredItems.length}`}
        actions={<TableActions primaryLabel="Add Ingredient" />}
      >
        {isLoading ? (
          <div className="py-8 text-center text-gray-500">Loading inventory...</div>
        ) : filteredItems.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No ingredients found</div>
        ) : (
          <>
            <SimpleTable headers={["No", "Ingredient Name", "Stock Quantity", "Status", "Action"]}>
              {filteredItems.map((item, index) => (
                <Row key={item.id} striped={index % 2 === 1}>
                  <Cell>{index + 1}</Cell>
                  <Cell className="font-semibold">{item.item}</Cell>
                  <Cell>{item.amount.toLocaleString()}</Cell>
                  <Cell>
                    <StatusBadge
                      label={item.status}
                      variant={item.status.toLowerCase() === "low" ? "destructive" : "success"}
                    />
                  </Cell>
                  <Cell>
                    <RowActions onEdit={() => handleOpenForm(item)} />
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
        title="Adjust Stock Quantity"
        onSubmit={handleSubmitForm}
        isLoading={isAdjusting}
        submitLabel="Apply Adjustment"
      >
        {selectedItem && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              Ingredient: <strong className="text-gray-900">{selectedItem.item}</strong>
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Current Stock: <strong className="text-gray-900">{selectedItem.amount} units</strong>
            </p>
            <ModalGrid>
              <FormInput
                label="Adjustment (use e.g. +10 or -5)"
                type="number"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(parseInt(e.target.value) || 0)}
                required
              />
            </ModalGrid>
          </div>
        )}
      </FormModal>
    </PageShell>
  );
}
