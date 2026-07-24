export type PromotionType = "Percentage" | "Fixed Amount" | "Buy X Get Y";
export type PromotionStatus = "Active" | "Expired" | "Scheduled";

export type PromotionFormFields = {
  promoCode: string;
  name: string;
  type: PromotionType | "";
  value: string;
  minPurchase: string;
  usageLimit: string;
  startDate?: Date;
  expireDate?: Date;
  categories: string;
  products: string;
  description: string;
};

export const EMPTY_PROMOTION_FORM: PromotionFormFields = {
  promoCode: "",
  name: "",
  type: "Percentage",
  value: "",
  minPurchase: "",
  usageLimit: "",
  startDate: undefined,
  expireDate: undefined,
  categories: "",
  products: "",
  description: "",
};

export const PROMOTION_CATEGORY_OPTIONS = [
  { value: "coffee", label: "Coffee" },
  { value: "pastry", label: "Pastry" },
  { value: "beverages", label: "Beverages" },
  { value: "seasonal", label: "Seasonal Specials" },
];

export const PROMOTION_PRODUCT_OPTIONS = [
  { value: "latte", label: "Caffe Latte" },
  { value: "cappuccino", label: "Cappuccino" },
  { value: "croissant", label: "Butter Croissant" },
  { value: "cold-brew", label: "Cold Brew" },
];

export type PromotionListRow = {
  id: string;
  promoCode: string;
  name: string;
  type: PromotionType;
  value: string;
  minPurchase: string;
  usageLimit: string;
  startDate: string;
  expireDate: string;
  status: PromotionStatus;
};

export const PROMOTION_TOTAL_COUNT = 25;

export const STATIC_PROMOTION_ROWS: PromotionListRow[] = [
  {
    id: "1",
    promoCode: "COFFEE20",
    name: "20% Off Coffee",
    type: "Percentage",
    value: "20%",
    minPurchase: "$10.00",
    usageLimit: "45 / 100",
    startDate: "01-Jan-2025",
    expireDate: "31-Jan-2025",
    status: "Active",
  },
  {
    id: "2",
    promoCode: "FLAT5",
    name: "$5 Off Any Order",
    type: "Fixed Amount",
    value: "$5.00",
    minPurchase: "$25.00",
    usageLimit: "120 / 200",
    startDate: "15-Dec-2024",
    expireDate: "15-Jan-2025",
    status: "Expired",
  },
  {
    id: "3",
    promoCode: "BUY2GET1",
    name: "Buy 2 Get 1 Free Pastry",
    type: "Buy X Get Y",
    value: "Buy 2 Get 1",
    minPurchase: "$0.00",
    usageLimit: "0 / 50",
    startDate: "01-Feb-2025",
    expireDate: "28-Feb-2025",
    status: "Scheduled",
  },
  {
    id: "4",
    promoCode: "WEEKEND15",
    name: "Weekend 15% Discount",
    type: "Percentage",
    value: "15%",
    minPurchase: "$15.00",
    usageLimit: "88 / 150",
    startDate: "10-Jan-2025",
    expireDate: "10-Mar-2025",
    status: "Active",
  },
  {
    id: "5",
    promoCode: "NEWUSER10",
    name: "New User $10 Voucher",
    type: "Fixed Amount",
    value: "$10.00",
    minPurchase: "$20.00",
    usageLimit: "32 / 80",
    startDate: "05-Jan-2025",
    expireDate: "05-Apr-2025",
    status: "Active",
  },
];

export function toPromotionForm(row: PromotionListRow): PromotionFormFields {
  return {
    promoCode: row.promoCode,
    name: row.name,
    type: row.type,
    value: row.value.replace(/[%$]/g, "").replace(/^Buy 2 Get 1$/, "2"),
    minPurchase: row.minPurchase.replace(/[$,]/g, ""),
    usageLimit: row.usageLimit.split("/").pop()?.trim() ?? "",
    startDate: undefined,
    expireDate: undefined,
    categories: "",
    products: "",
    description: "",
  };
}
