import type {
  PromotionDetail,
  PromotionEditFormFields,
  PromotionFormFields,
  PromotionListRow,
  RedemptionRow,
} from "@/features/promotions/types/promotion.type";


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
  { value: "all", label: "All" },
  { value: "latte", label: "Caffe Latte" },
  { value: "cappuccino", label: "Cappuccino" },
  { value: "croissant", label: "Butter Croissant" },
  { value: "cold-brew", label: "Cold Brew" },
];


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



const PROMOTION_DETAIL_OVERRIDES: Record<
  string,
  Omit<
    PromotionDetail,
    keyof PromotionListRow | "usageUsed" | "usageTotal" | "remainingLimit"
  >
> = {
  "1": {
    description:
      "Get 20% off on all coffee beverages. Valid for dine-in and takeaway orders.",
    applicableCategories: ["Coffee"],
    applicableProductsLabel: "All products in category",
    terms:
      "Cannot be combined with other promotions. Maximum discount $15.00 per order.",
    totalRedemptions: 45,
    averageOrderValue: 18.5,
    totalDiscountGiven: 166.5,
  },
  "2": {
    description: "Flat $5 discount on orders meeting the minimum purchase amount.",
    applicableCategories: ["Coffee", "Pastry"],
    applicableProductsLabel: "All eligible menu items",
    terms: "One use per customer per day. Not valid on delivery fees.",
    totalRedemptions: 120,
    averageOrderValue: 32.4,
    totalDiscountGiven: 600,
  },
  "3": {
    description: "Buy two pastries and receive one free of equal or lesser value.",
    applicableCategories: ["Pastry"],
    applicableProductsLabel: "Selected pastry items",
    terms: "Free item must be of equal or lesser value. Dine-in only.",
    totalRedemptions: 0,
    averageOrderValue: 0,
    totalDiscountGiven: 0,
  },
};

export const REDEMPTION_HISTORY: Record<string, RedemptionRow[]> = {
  "1": [
    {
      id: "1",
      date: "20-Jan-2025 14:30",
      orderId: "ORD-1045",
      customer: "Walk-in",
      originalAmount: 22,
      discount: 4.4,
      finalAmount: 17.6,
      staff: "Ream Chan",
    },
    {
      id: "2",
      date: "19-Jan-2025 11:15",
      orderId: "ORD-1038",
      customer: "John Doe",
      originalAmount: 35,
      discount: 7,
      finalAmount: 28,
      staff: "Visal Soeurn",
    },
    {
      id: "3",
      date: "18-Jan-2025 16:45",
      orderId: "ORD-1029",
      customer: "Walk-in",
      originalAmount: 18.5,
      discount: 3.7,
      finalAmount: 14.8,
      staff: "System",
    },
    {
      id: "4",
      date: "17-Jan-2025 09:20",
      orderId: "ORD-1012",
      customer: "Sarah Lim",
      originalAmount: 42,
      discount: 8.4,
      finalAmount: 33.6,
      staff: "Ream Chan",
    },
    {
      id: "5",
      date: "16-Jan-2025 13:05",
      orderId: "ORD-1004",
      customer: "Walk-in",
      originalAmount: 15,
      discount: 3,
      finalAmount: 12,
      staff: "Visal Soeurn",
    },
  ],
};

export function parseUsageLimit(usageLimit: string) {
  const [usedRaw, totalRaw] = usageLimit.split("/").map((part) => part.trim());
  const used = parseInt(usedRaw, 10) || 0;
  const total = parseInt(totalRaw, 10) || 0;
  return { used, total, remaining: Math.max(total - used, 0) };
}

export function getPromotionById(id: string) {
  return STATIC_PROMOTION_ROWS.find((row) => row.id === id);
}

export function getPromotionDetailById(id: string): PromotionDetail | undefined {
  const row = getPromotionById(id);
  if (!row) return undefined;

  const { used, total, remaining } = parseUsageLimit(row.usageLimit);
  const overrides = PROMOTION_DETAIL_OVERRIDES[id];

  return {
    ...row,
    usageUsed: used,
    usageTotal: total,
    remainingLimit: remaining,
    description:
      overrides?.description ??
      `${row.name}. Apply this promotion at checkout when eligible.`,
    applicableCategories: overrides?.applicableCategories ?? ["All Categories"],
    applicableProductsLabel:
      overrides?.applicableProductsLabel ?? "All eligible products",
    terms:
      overrides?.terms ??
      "Standard promotion terms apply. Management reserves the right to modify or cancel.",
    totalRedemptions: overrides?.totalRedemptions ?? used,
    averageOrderValue: overrides?.averageOrderValue ?? 0,
    totalDiscountGiven: overrides?.totalDiscountGiven ?? 0,
  };
}

export function getRedemptionHistory(promotionId: string) {
  return REDEMPTION_HISTORY[promotionId] ?? [];
}


export function parsePromotionDate(dateStr: string) {
  const parsed = new Date(dateStr.replace(/-/g, " "));
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export function mapCategoriesToValues(categories: string[]) {
  return categories
    .map((category) => {
      const match = PROMOTION_CATEGORY_OPTIONS.find(
        (option) =>
          option.label.toLowerCase() === category.toLowerCase() ||
          option.value === category.toLowerCase()
      );
      return match?.value;
    })
    .filter((value): value is string => Boolean(value));
}

export function toPromotionEditForm(detail: PromotionDetail): PromotionEditFormFields {
  const productsOption = PROMOTION_PRODUCT_OPTIONS.find(
    (option) =>
      option.label.toLowerCase() === detail.applicableProductsLabel.toLowerCase()
  );

  return {
    promoCode: detail.promoCode,
    name: detail.name,
    type: detail.type,
    value: detail.value.replace(/[%$]/g, "").replace(/^Buy 2 Get 1$/, "2"),
    minPurchase: detail.minPurchase.replace(/[$,]/g, ""),
    usageLimit: String(detail.usageTotal),
    startDate: parsePromotionDate(detail.startDate),
    expireDate: parsePromotionDate(detail.expireDate),
    categories: mapCategoriesToValues(detail.applicableCategories)[0] ?? "",
    products:
      productsOption?.value ??
      (detail.applicableProductsLabel.toLowerCase().includes("all") ? "all" : ""),
    description: detail.description,
    selectedCategories: mapCategoriesToValues(detail.applicableCategories),
  };
}

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
