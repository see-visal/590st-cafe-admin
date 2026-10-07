import { baseApi, unwrap } from "./baseApi";
import type {
  InventoryResponse,
  PageQuery,
  PageResponse,
  StockCutRequest,
  StockCutResponse,
  StockInImportResponse,
  StockInRequest,
  StockMovementResponse,
  UUID,
} from "./types";

const STOCK_MOVEMENT_TAGS = (productId: UUID) => [
  { type: "Inventory" as const, id: productId },
  { type: "Inventory" as const, id: "LIST" },
  { type: "Inventory" as const, id: "LOW_STOCK" },
  { type: "StockMovement" as const, id: productId },
  { type: "Product" as const, id: productId },
  { type: "Product" as const, id: "LIST" },
];

export const inventoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listInventory: builder.query<
      PageResponse<InventoryResponse>,
      PageQuery | void
    >({
      query: (params) => ({
        url: "/api/admin/inventory",
        params: params ?? undefined,
      }),
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

    listLowStock: builder.query<
      PageResponse<InventoryResponse>,
      PageQuery | void
    >({
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
      providesTags: (_r, _e, productId) => [
        { type: "Inventory", id: productId },
      ],
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
      providesTags: (_r, _e, { productId }) => [
        { type: "StockMovement", id: productId },
      ],
    }),

    stockIn: builder.mutation<StockMovementResponse, StockInRequest>({
      query: (body) => ({
        url: "/api/admin/inventory/stock-in",
        method: "POST",
        body,
      }),
      transformResponse: unwrap<StockMovementResponse>,
      invalidatesTags: (_r, _e, { productId }) =>
        STOCK_MOVEMENT_TAGS(productId),
    }),

    stockCut: builder.mutation<StockCutResponse, StockCutRequest>({
      query: (body) => ({
        url: "/api/admin/inventory/stock-cut",
        method: "POST",
        body,
      }),
      transformResponse: unwrap<StockCutResponse>,
      invalidatesTags: (_r, _e, { productId }) =>
        STOCK_MOVEMENT_TAGS(productId),
    }),

    downloadStockInImportTemplate: builder.mutation<Blob, void>({
      query: () => ({
        url: "/api/admin/inventory/stock-in/import/template",
        responseHandler: (response: Response) =>
          response.ok ? response.blob() : response.json(),
      }),
    }),

    stockInFromExcel: builder.mutation<StockInImportResponse, File>({
      query: (file) => {
        const formData = new FormData();
        formData.append("file", file);
        return {
          url: "/api/admin/inventory/stock-in/import",
          method: "POST",
          body: formData,
        };
      },
      transformResponse: unwrap<StockInImportResponse>,
      invalidatesTags: [
        { type: "Inventory", id: "LIST" },
        { type: "Inventory", id: "LOW_STOCK" },
        { type: "Product", id: "LIST" },
      ],
    }),

    downloadMonthlyStockExpenseReport: builder.mutation<
      Blob,
      { month: string } | void
    >({
      query: (args) => ({
        url: "/api/admin/inventory/expenses/report/monthly",
        params: args?.month ? { month: args.month } : undefined,
        responseHandler: (response: Response) =>
          response.ok ? response.blob() : response.json(),
      }),
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
  useDownloadStockInImportTemplateMutation,
  useStockInFromExcelMutation,
  useDownloadMonthlyStockExpenseReportMutation,
} = inventoryApi;
