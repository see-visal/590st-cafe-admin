import { baseApi, unwrap } from "./baseApi";
import type {
  CashPaymentRequest,
  OrderAuditLogResponse,
  OrderResponse,
  OrderStatus,
  PageQuery,
  PageResponse,
  UUID,
} from "./types";

interface OrderListQuery extends PageQuery {
  baristaId?: UUID;
  customerId?: UUID;
  status?: OrderStatus;
}

/** Every mutation below moves an order between queues, so they all share this invalidation. */
const ORDER_QUEUE_TAGS = [
  { type: "Order" as const, id: "LIST" },
  { type: "Order" as const, id: "AWAITING_PICKUP" },
  { type: "Order" as const, id: "AWAITING_BAKONG" },
  { type: "Report" as const, id: "DAILY" },
  { type: "Finance" as const, id: "SUMMARY" },
];

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listOrders: builder.query<PageResponse<OrderResponse>, OrderListQuery | void>({
      query: (params) => ({ url: "/api/admin/orders", params: params ?? undefined }),
      transformResponse: unwrap<PageResponse<OrderResponse>>,
      providesTags: (result) =>
        result
          ? [
              ...result.content.map(({ id }) => ({ type: "Order" as const, id })),
              { type: "Order" as const, id: "LIST" },
            ]
          : [{ type: "Order" as const, id: "LIST" }],
    }),

    getOrder: builder.query<OrderResponse, UUID>({
      query: (id) => `/api/admin/orders/${id}`,
      transformResponse: unwrap<OrderResponse>,
      providesTags: (_r, _e, id) => [{ type: "Order", id }],
    }),

    getOrderHistory: builder.query<OrderAuditLogResponse[], UUID>({
      query: (id) => `/api/admin/orders/${id}/history`,
      transformResponse: unwrap<OrderAuditLogResponse[]>,
      providesTags: (_r, _e, id) => [{ type: "OrderHistory", id }],
    }),

    /** Cash-on-pickup orders waiting for staff to take the money. */
    listAwaitingPickup: builder.query<PageResponse<OrderResponse>, PageQuery | void>({
      query: (params) => ({
        url: "/api/admin/orders/awaiting-pickup",
        params: params ?? undefined,
      }),
      transformResponse: unwrap<PageResponse<OrderResponse>>,
      providesTags: [{ type: "Order", id: "AWAITING_PICKUP" }],
    }),

    /** Bakong payments the customer claims to have sent, pending staff confirmation. */
    listAwaitingBakongConfirmation: builder.query<
      PageResponse<OrderResponse>,
      PageQuery | void
    >({
      query: (params) => ({
        url: "/api/admin/orders/awaiting-bakong-confirmation",
        params: params ?? undefined,
      }),
      transformResponse: unwrap<PageResponse<OrderResponse>>,
      providesTags: [{ type: "Order", id: "AWAITING_BAKONG" }],
    }),

    collectCash: builder.mutation<OrderResponse, { id: UUID; body: CashPaymentRequest }>({
      query: ({ id, body }) => ({
        url: `/api/admin/orders/${id}/collect-cash`,
        method: "POST",
        body,
      }),
      transformResponse: unwrap<OrderResponse>,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Order", id },
        { type: "OrderHistory", id },
        "Inventory", "StockMovement", "Product",
        ...ORDER_QUEUE_TAGS,
      ],
    }),

    acceptBakongPayment: builder.mutation<OrderResponse, UUID>({
      query: (id) => ({ url: `/api/admin/orders/${id}/accept-bakong`, method: "POST" }),
      transformResponse: unwrap<OrderResponse>,
      invalidatesTags: (_r, _e, id) => [
        { type: "Order", id },
        { type: "OrderHistory", id },
        "Inventory", "StockMovement", "Product",
        ...ORDER_QUEUE_TAGS,
      ],
    }),

    cancelOrder: builder.mutation<OrderResponse, UUID>({
      query: (id) => ({ url: `/api/admin/orders/${id}/cancel`, method: "POST" }),
      transformResponse: unwrap<OrderResponse>,
      // Only unpaid orders can be cancelled; the backend cuts stock upon payment.
      invalidatesTags: (_r, _e, id) => [
        { type: "Order", id },
        { type: "OrderHistory", id },
        { type: "Inventory", id: "LIST" },
        ...ORDER_QUEUE_TAGS,
      ],
    }),

    /**
     * The admin mirror of the barista's queue actions, so a manager covering the bar can move
     * orders along on their own account. Money and stock both moved at payment, so these only
     * invalidate the board.
     */
    startPreparingOrder: builder.mutation<OrderResponse, UUID>({
      query: (id) => ({
        url: `/api/admin/orders/${id}/start-preparing`,
        method: "POST",
      }),
      transformResponse: unwrap<OrderResponse>,
      invalidatesTags: (_r, _e, id) => [
        { type: "Order", id },
        { type: "OrderHistory", id },
        ...ORDER_QUEUE_TAGS,
      ],
    }),


    dispatchAdminOrder: builder.mutation<OrderResponse, UUID>({
      query: (id) => ({ url: `/api/admin/orders/${id}/dispatch`, method: "POST" }),
      transformResponse: unwrap<OrderResponse>,
      invalidatesTags: (_r, _e, id) => [
        { type: "Order", id },
        { type: "OrderHistory", id },
        ...ORDER_QUEUE_TAGS,
      ],
    }),

    markDeliveredAdminOrder: builder.mutation<OrderResponse, UUID>({
      query: (id) => ({ url: `/api/admin/orders/${id}/delivered`, method: "POST" }),
      transformResponse: unwrap<OrderResponse>,
      invalidatesTags: (_r, _e, id) => [
        { type: "Order", id },
        { type: "OrderHistory", id },
        ...ORDER_QUEUE_TAGS,
      ],
    }),

    completeOrder: builder.mutation<OrderResponse, UUID>({
      query: (id) => ({ url: `/api/admin/orders/${id}/complete`, method: "POST" }),
      transformResponse: unwrap<OrderResponse>,
      invalidatesTags: (_r, _e, id) => [
        { type: "Order", id },
        { type: "OrderHistory", id },
        ...ORDER_QUEUE_TAGS,
      ],
    }),
  }),
});

export const {
  useListOrdersQuery,
  useGetOrderQuery,
  useGetOrderHistoryQuery,
  useListAwaitingPickupQuery,
  useListAwaitingBakongConfirmationQuery,
  useCollectCashMutation,
  useAcceptBakongPaymentMutation,
  useCancelOrderMutation,
  useStartPreparingOrderMutation,
  useCompleteOrderMutation,
  useDispatchAdminOrderMutation,
  useMarkDeliveredAdminOrderMutation,
} = orderApi;
