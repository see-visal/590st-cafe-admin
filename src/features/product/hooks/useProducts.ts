/**
 * Custom hooks for product management using API
 */

import { useCallback, useState } from "react";
import { productService } from "@/features/product/api/productApi";
import {
  ProductRequest,
  ProductResponse,
  Category,
  CategoryRequest,
} from "@/features/product/types/product.type";
import { ApiError } from "@/lib/apiClient";
import toast from "react-hot-toast";

/**
 * Hook for fetching all products
 */
export function useProducts() {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await productService.getAllProducts();
      setProducts(data);
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError(500, "Failed to fetch products");
      setError(apiError);
      toast.error(apiError.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    products,
    isLoading,
    error,
    refetch: fetchProducts,
  };
}

/**
 * Hook for fetching all categories
 */
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await productService.getAllCategories();
      setCategories(data);
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError(500, "Failed to fetch categories");
      setError(apiError);
      console.error("Error fetching categories:", apiError);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    categories,
    isLoading,
    error,
    refetch: fetchCategories,
  };
}

/**
 * Hook for creating products
 */
export function useCreateProduct() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const create = useCallback(async (data: ProductRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await productService.createProduct(data);
      toast.success("Product created successfully");
      return result;
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError(500, "Failed to create product");
      setError(apiError);
      toast.error(apiError.message);
      throw apiError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    create,
    isLoading,
    error,
  };
}

/**
 * Hook for updating products
 */
export function useUpdateProduct() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const update = useCallback(async (id: number, data: ProductRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await productService.updateProduct(id, data);
      toast.success("Product updated successfully");
      return result;
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError(500, "Failed to update product");
      setError(apiError);
      toast.error(apiError.message);
      throw apiError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    update,
    isLoading,
    error,
  };
}

/**
 * Hook for deleting products
 */
export function useDeleteProduct() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const delete_ = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await productService.deleteProduct(id);
      toast.success("Product deleted successfully");
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError(500, "Failed to delete product");
      setError(apiError);
      toast.error(apiError.message);
      throw apiError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    delete: delete_,
    isLoading,
    error,
  };
}

/**
 * Hook for creating categories
 */
export function useCreateCategory() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const create = useCallback(async (payload: CategoryRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await productService.createCategory(payload);
      toast.success("Category created successfully");
      return result;
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError(500, "Failed to create category");
      setError(apiError);
      toast.error(apiError.message);
      throw apiError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    create,
    isLoading,
    error,
  };
}

/**
 * Hook for updating categories
 */
export function useUpdateCategory() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const update = useCallback(async (id: number, payload: CategoryRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await productService.updateCategory(id, payload);
      toast.success("Category updated successfully");
      return result;
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError(500, "Failed to update category");
      setError(apiError);
      toast.error(apiError.message);
      throw apiError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    update,
    isLoading,
    error,
  };
}

/**
 * Hook for deleting categories
 */
export function useDeleteCategory() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const remove = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await productService.deleteCategory(id);
      toast.success("Category deleted successfully");
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError(500, "Failed to delete category");
      setError(apiError);
      toast.error(apiError.message);
      throw apiError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    delete: remove,
    isLoading,
    error,
  };
}
