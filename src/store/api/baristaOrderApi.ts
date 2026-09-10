import { baseApi, unwrap } from "./baseApi";
import type {
  BakongQrResponse,
  CashPaymentRequest,
  CreateOrderRequest,
  Currency,
  OrderResponse,
  OrderStatus,
  PageQuery,
  PageResponse,
  UUID,
} from "./types";

/**
 * The barista-facing order endpoints, which back both the POS screen (ring up a sale, take
 * payment) and the barista queue. Distinct from `orderApi`: `/api/barista/orders` scopes to
 * the signed-in barista's own sales, while `/all` spans the whole shop.
 */

interface BaristaOrderListQuery extends PageQuery {
  status?: OrderStatus;
}

const QUEUE_TAGS = [
  { type: "Order" as const, id: "BARISTA_LIST" },
  { type: "Order" as const, id: "BARISTA_ALL" },
  { type: "Order" as const, id: "AWAITING_PICKUP" },
  { type: "Order" as const, id: "AWAITING_BAKONG" },
  { type: "Order" as const, id: "LIST" },
  { type: "Report" as const, id: "DAILY" },
  { type: "Finance" as const, id: "SUMMARY" },
];

export const baristaOrderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** POS checkout — creates a PENDING order that then needs a payment call. */
    createBaristaOrder: builder.mutation<OrderResponse, CreateOrderRequest>({
      query: (body) => ({ url: "/api/barista/orders", method: "POST", body }),
      transformResponse: unwrap<OrderResponse>,
      invalidatesTags: [...QUEUE_TAGS, { type: "Inventory", id: "LIST" }],
    }),

    /** Orders rung up by the signed-in barista. */
    listBaristaOrders: builder.query<
      PageResponse<OrderResponse>,
      BaristaOrderListQuery | void
    >({
      query: (params) => ({ url: "/api/barista/orders", params: params ?? undefined }),
      transformResponse: unwrap<PageResponse<OrderResponse>>,
      providesTags: [{ type: "Order", id: "BARISTA_LIST" }],
    }),

    /** Every order in the shop — what the barista queue board shows. */
    listAllBaristaOrders: builder.query<
      PageResponse<OrderResponse>,
      BaristaOrderListQuery | void
    >({
      query: (params) => ({ url: "/api/barista/orders/all", params: params ?? undefined }),
      transformResponse: unwrap<PageResponse<OrderResponse>>,
      providesTags: (result) =>
        result
          ? [
              ...result.content.map(({ id }) => ({ type: "Order" as const, id })),
              { type: "Order" as const, id: "BARISTA_ALL" },
            ]
          : [{ type: "Order" as const, id: "BARISTA_ALL" }],
    }),

    getBaristaOrder: builder.query<OrderResponse, UUID>({
      query: (id) => `/api/barista/orders/all/${id}`,
      transformResponse: unwrap<OrderResponse>,
      providesTags: (_r, _e, id) => [{ type: "Order", id }],
    }),

    payOrderCash: builder.mutation<OrderResponse, { id: UUID; body: CashPaymentRequest }>({
      query: ({ id, body }) => ({
        url: `/api/barista/orders/${id}/pay/cash`,
        method: "POST",
        body,
      }),
      transformResponse: unwrap<OrderResponse>,
      invalidatesTags: (_r, _e, { id }) => [{ type: "Order", id }, { type: "OrderHistory", id }, "Inventory", "StockMovement", "Product", ...QUEUE_TAGS],
    }),

    generateBakongQr: builder.mutation<
      BakongQrResponse,
      { id: UUID; currency?: Currency }
    >({
      query: ({ id, currency }) => ({
        url: `/api/barista/orders/${id}/pay/bakong/qr`,
        method: "POST",
        params: currency ? { currency } : undefined,
      }),
      transformResponse: unwrap<BakongQrResponse>,
    }),

    confirmBakongPayment: builder.mutation<OrderResponse, UUID>({
      query: (id) => ({
        url: `/api/barista/orders/${id}/pay/bakong/confirm`,
        method: "POST",
      }),
      transformResponse: unwrap<OrderResponse>,
      invalidatesTags: (_r, _e, id) => [{ type: "Order", id }, { type: "OrderHistory", id }, "Inventory", "StockMovement", "Product", ...QUEUE_TAGS],
    }),

    /** Only an unpaid order can be cancelled; the API rejects it once payment has cleared. */
    cancelBaristaOrder: builder.mutation<OrderResponse, UUID>({
      query: (id) => ({ url: `/api/barista/orders/${id}/cancel`, method: "POST" }),
      transformResponse: unwrap<OrderResponse>,
      invalidatesTags: (_r, _e, id) => [
        { type: "Order", id },
        { type: "Inventory", id: "LIST" },
        ...QUEUE_TAGS,
      ],
    }),

    /**
     * Moving a paid order along the queue. Neither touches money or stock — that all happened
     * at payment — so they only need to invalidate the board, not the finance tags.
     */
    startPreparingBaristaOrder: builder.mutation<OrderResponse, UUID>({
      query: (id) => ({
        url: `/api/barista/orders/${id}/start-preparing`,
        method: "POST",
      }),
      transformResponse: unwrap<OrderResponse>,
      invalidatesTags: (_r, _e, id) => [
        { type: "Order", id },
        { type: "OrderHistory", id },
        ...QUEUE_TAGS,
      ],
    }),

    dispatchBaristaOrder: builder.mutation<OrderResponse, UUID>({
      query: (id) => ({ url: `/api/barista/orders/${id}/dispatch`, method: "POST" }),
      transformResponse: unwrap<OrderResponse>,
      invalidatesTags: (_r, _e, id) => [
        { type: "Order", id },
        { type: "OrderHistory", id },
        ...QUEUE_TAGS,
      ],
    }),

    markDeliveredBaristaOrder: builder.mutation<OrderResponse, UUID>({
      query: (id) => ({ url: `/api/barista/orders/${id}/delivered`, method: "POST" }),
      transformResponse: unwrap<OrderResponse>,
      invalidatesTags: (_r, _e, id) => [
        { type: "Order", id },
        { type: "OrderHistory", id },
        ...QUEUE_TAGS,
      ],
    }),

    completeBaristaOrder: builder.mutation<OrderResponse, UUID>({
      query: (id) => ({ url: `/api/barista/orders/${id}/complete`, method: "POST" }),
      transformResponse: unwrap<OrderResponse>,
      invalidatesTags: (_r, _e, id) => [
        { type: "Order", id },
        { type: "OrderHistory", id },
        ...QUEUE_TAGS,
      ],
    }),
  }),
});

export const {
  useCreateBaristaOrderMutation,
  useListBaristaOrdersQuery,
  useListAllBaristaOrdersQuery,
  useGetBaristaOrderQuery,
  usePayOrderCashMutation,
  useGenerateBakongQrMutation,
  useConfirmBakongPaymentMutation,
  useCancelBaristaOrderMutation,
  useStartPreparingBaristaOrderMutation,
  useCompleteBaristaOrderMutation,
  useDispatchBaristaOrderMutation,
  useMarkDeliveredBaristaOrderMutation,
} = baristaOrderApi;
