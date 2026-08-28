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

export type PromotionEditFormFields = PromotionFormFields & {
  selectedCategories: string[];
};

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

export type PromotionDetail = PromotionListRow & {
  description: string;
  applicableCategories: string[];
  applicableProductsLabel: string;
  terms: string;
  usageUsed: number;
  usageTotal: number;
  totalRedemptions: number;
  remainingLimit: number;
  averageOrderValue: number;
  totalDiscountGiven: number;
};

export type RedemptionRow = {
  id: string;
  date: string;
  orderId: string;
  customer: string;
  originalAmount: number;
  discount: number;
  finalAmount: number;
  staff: string;
};
