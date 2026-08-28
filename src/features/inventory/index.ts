export { default as InventoryManagementView } from "./components/inventory-management-view";
export { default as InventoryDetailView } from "./components/inventory-detail-view";
export { inventoryApi } from "./api/inventory-api";
export { useInventory } from "./hooks/use-inventory";
export { useAdjustInventory } from "./hooks/use-adjust-inventory";
export type { Inventory, InventoryAdjustment } from "./types/inventory.type";
