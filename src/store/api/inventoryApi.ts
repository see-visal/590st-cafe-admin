import { baseApi, unwrap } from "./baseApi";
import type {
  InventoryResponse,
  PageQuery,
  PageResponse,
  StockCutRequest,
  StockCutResponse,
  StockInRequest,
  StockMovementResponse,
  UUID,
} from "./types";

export const inventoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listInventory: builder.query<PageResponse<InventoryResponse>, PageQuery | void>({
      query: (params) => ({ url: "/api/admin/inventory", params: params ?? undefined }),
      transformResponse: unwrap<PageResponse<InventoryResponse>>,
      providesTags: (result) =>
        result
          ? [
              ...result.content.map(({ productId }) => ({
                type: "Inventory" as const,
                id: productId,
              })),
              { type: "Inventory" as const, id: "LIST" },
            ]
          : [{ type: "Inventory" as const, id: "LIST" }],
    }),

    /** Backs the stock-alerts screen: everything at or below its reorder level. */
    listLowStock: builder.query<PageResponse<InventoryResponse>, PageQuery | void>({
      query: (params) => ({
        url: "/api/admin/inventory/low-stock",
        params: params ?? undefined,
      }),
      transformResponse: unwrap<PageResponse<InventoryResponse>>,
      providesTags: [{ type: "Inventory", id: "LOW_STOCK" }],
    }),

    getInventoryByProduct: builder.query<InventoryResponse, UUID>({
      query: (productId) => `/api/admin/inventory/${productId}`,
      transformResponse: unwrap<InventoryResponse>,
      providesTags: (_r, _e, productId) => [{ type: "Inventory", id: productId }],
    }),

    listStockMovements: builder.query<
      PageResponse<StockMovementResponse>,
      { productId: UUID } & PageQuery
    >({
      query: ({ productId, ...params }) => ({
        url: `/api/admin/inventory/${productId}/movements`,
        params,
      }),
      transformResponse: unwrap<PageResponse<StockMovementResponse>>,
      providesTags: (_r, _e, { productId }) => [{ type: "StockMovement", id: productId }],
    }),

    stockIn: builder.mutation<StockMovementResponse, StockInRequest>({
      query: (body) => ({ url: "/api/admin/inventory/stock-in", method: "POST", body }),
      transformResponse: unwrap<StockMovementResponse>,
      invalidatesTags: (_r, _e, { productId }) => [
        { type: "Inventory", id: productId },
        { type: "Inventory", id: "LIST" },
        { type: "Inventory", id: "LOW_STOCK" },
        { type: "StockMovement", id: productId },
        { type: "Product", id: productId },
        { type: "Product", id: "LIST" },
      ],
    }),

    stockCut: builder.mutation<StockCutResponse, StockCutRequest>({
      query: (body) => ({ url: "/api/admin/inventory/stock-cut", method: "POST", body }),
      transformResponse: unwrap<StockCutResponse>,
      invalidatesTags: (_r, _e, { productId }) => [
        { type: "Inventory", id: productId },
        { type: "Inventory", id: "LIST" },
        { type: "Inventory", id: "LOW_STOCK" },
        { type: "StockMovement", id: productId },
        { type: "Product", id: productId },
        { type: "Product", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useListInventoryQuery,
  useListLowStockQuery,
  useGetInventoryByProductQuery,
  useListStockMovementsQuery,
  useStockInMutation,
  useStockCutMutation,
} = inventoryApi;
