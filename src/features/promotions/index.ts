export { default as PromotionManagementView } from "./components/promotion-management-view";
export { default as PromotionDetailView } from "./components/promotion-detail-view";
export { default as PromotionEditModal } from "./components/promotion-edit-modal";
export { PromotionTypeBadge, PromotionStatusBadge } from "./components/promotion-badges";
export {
  EMPTY_PROMOTION_FORM,
  PROMOTION_CATEGORY_OPTIONS,
  PROMOTION_PRODUCT_OPTIONS,
  PROMOTION_TOTAL_COUNT,
  REDEMPTION_HISTORY,
  STATIC_PROMOTION_ROWS,

  getPromotionById,
  getPromotionDetailById,
  getRedemptionHistory,
  mapCategoriesToValues,
  parsePromotionDate,
  parseUsageLimit,
  toPromotionEditForm,
  toPromotionForm,
} from "./constants/promotion.mock";
export type {
  PromotionDetail,
  PromotionEditFormFields,
  PromotionFormFields,
  PromotionListRow,
  PromotionStatus,
  PromotionType,
  RedemptionRow,
} from "./types/promotion.type";
