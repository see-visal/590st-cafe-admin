"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { PageShell } from "@/components/common/PageShell";
import { PageHeader } from "@/components/common/PageHeader";
import {
  AdminTopActions,
  Cell,
  DataCard,
  ExcelImportButton,
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
  TableState,
  listLoadState,
  TextField,
  MoneyField,
} from "@/components/common/AdminKit";
import { apiErrorMessage } from "@/store/api/baseApi";
import { usePageSize } from "@/contexts/AdminPreferencesContext";
import { useI18n } from "@/contexts/I18nContext";
import {
  useDownloadMonthlyStockExpenseReportMutation,
  useDownloadStockInImportTemplateMutation,
  useListInventoryQuery,
  useStockCutMutation,
  useStockInFromExcelMutation,
  useStockInMutation,
} from "@/store/api/inventoryApi";
import { useListProductsQuery } from "@/store/api/productApi";
import { useCurrentRole } from "@/store/api/useCurrentRole";
import type { InventoryResponse, StockStrategy } from "@/store/api/types";
import { downloadBlob, humanise, titleCase } from "@/lib/utils";
import { useInventoryAlerts } from "@/hooks/useInventoryAlerts";
import { usePersistentState } from "@/hooks/usePersistentState";
import { filteredPage, filteredQueryArgs } from "@/hooks/useFilteredPaging";
import { DatePickerInput } from "@/components/forms/DatePickerInput";
import { Download } from "lucide-react";
import { parseForm } from "@/lib/validation";
import { stockMovementSchema } from "@/lib/formSchemas";

type MovementKind = "STOCK_IN" | "STOCK_CUT";

type StockLevel = "OUT" | "LOW" | "OK";

function stockLevel(item: InventoryResponse): StockLevel {
  const onHand = Number(item.quantityOnHand);
  if (onHand <= 0) return "OUT";
  if (onHand <= Number(item.reorderLevel)) return "LOW";
  return "OK";
}

const LEVEL_TONE: Record<StockLevel, "success" | "warning" | "danger"> = {
  OUT: "danger",
  LOW: "warning",
  OK: "success",
};

export default function Inventory() {
  const { t } = useI18n();
  const { isAdmin } = useCurrentRole();
  const router = useRouter();

  const inventoryTableHeaders = [
    t("table.no", "No"),
    t("inventory.fields.product_name", "Product Name"),
    t("inventory.table.current_stock", "Current Stock"),
    t("fields.unit", "Unit"),
    t("inventory.fields.reorder_level", "Reorder Level"),
    t("fields.status", "Status"),
    t("table.action", "Action"),
  ];

  const levelLabel: Record<StockLevel, string> = {
    OUT: t("inventory.levels.out", "Out of Stock"),
    LOW: t("inventory.levels.low", "Low Stock"),
    OK: t("inventory.levels.ok", "In Stock"),
  };

  const [page, setPage] = usePersistentState("inventory:page", 1);
  const [size, setSize] = usePageSize();
  const [searchTerm, setSearchTerm] = usePersistentState("inventory:searchTerm", "");
  const [levelFilter, setLevelFilter] = usePersistentState("inventory:levelFilter", "");
  const isFiltering = Boolean(searchTerm.trim() || levelFilter);
  const [expenseMonth, setExpenseMonth] = usePersistentState("inventory:expenseMonth", () => new Date().toISOString().slice(0, 7));

  const {
    data: inventoryPage,
    currentData,
    isFetching,
    error,
    refetch,
  } = useListInventoryQuery(filteredQueryArgs(page, size, isFiltering));
  const list = listLoadState({ isFetching, currentData, error });

  useInventoryAlerts(useCallback(() => { void refetch(); }, [refetch]));

  const { data: productPage } = useListProductsQuery({ page: 1, size: 500 });

  const [stockIn, { isLoading: isStockingIn }] = useStockInMutation();
  const [stockCut, { isLoading: isCutting }] = useStockCutMutation();
  const [stockInFromExcel] = useStockInFromExcelMutation();
  const [downloadStockInTemplate] = useDownloadStockInImportTemplateMutation();
  const [downloadExpenseReport, { isLoading: isDownloadingExpenseReport }] =
    useDownloadMonthlyStockExpenseReportMutation();

  const handleDownloadExpenseReport = async () => {
    try {
      const blob = await downloadExpenseReport({ month: expenseMonth }).unwrap();
      downloadBlob(blob, `stock-expenses-${expenseMonth}.xlsx`);
    } catch (err) {
      toast.error(apiErrorMessage(err as never, t("inventory.errors.download_expense_report", "Could not download the expense report.")));
    }
  };

  const [formOpen, setFormOpen] = usePersistentState("inventory:formOpen", false);
  const [selectedProduct, setSelectedProduct] = usePersistentState<ProductSelectOption | null>("inventory:selectedProduct", null);
  const [movementKind, setMovementKind] = usePersistentState<MovementKind>("inventory:movementKind", "STOCK_IN");
  const [quantity, setQuantity] = usePersistentState("inventory:quantity", "");
  const [unitCost, setUnitCost] = usePersistentState("inventory:unitCost", "");
  const [strategy, setStrategy] = usePersistentState<StockStrategy>("inventory:strategy", "FIFO");
  const [note, setNote] = usePersistentState("inventory:note", "");

  const inventory = useMemo(() => inventoryPage?.content ?? [], [inventoryPage]);

  const productOptions = useMemo<ProductSelectOption[]>(
    () =>
      (productPage?.content ?? []).map((product) => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        currentStock: Number(product.quantityOnHand),
        unit: humanise(product.stockUnit),
      })),
    [productPage]
  );

  const matchingInventory = useMemo(
    () =>
      inventory.filter((item) => {
        const term = searchTerm.trim().toLowerCase();
        const matchesSearch = !term || item.productName.toLowerCase().includes(term);
        const matchesLevel = !levelFilter || stockLevel(item) === levelFilter;
        return matchesSearch && matchesLevel;
      }),
    [inventory, searchTerm, levelFilter]
  );
  const view = filteredPage(matchingInventory, inventoryPage, page, size, isFiltering);
  const visibleInventory = view.rows;

  const lowCount = inventory.filter((i) => stockLevel(i) === "LOW").length;
  const outCount = inventory.filter((i) => stockLevel(i) === "OUT").length;

  const handleOpenForm = (item?: InventoryResponse) => {
    if (!isAdmin) return;
    const option = item
      ? productOptions.find((p) => p.id === item.productId) ?? {
          id: item.productId,
          name: item.productName,
          sku: "-",
          currentStock: Number(item.quantityOnHand),
          unit: humanise(item.unit),
        }
      : null;
    setSelectedProduct(option);
    setMovementKind("STOCK_IN");
    setQuantity("");
    setUnitCost("");
    setStrategy("FIFO");
    setNote("");
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    if (!isAdmin) return;
    const parsed = parseForm(stockMovementSchema(movementKind), {
      productId: selectedProduct?.id ?? "",
      quantity,
      unitCost,
      note,
    });
    if (!parsed || !selectedProduct) return;
    const qty = parsed.quantity;

    try {
      if (movementKind === "STOCK_IN") {
        await stockIn({
          productId: selectedProduct.id,
          quantity: qty,
          unitCost: parsed.unitCost ?? 0,
          note: parsed.note,
        }).unwrap();
        toast.success(t("inventory.toast.stocked_in", "Stocked in {quantity} {unit}", { quantity: qty, unit: selectedProduct.unit }));
      } else {
        await stockCut({
          productId: selectedProduct.id,
          quantity: qty,
          strategy,
          note: parsed.note,
        }).unwrap();
        toast.success(t("inventory.toast.stock_cut", "Cut {quantity} {unit}", { quantity: qty, unit: selectedProduct.unit }));
      }
      setFormOpen(false);
    } catch (err) {
      toast.error(apiErrorMessage(err as never, t("inventory.errors.record_movement", "Could not record the stock movement.")));
    }
  };

  const isSaving = isStockingIn || isCutting;

  return (
    <PageShell>
      <PageHeader
        title={t("inventory.title", "Inventory")}
        breadcrumbs={[
          { label: t("breadcrumb.home", "Home"), href: "/" },
          { label: t("inventory.breadcrumb.inventory", "Inventory") },
          { label: t("inventory.breadcrumb.stock_list", "Stock List") },
        ]}
        rightSlot={<AdminTopActions />}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatTile
          title={t("inventory.stats.tracked_products", "Tracked Products")}
          value={String(inventoryPage?.totalElements ?? 0)}
          tone="gray"
        />
        <StatTile
          title={t("inventory.stats.low_stock_page", "Low Stock (this page)")}
          value={String(lowCount)}
          tone={lowCount > 0 ? "orange" : "gray"}
        />
        <StatTile
          title={t("inventory.stats.out_of_stock_page", "Out of Stock (this page)")}
          value={String(outCount)}
          tone={outCount > 0 ? "red" : "gray"}
        />
      </div>

      <FilterPanel>
        <TextField
          label={t("inventory.fields.product_name", "Product Name")}
          placeholder={t("inventory.filters.search_products", "Search products")}
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
        />
        <SelectField
          label={t("inventory.filters.stock_level", "Stock Level")}
          placeholder={t("inventory.filters.all_levels", "All levels")}
          value={levelFilter}
          onChange={(e) => { setLevelFilter(e.target.value); setPage(1); }}
        >
          <option value="OK">{levelLabel.OK}</option>
          <option value="LOW">{levelLabel.LOW}</option>
          <option value="OUT">{levelLabel.OUT}</option>
        </SelectField>
        <FilterActions onClear={() => { setSearchTerm(""); setLevelFilter(""); setPage(1); }} onSearch={refetch} />
      </FilterPanel>

      <DataCard
        title={t("inventory.card.title", "Stock Levels")}
        meta={t("inventory.card.meta", "Tracked Products: {count}", { count: inventoryPage?.totalElements ?? 0 })}
        actions={
          isAdmin ? (
            <div className="flex flex-wrap items-center gap-3">
              <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                <label className="form_field min-w-0">
                  <DatePickerInput
                    type="month"
                    value={expenseMonth}
                    onChange={setExpenseMonth}
                    className="sm:min-w-[160px]"
                    aria-label={t("inventory.expense.month_aria", "Stock expense report month")}
                  />
                </label>
                <button
                  type="button"
                  onClick={handleDownloadExpenseReport}
                  disabled={isDownloadingExpenseReport || !expenseMonth}
                  className="btn_outline_black shrink-0"
                  title={t("inventory.expense.export_tooltip", "Every stock-purchase (stock-in) cost recorded this month, as an Excel file")}
                >
                  {isDownloadingExpenseReport ? t("inventory.expense.exporting", "Exporting...") : t("inventory.expense.export", "Export expenses")}
                  <Download />
                </button>
              </div>
              <ExcelImportButton
                label={t("inventory.import.label", "Import Stock-In")}
                columnsHint={t("inventory.import.columns_hint", "SKU, Quantity, Unit Cost, Note (optional)")}
                onImport={(file) => stockInFromExcel(file).unwrap()}
                template={{
                  filename: "stock-in-import-template.xlsx",
                  download: () => downloadStockInTemplate().unwrap(),
                }}
              />
              <TableActions onRegister={() => handleOpenForm()} primaryLabel={t("inventory.actions.adjust_stock", "Adjust Stock")} />
            </div>
          ) : undefined
        }
      >
        <SimpleTable headers={inventoryTableHeaders}>
          <TableState
            colSpan={inventoryTableHeaders.length}
            isLoading={list.isLoading}
            error={list.error}
            isEmpty={visibleInventory.length === 0}
            emptyLabel={isFiltering ? t("inventory.empty.filtered", "No stock records match these filters.") : t("inventory.empty.none", "No inventory records. Products get a stock row when they are created.")}
            onRetry={refetch}
          />
          {list.showRows &&
            visibleInventory.map((item, index) => {
              const level = stockLevel(item);
              return (
                <Row key={item.productId} striped={index % 2 === 1}>
                  <Cell>{view.offset + index + 1}</Cell>
                  <Cell className="font-semibold">{titleCase(item.productName)}</Cell>
                  <Cell>{Number(item.quantityOnHand).toLocaleString()}</Cell>
                  <Cell>{humanise(item.unit)}</Cell>
                  <Cell>{Number(item.reorderLevel).toLocaleString()}</Cell>
                  <Cell>
                    <StatusBadge label={levelLabel[level]} tone={LEVEL_TONE[level]} />
                  </Cell>
                  <Cell>
                    <RowActions
                      onView={() => router.push(`/inventory/${item.productId}`)}
                      onEdit={isAdmin ? () => handleOpenForm(item) : undefined}
                      isLoading={isSaving}
                    />
                  </Cell>
                </Row>
              );
            })}
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
        onOpenChange={setFormOpen}
        title={t("inventory.form.title", "Stock Movement")}
        submitLabel={t("actions.submit", "Submit")}
        onSubmit={handleSubmit}
        isLoading={isSaving}
      >
        <ModalGrid>
          <div className="md:col-span-3">
            <FormProductSelect
              label={t("fields.product", "Product")}
              required
              options={productOptions}
              value={selectedProduct}
              onChange={setSelectedProduct}
            />
          </div>
          <FormSelect
            label={t("inventory.form.movement", "Movement")}
            placeholder={t("inventory.form.select_movement", "Select movement")}
            value={movementKind}
            onChange={(e) => setMovementKind(e.target.value as MovementKind)}
            required
          >
            <option value="STOCK_IN">Stock In (purchase)</option>
            <option value="STOCK_CUT">Stock Cut (draw-down)</option>
          </FormSelect>
          <FormInput
            label={t("fields.quantity", "Quantity")}
            type="number"
            placeholder="0"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
          {movementKind === "STOCK_IN" ? (
            <MoneyField
              label={t("inventory.form.unit_cost", "Unit Cost (USD)")}
              value={unitCost}
              onValueChange={setUnitCost}
              required
            />
          ) : (
            <FormSelect
              label={t("inventory.form.costing_strategy", "Costing Strategy")}
              placeholder={t("inventory.form.select_strategy", "Select strategy")}
              value={strategy}
              onChange={(e) => setStrategy(e.target.value as StockStrategy)}
              required
            >
              <option value="FIFO">FIFO (oldest batch first)</option>
              <option value="LIFO">LIFO (newest batch first)</option>
            </FormSelect>
          )}
          <div className="md:col-span-3">
            <FormTextarea
              label={t("fields.note", "Note")}
              placeholder={t("inventory.form.note_placeholder", "Optional reason or reference")}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          {selectedProduct ? (
            <p className="md:col-span-3 text-sm text-muted-foreground">
              {t("inventory.form.current_stock", "Current stock: {quantity} {unit}", { quantity: selectedProduct.currentStock, unit: selectedProduct.unit })}
            </p>
          ) : null}
        </ModalGrid>
      </FormModal>
    </PageShell>
  );
}
