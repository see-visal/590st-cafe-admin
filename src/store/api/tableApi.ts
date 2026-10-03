import { baseApi, unwrap } from "./baseApi";
import type {
  CreateTableRequest,
  OrderResponse,
  PageQuery,
  PageResponse,
  TableActivityResponse,
  TableResponse,
  TableStatus,
  UpdateTableRequest,
  UpdateTableStatusRequest,
  UUID,
} from "./types";

export const tableApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listTables: builder.query<PageResponse<TableResponse>, (PageQuery & { status?: TableStatus }) | void>({
      query: (params) => ({ url: "/api/admin/tables", params: params ?? undefined }),
      transformResponse: unwrap<PageResponse<TableResponse>>,
      providesTags: (result) =>
        result
          ? [
              ...result.content.map(({ id }) => ({ type: "Table" as const, id })),
              { type: "Table" as const, id: "LIST" },
            ]
          : [{ type: "Table" as const, id: "LIST" }],
    }),

    // Barista view: every table with its open orders and staff calls in one request.
    listBaristaTables: builder.query<TableActivityResponse[], void>({
      query: () => "/api/barista/tables",
      transformResponse: unwrap<TableActivityResponse[]>,
      providesTags: [{ type: "Table", id: "LIST" }, { type: "Order", id: "LIST" }],
    }),

    updateBaristaTableStatus: builder.mutation<TableResponse, { id: UUID; body: UpdateTableStatusRequest }>({
      query: ({ id, body }) => ({ url: `/api/barista/tables/${id}/status`, method: "PATCH", body }),
      transformResponse: unwrap<TableResponse>,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Table", id },
        { type: "Table", id: "LIST" },
      ],
    }),

    // Public list (no admin role needed), so baristas can pick a table in POS.
    listPublicTables: builder.query<TableResponse[], void>({
      query: () => "/api/tables",
      transformResponse: unwrap<TableResponse[]>,
      providesTags: [{ type: "Table", id: "LIST" }],
    }),

    getMenuLink: builder.query<{ url: string }, void>({
      query: () => "/api/admin/tables/menu-link",
      transformResponse: unwrap<{ url: string }>,
    }),

    listTableOrders: builder.query<OrderResponse[], UUID>({
      query: (id) => `/api/admin/tables/${id}/orders`,
      transformResponse: unwrap<OrderResponse[]>,
      providesTags: (_r, _e, id) => [{ type: "Table", id: `ORDERS-${id}` }, { type: "Order", id: "LIST" }],
    }),

    createTable: builder.mutation<TableResponse, CreateTableRequest>({
      query: (body) => ({ url: "/api/admin/tables", method: "POST", body }),
      transformResponse: unwrap<TableResponse>,
      invalidatesTags: [{ type: "Table", id: "LIST" }],
    }),

    updateTable: builder.mutation<TableResponse, { id: UUID; body: UpdateTableRequest }>({
      query: ({ id, body }) => ({ url: `/api/admin/tables/${id}`, method: "PATCH", body }),
      transformResponse: unwrap<TableResponse>,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Table", id },
        { type: "Table", id: "LIST" },
      ],
    }),

    updateTableStatus: builder.mutation<TableResponse, { id: UUID; body: UpdateTableStatusRequest }>({
      query: ({ id, body }) => ({ url: `/api/admin/tables/${id}/status`, method: "PATCH", body }),
      transformResponse: unwrap<TableResponse>,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Table", id },
        { type: "Table", id: "LIST" },
      ],
    }),

    deleteTable: builder.mutation<void, UUID>({
      query: (id) => ({ url: `/api/admin/tables/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Table", id },
        { type: "Table", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useListTablesQuery,
  useGetMenuLinkQuery,
  useListPublicTablesQuery,
  useListBaristaTablesQuery,
  useUpdateBaristaTableStatusMutation,
  useListTableOrdersQuery,
  useCreateTableMutation,
  useUpdateTableMutation,
  useUpdateTableStatusMutation,
  useDeleteTableMutation,
} = tableApi;
