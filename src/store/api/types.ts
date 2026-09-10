/**
 * Types mirroring the Coffee-Shop-API contract.
 *
 * Two things differ from the old mock-era types and are easy to get wrong:
 *  - every id is a UUID **string**, never a number;
 *  - every response is wrapped in an envelope, and money/quantity fields arrive as
 *    JSON numbers from Java `BigDecimal` but are safest read through `Numeric`.
 */

/** The `ApiResponse<T>` envelope every controller returns. Unwrapped in baseApi. */
export interface ApiEnvelope<T> {
  status: string;
  message: string;
  data: T;
  timeStamp: string;
}

/** The `ErrorResponse` body returned by GlobalExceptionHandler. */
export interface ApiErrorBody {
  status: string;
  message: string;
  path: string;
  timeStamp: string;
}

/** `PageResponse<T>` — note `page` is 1-based, unlike Spring Data's internal 0-based page. */
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

/** Standard page/size query accepted by every list endpoint. */
export interface PageQuery {
  page?: number;
  size?: number;
}

/** Java BigDecimal serialises as a JSON number. */
export type Numeric = number;

export type UUID = string;

// ---- enums (org.group1.coffeeshopapi.common.enums) ----

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
/**
 * PENDING -> PAID -> PREPARING -> COMPLETED, or PENDING -> CANCELLED.
 *
 * PENDING means placed but not paid for, and is the only status an order can be cancelled from.
 * PAID is stamped the moment money clears, so that — not COMPLETED — is what revenue counts.
 * PREPARING and COMPLETED are the barista working through the drink and handing it over.
 */
export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PREPARING"
  // Delivery orders only: dispatched to a courier, then confirmed as arrived.
  | "OUT_FOR_DELIVERY"
  | "COMPLETED"
  | "DELIVERED"
  | "CANCELLED";
export type PaymentMethod = "CASH" | "BAKONG";
export type DiscountType = "PERCENTAGE" | "FIXED";
export type Currency = "USD" | "KHR";
export type StockMovementType = "STOCK_IN" | "STOCK_OUT";
export type StockStrategy = "FIFO" | "LIFO";
export type SugarLevel = "ZERO" | "TWENTY_FIVE" | "FIFTY" | "SEVENTY_FIVE" | "HUNDRED";
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
  | "PREPARING_STARTED"
  | "COMPLETED"
  | "CANCELLED";

// ---- auth ----

export interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  /** Milliseconds. */
  expiresIn: number;
  expiresInReadable: string;
}

/**
 * Most accounts get `otpRequired: true` and must call verify-login-otp with the
 * `loginTicket`; the super admin skips OTP and receives `tokens` straight from /login.
 */
export interface LoginResponse {
  otpRequired: boolean;
  loginTicket: string | null;
  tokens: AuthTokenResponse | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface VerifyLoginOtpRequest {
  loginTicket: string;
  otp: string;
}

// ---- user / staff ----

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

/** Self-service edit of the signed-in account — `PATCH /api/users/me`. */
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

// ---- category ----

export interface CategoryResponse {
  id: UUID;
  name: string;
  description: string | null;
  status: Status;
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
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  status?: Status;
}

// ---- product ----

export interface ProductSizeOptionResponse {
  id: UUID;
  productId: UUID;
  name: string;
  priceDelta: Numeric;
  sortOrder: number | null;
  status: Status;
}

export interface ProductResponse {
  id: UUID;
  name: string;
  description: string | null;
  imageUrl: string | null;
  sku: string;
  unit: string;
  price: Numeric;
  categoryId: UUID;
  categoryName: string;
  status: Status;
  quantityOnHand: Numeric;
  reorderLevel: Numeric;
  discountType: DiscountType | null;
  discountValue: Numeric | null;
  discountStartAt: string | null;
  discountEndAt: string | null;
  discountActive: boolean;
  finalPrice: Numeric;
  sizeOptions: ProductSizeOptionResponse[];
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
  description?: string;
  sku: string;
  unit: string;
  price: Numeric;
  categoryId: UUID;
  reorderLevel?: Numeric;
  // Optional launch discount. Omit discountValue to create the product at full price;
  // discountType defaults to PERCENTAGE server-side.
  discountType?: DiscountType;
  discountValue?: Numeric;
  discountStartAt?: string;
  discountEndAt?: string;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  unit?: string;
  price?: Numeric;
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

export interface CreateProductSizeOptionRequest {
  name: string;
  priceDelta: Numeric;
  sortOrder?: number;
}

export interface UpdateProductSizeOptionRequest {
  name?: string;
  priceDelta?: Numeric;
  sortOrder?: number;
  status?: Status;
}

export interface ProductImportRowError {
  rowNumber: number;
  message: string;
}

export interface ProductImportResponse {
  totalRows: number;
  imported: number;
  failed: number;
  errors: ProductImportRowError[];
}

// ---- inventory ----

export interface InventoryResponse {
  productId: UUID;
  productName: string;
  unit: string;
  quantityOnHand: Numeric;
  reorderLevel: Numeric;
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

// ---- order ----

export interface OrderItemResponse {
  id: UUID;
  productId: UUID;
  productName: string;
  quantity: number;
  unitPrice: Numeric;
  subtotal: Numeric;
  sizeOptionName: string | null;
  sugarLevel: SugarLevel | null;
  iceLevel: IceLevel | null;
  milkType: MilkType | null;
}

export interface OrderResponse {
  fulfillmentMethod?: "PICKUP" | "DELIVERY" | null;
  deliveryFee?: number | null;
  deliveryAddress?: string | null;
  contactName?: string | null;
  contactPhone?: string | null;
  id: UUID;
  handledById: UUID | null;
  handledByName: string | null;
  handledByRole: Role | null;
  customerId: UUID | null;
  customerName: string | null;
  status: OrderStatus;
  items: OrderItemResponse[];
  totalAmount: Numeric;
  paymentMethod: PaymentMethod | null;
  amountTendered: Numeric | null;
  changeDue: Numeric | null;
  bakongQrString: string | null;
  bakongMd5Hash: string | null;
  bakongCurrency: Currency | null;
  bakongAmount: Numeric | null;
  note: string | null;
  paidAt: string | null;
  createdAt: string;
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
  sizeOptionId?: UUID;
  sugarLevel?: SugarLevel;
  iceLevel?: IceLevel;
  milkType?: MilkType;
}

export interface CreateOrderRequest {
  items: OrderItemRequest[];
  note?: string;
}

export interface CashPaymentRequest {
  amountTendered: Numeric;
}

export interface BakongQrResponse {
  qrString: string;
  md5Hash: string;
  currency: Currency;
  amount: Numeric;
  expiresAt: string;
}

// ---- event ----

export interface EventResponse {
  id: UUID;
  title: string;
  description: string | null;
  imageUrl: string | null;
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
  /** ISO local date-time, e.g. "2026-09-09T08:00:00". */
  startAt: string;
  endAt: string;
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  startAt?: string;
  endAt?: string;
  status?: Status;
}

// ---- reports & finance ----

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

// ---- settings ----

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
