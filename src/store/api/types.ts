export interface ApiEnvelope<T> {
  status: string;
  message: string;
  data: T;
  timeStamp: string;
}

export interface ApiErrorBody {
  status: string;
  message: string;
  path: string;
  timeStamp: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface PageQuery {
  page?: number;
  size?: number;
}

export type Numeric = number;

export type UUID = string;

export type Role = "ADMIN" | "BARISTA" | "CUSTOMER" | "SUPER_ADMIN";
export type Status = "ACTIVE" | "INACTIVE";
export type UserStatus =
  | "ACTIVE"
  | "PENDING_VERIFICATION"
  | "DEACTIVATED"
  | "SUSPENDED"
  | "BANNED"
  | "DELETED";
export type Gender = "MALE" | "FEMALE" | "OTHER";
export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PREPARING"
  | "OUT_FOR_DELIVERY"
  | "COMPLETED"
  | "DELIVERED"
  | "CANCELLED";
export type PaymentMethod = "CASH" | "BAKONG";
export type FulfillmentMethod = "PICKUP" | "DELIVERY";
export type DiscountType = "PERCENTAGE" | "FIXED";
export type Currency = "USD" | "KHR";
export type StockMovementType = "STOCK_IN" | "STOCK_OUT";
export type StockStrategy = "FIFO" | "LIFO";
export type StockUnit = "PACK" | "BOX" | "CARTON" | "PIECE";
export type SellUnit =
  | "PLATE"
  | "BOTTLE"
  | "CAN"
  | "CUP"
  | "CARTON"
  | "PACKAGE"
  | "TANK"
  | "PIECE";
export type CategoryGroup = "FRESH_DRINK" | "BEVERAGE" | "SNACK";
export type VariantLabel = "MEDIUM" | "LARGE" | "PIECE";
export type SugarLevel =
  | "ZERO"
  | "TWENTY_FIVE"
  | "FIFTY"
  | "SEVENTY_FIVE"
  | "HUNDRED";
export type IceLevel = SugarLevel;
export type MilkType =
  | "NONE"
  | "WHOLE_MILK"
  | "SKIM_MILK"
  | "OAT_MILK"
  | "ALMOND_MILK"
  | "SOY_MILK"
  | "CONDENSED_MILK";
export type OrderAuditAction =
  | "CREATED"
  | "CASH_COLLECTED"
  | "BAKONG_CONFIRMED"
  | "CANCELLED"
  | "DELIVERY_FEE_SET"
  | "ESTIMATE_SET"
  | "CASH_SELECTED"
  | "BAKONG_QR_GENERATED"
  | "LOCATION_PINNED"
  | "STAFF_CALLED"
  | "STAFF_CALL_ANSWERED"
  | "PREPARING"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "COMPLETED";

export interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  expiresInReadable: string;
}

export interface LoginResponse {
  otpRequired: boolean;
  loginTicket: string | null;
  tokens: AuthTokenResponse | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface PhoneLoginRequest {
  phoneNumber: string;
}

export interface VerifyLoginOtpRequest {
  loginTicket: string;
  otp: string;
}

export interface UserResponse {
  id: UUID;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  avatarUrl: string | null;
  gender: Gender | null;
  role: Role;
  status: UserStatus;
  telegramLinked: boolean;
  createdBy: UUID | null;
  createdByName: string | null;
  createdByRole: Role | null;
}

export interface UpdateProfileRequest {
  fullName?: string;
  phoneNumber?: string;
  gender?: Gender;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface CreateStaffRequest {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  gender?: Gender;
}

export interface UpdateStaffRequest {
  fullName?: string;
  phoneNumber?: string;
  gender?: Gender;
  status?: UserStatus;
}

export interface InviteStaffRequest {
  fullName: string;
  phoneNumber: string;
  gender?: Gender;
}

export interface TelegramLinkCodeResponse {
  code: string;
  expiresInSeconds: number;
  deepLink: string;
}

export interface TelegramWidgetAuthRequest {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export interface CategoryResponse {
  id: UUID;
  name: string;
  description: string | null;
  status: Status;
  categoryGroup: CategoryGroup | null;
  createdBy: UUID | null;
  createdByName: string | null;
  createdByRole: Role | null;
  updatedBy: UUID | null;
  updatedByName: string | null;
  updatedByRole: Role | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  categoryGroup?: CategoryGroup;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  status?: Status;
  categoryGroup?: CategoryGroup;
}

export interface ProductVariantResponse {
  id: UUID;
  productId: UUID;
  name: VariantLabel;
  price: Numeric;
  finalPrice: Numeric;
  sortOrder: number | null;
  status: Status;
}

export interface CreateProductVariantRequest {
  name: VariantLabel;
  price: Numeric;
  sortOrder?: number;
}

export interface UpdateProductVariantRequest {
  name?: VariantLabel;
  price?: Numeric;
  sortOrder?: number;
  status?: Status;
}

export interface ProductExtraResponse {
  id: UUID;
  productId: UUID;
  extraId: UUID;
  name: string;
  price: Numeric;
  sortOrder: number | null;
  status: Status;
  quantityOnHand: Numeric | null;
  imageUrl: string | null;
}

export interface AttachProductExtraRequest {
  extraId: UUID;
  sortOrder?: number;
}

export interface UpdateProductExtraRequest {
  sortOrder?: number;
  status?: Status;
}

export interface ExtraResponse {
  id: UUID;
  name: string;
  price: Numeric;
  status: Status;
  quantityOnHand: Numeric | null;
  imageUrl: string | null;
}

export interface CreateExtraRequest {
  name: string;
  price: Numeric;
  quantityOnHand?: Numeric;
}

export interface UpdateExtraRequest {
  name?: string;
  price?: Numeric;
  status?: Status;
  quantityOnHand?: Numeric;
}

export interface ProductResponse {
  id: UUID;
  name: string;
  nameKh: string | null;
  description: string | null;
  imageUrl: string | null;
  sku: string;
  stockUnit: StockUnit;
  sellUnit: SellUnit;
  unitsPerStock: Numeric;
  categoryId: UUID;
  categoryName: string;
  categoryGroup: CategoryGroup | null;
  status: Status;
  quantityOnHand: Numeric;
  reorderLevel: Numeric;
  discountType: DiscountType | null;
  discountValue: Numeric | null;
  discountStartAt: string | null;
  discountEndAt: string | null;
  discountActive: boolean;
  variants: ProductVariantResponse[];
  extras: ProductExtraResponse[];
  createdBy: UUID | null;
  createdByName: string | null;
  createdByRole: Role | null;
  updatedBy: UUID | null;
  updatedByName: string | null;
  updatedByRole: Role | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  nameKh?: string;
  description?: string;
  sku: string;
  stockUnit: StockUnit;
  sellUnit: SellUnit;
  unitsPerStock?: Numeric;
  categoryId: UUID;
  reorderLevel?: Numeric;
}

export interface UpdateProductRequest {
  name?: string;
  nameKh?: string;
  description?: string;
  sku?: string;
  stockUnit?: StockUnit;
  sellUnit?: SellUnit;
  unitsPerStock?: Numeric;
  categoryId?: UUID;
  status?: Status;
  reorderLevel?: Numeric;
}

export interface SetProductDiscountRequest {
  discountType: DiscountType;
  discountValue: Numeric;
  discountStartAt?: string;
  discountEndAt?: string;
}

export interface ProductImportRowError {
  rowNumber: number;
  sku: string;
  message: string;
}

export interface ProductImportResponse {
  totalRows: number;
  created: number;
  failed: number;
  errors: ProductImportRowError[];
}

export interface InventoryResponse {
  productId: UUID;
  productName: string;
  unit: string;
  quantityOnHand: Numeric;
  reorderLevel: Numeric;
}

export interface StockInImportRowError {
  rowNumber: number;
  sku: string;
  message: string;
}

export interface StockInImportResponse {
  totalRows: number;
  created: number;
  failed: number;
  errors: StockInImportRowError[];
}

export interface StockMovementResponse {
  id: UUID;
  productId: UUID;
  productName: string;
  type: StockMovementType;
  strategy: StockStrategy | null;
  quantity: Numeric;
  note: string | null;
  performedBy: UUID | null;
  performedByName: string | null;
  performedByRole: Role | null;
  createdAt: string;
}

export interface BatchConsumptionResponse {
  batchId: UUID;
  quantityTaken: Numeric;
  unitCost: Numeric;
}

export interface StockCutResponse {
  movementId: UUID;
  productId: UUID;
  strategy: StockStrategy;
  quantityCut: Numeric;
  remainingOnHand: Numeric;
  consumptions: BatchConsumptionResponse[];
}

export interface StockInRequest {
  productId: UUID;
  quantity: Numeric;
  unitCost: Numeric;
  note?: string;
}

export interface StockCutRequest {
  productId: UUID;
  quantity: Numeric;
  strategy: StockStrategy;
  note?: string;
}

export interface OrderItemExtraResponse {
  extraId: UUID;
  name: string;
  price: Numeric;
}

export interface OrderItemResponse {
  id: UUID;
  productId: UUID;
  productName: string;
  productNameKh: string | null;
  quantity: number;
  unitPrice: Numeric;
  subtotal: Numeric;
  variantName: VariantLabel | null;
  sugarLevel: SugarLevel | null;
  iceLevel: IceLevel | null;
  milkType: MilkType | null;
  extras: OrderItemExtraResponse[];
}

export interface OrderResponse {
  id: UUID;
  handledById: UUID | null;
  handledByName: string | null;
  handledByRole: Role | null;
  customerId: UUID | null;
  customerName: string | null;
  status: OrderStatus;
  items: OrderItemResponse[];
  totalAmount: Numeric;
  fulfillmentMethod: FulfillmentMethod | null;
  deliveryAddress: string | null;
  contactName: string | null;
  contactPhone: string | null;
  dispatchedAt: string | null;
  deliveredAt: string | null;
  paymentMethod: PaymentMethod | null;
  amountTendered: Numeric | null;
  amountTenderedCurrency: Currency | null;
  changeDue: Numeric | null;
  changeCurrency: Currency | null;
  bakongQrString: string | null;
  bakongMd5Hash: string | null;
  bakongCurrency: Currency | null;
  bakongAmount: Numeric | null;
  note: string | null;
  paidAt: string | null;
  createdAt: string;
  deliveryLatitude: Numeric | null;
  deliveryLongitude: Numeric | null;
  deliveryFee: Numeric | null;
  deliveryFeeSetAt: string | null;
  estimatedReadyAt: string | null;
  distanceMeters: Numeric | null;
}

export interface OrderUpdateMessage {
  action: OrderAuditAction;
  order: OrderResponse;
  sentAt: string;
}

export type StaffCallReason =
  | "PAYMENT_HELP"
  | "CHANGE_ORDER"
  | "ORDER_DELAY"
  | "WRONG_OR_MISSING_ITEM"
  | "NAPKINS_UTENSILS"
  | "DELIVERY_HELP"
  | "OTHER";

export type StaffCallStatus = "OPEN" | "ANSWERED";

export interface AnswerStaffCallRequest {
  reply?: string;
}

export interface StaffCallResponse {
  orderId: UUID;
  customerName: string | null;
  orderStatus: OrderStatus;
  fulfillmentMethod: FulfillmentMethod | null;
  status: StaffCallStatus;
  reason: StaffCallReason;
  note: string | null;
  calledAt: string;
  answeredByName: string | null;
  reply: string | null;
  answeredAt: string | null;
  nextCallAllowedAt: string | null;
}

export interface StaffCallMessage {
  type: "CALLED" | "ANSWERED";
  orderId: UUID;
  customerName: string | null;
  orderStatus: OrderStatus;
  fulfillmentMethod: FulfillmentMethod | null;
  reason: StaffCallReason;
  note: string | null;
  calledAt: string;
  answeredByName: string | null;
  reply: string | null;
  sentAt: string;
}

export type WatchedResource =
  | "PRODUCT"
  | "CATEGORY"
  | "EXTRA"
  | "INVENTORY"
  | "FEEDBACK";

export type ResourceChangeType = "CREATED" | "UPDATED" | "DELETED";

export interface ResourceChangeMessage {
  resource: WatchedResource;
  id: UUID;
  change: ResourceChangeType;
  sentAt: string;
}

export interface OrderAuditLogResponse {
  id: UUID;
  action: OrderAuditAction;
  actorId: UUID | null;
  actorName: string | null;
  actorRole: Role | null;
  createdAt: string;
}

export interface OrderItemRequest {
  productId: UUID;
  quantity: number;
  variantId?: UUID;
  variantName?: VariantLabel;
  sugarLevel?: SugarLevel;
  iceLevel?: IceLevel;
  milkType?: MilkType;
  extraIds?: UUID[];
}

export interface CreateOrderRequest {
  items: OrderItemRequest[];
  note?: string;
}

export interface CashPaymentRequest {
  currency: Currency;
  amountTendered: Numeric;
  changeCurrency?: Currency;
}

export interface DeliveryFeeRequest {
  fee: Numeric;
}

export interface EstimatedTimeRequest {
  minutes: number;
}

export interface BakongQrResponse {
  orderId: UUID;
  qrString: string;
  md5Hash: string;
  amount: Numeric;
  currency: Currency;
  expiresAt: string;
  expiresInSeconds: number;
}

export interface EventResponse {
  id: UUID;
  title: string;
  description: string | null;
  imageUrl: string | null;
  latitude: Numeric | null;
  longitude: Numeric | null;
  startAt: string;
  endAt: string;
  status: Status;
  createdBy: UUID | null;
  createdByName: string | null;
  createdByRole: Role | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  latitude?: Numeric;
  longitude?: Numeric;
  startAt: string;
  endAt: string;
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  latitude?: Numeric;
  longitude?: Numeric;
  startAt?: string;
  endAt?: string;
  status?: Status;
}

export interface BannerResponse {
  id: UUID;
  title: string;
  imageUrl: string | null;
  linkUrl: string | null;
  sortOrder: number;
  status: Status;
  adminId: UUID | null;
  adminName: string | null;
  adminRole: Role | null;
  updatedByAdminId: UUID | null;
  updatedByAdminName: string | null;
  updatedByAdminRole: Role | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBannerRequest {
  title: string;
  linkUrl?: string;
  sortOrder?: number;
}

export interface UpdateBannerRequest {
  title?: string;
  linkUrl?: string;
  sortOrder?: number;
  status?: Status;
}

export interface DailyReportResponse {
  baristaId: UUID;
  baristaName: string;
  date: string;
  totalOrders: number;
  cashTotal: Numeric;
  bakongTotal: Numeric;
  grandTotal: Numeric;
}

export interface AdminDailyReportResponse {
  date: string;
  totalOrders: number;
  cashTotal: Numeric;
  bakongTotal: Numeric;
  grandTotal: Numeric;
  baristas: DailyReportResponse[];
}

export interface FinanceSummaryResponse {
  periodStart: string;
  periodEnd: string;
  cashIn: Numeric;
  bakongIn: Numeric;
  totalIn: Numeric;
  totalOut: Numeric;
  profit: Numeric;
}

export interface BakongExchangeRateResponse {
  khrPerUsdRate: Numeric;
  marketRate: Numeric | null;
  updatedByAdminId: UUID | null;
  updatedByAdminName: string | null;
  updatedByAdminRole: Role | null;
  updatedAt: string;
}

export interface UpdateBakongExchangeRateRequest {
  khrPerUsdRate: Numeric;
  marketRate?: Numeric;
}
