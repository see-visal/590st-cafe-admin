export interface Inventory {
  id: number;
  ingredientId: number;
  quantity: number;
  unit: string;
  minStock: number;
  maxStock: number;
  lastUpdated: string;
}

export interface InventoryAdjustment {
  inventoryId: number;
  quantity: number;
}
