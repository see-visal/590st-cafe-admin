export { default as ProductManagementView } from "./components/product-management-view";
export { productApi } from "./api/product-api";
export { useProducts } from "./hooks/use-products";
export { useProduct } from "./hooks/use-product";
export { useCreateProduct } from "./hooks/use-create-product";
export { useUpdateProduct } from "./hooks/use-update-product";
export { useDeleteProduct } from "./hooks/use-delete-product";
export { productSchema } from "./schemas/product-schema";
export type { Product, ProductRequest, ProductResponse, ProductStatus } from "./types/product.type";
