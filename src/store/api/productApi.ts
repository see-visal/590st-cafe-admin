import { baseApi, unwrap } from "./baseApi";
import type {
  CreateProductRequest,
  CreateProductSizeOptionRequest,
  PageQuery,
  PageResponse,
  ProductImportResponse,
  ProductResponse,
  ProductSizeOptionResponse,
  SetProductDiscountRequest,
  UpdateProductRequest,
  UpdateProductSizeOptionRequest,
  UUID,
} from "./types";

interface ProductListQuery extends PageQuery {
  categoryId?: UUID;
}

export const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listProducts: builder.query<PageResponse<ProductResponse>, ProductListQuery | void>({
      query: (params) => ({ url: "/api/admin/products", params: params ?? undefined }),
      transformResponse: unwrap<PageResponse<ProductResponse>>,
      providesTags: (result) =>
        result
          ? [
              ...result.content.map(({ id }) => ({ type: "Product" as const, id })),
              { type: "Product" as const, id: "LIST" },
            ]
          : [{ type: "Product" as const, id: "LIST" }],
    }),

    getProduct: builder.query<ProductResponse, UUID>({
      query: (id) => `/api/admin/products/${id}`,
      transformResponse: unwrap<ProductResponse>,
      providesTags: (_r, _e, id) => [{ type: "Product", id }],
    }),

    createProduct: builder.mutation<ProductResponse, CreateProductRequest>({
      query: (body) => ({ url: "/api/admin/products", method: "POST", body }),
      transformResponse: unwrap<ProductResponse>,
      // A new product also creates its inventory row, so the stock screens are stale too.
      invalidatesTags: [
        { type: "Product", id: "LIST" },
        { type: "Inventory", id: "LIST" },
        { type: "Inventory", id: "LOW_STOCK" },
      ],
    }),

    updateProduct: builder.mutation<
      ProductResponse,
      { id: UUID; body: UpdateProductRequest }
    >({
      query: ({ id, body }) => ({
        url: `/api/admin/products/${id}`,
        method: "PATCH",
        body,
      }),
      transformResponse: unwrap<ProductResponse>,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Product", id },
        { type: "Product", id: "LIST" },
        { type: "Inventory", id: "LIST" },
        { type: "Inventory", id: "LOW_STOCK" },
      ],
    }),

    deleteProduct: builder.mutation<void, UUID>({
      query: (id) => ({ url: `/api/admin/products/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Product", id },
        { type: "Product", id: "LIST" },
        { type: "Inventory", id: "LIST" },
        { type: "Inventory", id: "LOW_STOCK" },
      ],
    }),

    setProductDiscount: builder.mutation<
      ProductResponse,
      { id: UUID; body: SetProductDiscountRequest }
    >({
      query: ({ id, body }) => ({
        url: `/api/admin/products/${id}/discount`,
        method: "PUT",
        body,
      }),
      transformResponse: unwrap<ProductResponse>,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Product", id },
        { type: "Product", id: "LIST" },
      ],
    }),

    clearProductDiscount: builder.mutation<ProductResponse, UUID>({
      query: (id) => ({ url: `/api/admin/products/${id}/discount`, method: "DELETE" }),
      transformResponse: unwrap<ProductResponse>,
      invalidatesTags: (_r, _e, id) => [
        { type: "Product", id },
        { type: "Product", id: "LIST" },
      ],
    }),

    uploadProductImage: builder.mutation<ProductResponse, { id: UUID; file: File }>({
      query: ({ id, file }) => {
        const formData = new FormData();
        formData.append("file", file);
        // No explicit Content-Type: the browser must set the multipart boundary itself.
        return { url: `/api/admin/products/${id}/image`, method: "POST", body: formData };
      },
      transformResponse: unwrap<ProductResponse>,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Product", id },
        { type: "Product", id: "LIST" },
      ],
    }),

    removeProductImage: builder.mutation<ProductResponse, UUID>({
      query: (id) => ({ url: `/api/admin/products/${id}/image`, method: "DELETE" }),
      transformResponse: unwrap<ProductResponse>,
      invalidatesTags: (_r, _e, id) => [
        { type: "Product", id },
        { type: "Product", id: "LIST" },
      ],
    }),

    importProducts: builder.mutation<ProductImportResponse, File>({
      query: (file) => {
        const formData = new FormData();
        formData.append("file", file);
        return { url: "/api/admin/products/import", method: "POST", body: formData };
      },
      transformResponse: unwrap<ProductImportResponse>,
      invalidatesTags: [
        { type: "Product", id: "LIST" },
        { type: "Inventory", id: "LIST" },
        { type: "Inventory", id: "LOW_STOCK" },
      ],
    }),

    // ---- size options ----

    listSizeOptions: builder.query<ProductSizeOptionResponse[], UUID>({
      query: (productId) => `/api/admin/products/${productId}/size-options`,
      transformResponse: unwrap<ProductSizeOptionResponse[]>,
      providesTags: (_r, _e, productId) => [{ type: "SizeOption", id: productId }],
    }),

    createSizeOption: builder.mutation<
      ProductSizeOptionResponse,
      { productId: UUID; body: CreateProductSizeOptionRequest }
    >({
      query: ({ productId, body }) => ({
        url: `/api/admin/products/${productId}/size-options`,
        method: "POST",
        body,
      }),
      transformResponse: unwrap<ProductSizeOptionResponse>,
      invalidatesTags: (_r, _e, { productId }) => [
        { type: "SizeOption", id: productId },
        { type: "Product", id: productId },
      ],
    }),

    updateSizeOption: builder.mutation<
      ProductSizeOptionResponse,
      { productId: UUID; id: UUID; body: UpdateProductSizeOptionRequest }
    >({
      query: ({ productId, id, body }) => ({
        url: `/api/admin/products/${productId}/size-options/${id}`,
        method: "PATCH",
        body,
      }),
      transformResponse: unwrap<ProductSizeOptionResponse>,
      invalidatesTags: (_r, _e, { productId }) => [
        { type: "SizeOption", id: productId },
        { type: "Product", id: productId },
      ],
    }),

    deleteSizeOption: builder.mutation<void, { productId: UUID; id: UUID }>({
      query: ({ productId, id }) => ({
        url: `/api/admin/products/${productId}/size-options/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { productId }) => [
        { type: "SizeOption", id: productId },
        { type: "Product", id: productId },
      ],
    }),
  }),
});

export const {
  useListProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useSetProductDiscountMutation,
  useClearProductDiscountMutation,
  useUploadProductImageMutation,
  useRemoveProductImageMutation,
  useImportProductsMutation,
  useListSizeOptionsQuery,
  useCreateSizeOptionMutation,
  useUpdateSizeOptionMutation,
  useDeleteSizeOptionMutation,
} = productApi;
