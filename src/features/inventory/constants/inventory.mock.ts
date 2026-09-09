import { ProductSelectOption } from "@/components/common/AdminKit";

export type InventoryListRow = {
  id: string;
  productId: string;
  name: string;
  sku: string;
  stock: string;
  unit: string;
  status: string;
  category: string;
  reorderLevel: number;
};

export type StockMovementRow = {
  id: string;
  date: string;
  type: "Purchase" | "Sale" | "Adjustment";
  change: number;
  previousQty: number;
  newQty: number;
  adjustedBy: string;
  reason: string;
};

export const MOCK_STOCK_PRODUCTS: ProductSelectOption[] = [
  {
    id: "1",
    name: "Arabica Coffee Beans",
    sku: "SKU-001",
    currentStock: 250,
    unit: "bags",
  },
  {
    id: "2",
    name: "Green Tea Leaves",
    sku: "SKU-002",
    currentStock: 15,
    unit: "boxes",
  },
  {
    id: "3",
    name: "Croissant Dough",
    sku: "SKU-003",
    currentStock: 80,
    unit: "pcs",
  },
  {
    id: "4",
    name: "Whole Milk",
    sku: "SKU-004",
    currentStock: 42,
    unit: "liters",
  },
  {
    id: "5",
    name: "Vanilla Syrup",
    sku: "SKU-005",
    currentStock: 8,
    unit: "bottles",
  },
];

export const STATIC_INVENTORY_ROWS: InventoryListRow[] = [
  {
    id: "static-1",
    productId: "1",
    name: "Arabica Coffee Beans",
    sku: "SKU-001",
    stock: "250",
    unit: "bags",
    status: "In Stock",
    category: "Coffee",
    reorderLevel: 50,
  },
  {
    id: "static-2",
    productId: "2",
    name: "Green Tea Leaves",
    sku: "SKU-002",
    stock: "15",
    unit: "boxes",
    status: "Low Stock",
    category: "Tea",
    reorderLevel: 20,
  },
  {
    id: "static-3",
    productId: "3",
    name: "Croissant Dough",
    sku: "SKU-003",
    stock: "80",
    unit: "pcs",
    status: "In Stock",
    category: "Pastries",
    reorderLevel: 30,
  },
  {
    id: "static-4",
    productId: "4",
    name: "Whole Milk",
    sku: "SKU-004",
    stock: "42",
    unit: "liters",
    status: "In Stock",
    category: "Dairy",
    reorderLevel: 25,
  },
  {
    id: "static-5",
    productId: "5",
    name: "Vanilla Syrup",
    sku: "SKU-005",
    stock: "8",
    unit: "bottles",
    status: "Low Stock",
    category: "Syrups",
    reorderLevel: 10,
  },
];

export const STOCK_MOVEMENT_HISTORY: StockMovementRow[] = [
  {
    id: "mv-1",
    date: "10-Jan-2025 09:30",
    type: "Purchase",
    change: 100,
    previousQty: 150,
    newQty: 250,
    adjustedBy: "Ream Chan",
    reason: "Monthly restock",
  },
  {
    id: "mv-2",
    date: "09-Jan-2025 14:15",
    type: "Sale",
    change: -20,
    previousQty: 170,
    newQty: 150,
    adjustedBy: "System",
    reason: "POS order deduction",
  },
  {
    id: "mv-3",
    date: "08-Jan-2025 11:00",
    type: "Adjustment",
    change: -5,
    previousQty: 175,
    newQty: 170,
    adjustedBy: "Ream Chan",
    reason: "Damaged bags",
  },
  {
    id: "mv-4",
    date: "05-Jan-2025 16:45",
    type: "Purchase",
    change: 50,
    previousQty: 125,
    newQty: 175,
    adjustedBy: "Ream Chan",
    reason: "Emergency restock",
  },
  {
    id: "mv-5",
    date: "03-Jan-2025 10:20",
    type: "Sale",
    change: -15,
    previousQty: 140,
    newQty: 125,
    adjustedBy: "System",
    reason: "POS order deduction",
  },
];

export function getInventoryByProductId(productId: string) {
  return STATIC_INVENTORY_ROWS.find((row) => row.productId === productId);
}

export function getProductOptionById(productId: string) {
  return MOCK_STOCK_PRODUCTS.find((product) => product.id === productId);
}
