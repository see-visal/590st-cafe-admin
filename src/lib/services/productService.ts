/**
 * Products API service - handles all product-related API calls
 */

import { apiClient } from "@/lib/services/apiClient";
import {
  ProductRequest,
  ProductResponse,
  Category,
  CategoryRequest,
} from "@/types/Product";

const PRODUCT_ENDPOINT = "/api/v1/product";
const CATEGORY_ENDPOINT = "/api/v1/category";

export const productService = {
  /**
   * Fetch all products
   */
  getAllProducts: async (): Promise<ProductResponse[]> => {
    try {
      const response = await apiClient.get<ProductResponse[]>(PRODUCT_ENDPOINT);
      return response;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  /**
   * Fetch product by ID
   */
  getProductById: async (id: number): Promise<ProductResponse> => {
    try {
      const response = await apiClient.get<ProductResponse>(
        `${PRODUCT_ENDPOINT}/${id}`
      );
      return response;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create new product
   */
  createProduct: async (
    productData: ProductRequest
  ): Promise<ProductResponse> => {
    try {
      const response = await apiClient.post<ProductResponse>(
        PRODUCT_ENDPOINT,
        productData
      );
      return response;
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  },

  /**
   * Update existing product
   */
  updateProduct: async (
    id: number,
    productData: ProductRequest
  ): Promise<ProductResponse> => {
    try {
      const response = await apiClient.put<ProductResponse>(
        `${PRODUCT_ENDPOINT}/${id}`,
        productData
      );
      return response;
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete product
   */
  deleteProduct: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`${PRODUCT_ENDPOINT}/${id}`);
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      throw error;
    }
  },

  /**
   * Fetch all categories
   */
  getAllCategories: async (): Promise<Category[]> => {
    try {
      const response = await apiClient.get<Category[]>(CATEGORY_ENDPOINT);
      return response;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  },

  /**
   * Create new category
   */
  createCategory: async (payload: CategoryRequest): Promise<Category> => {
    try {
      const response = await apiClient.post<Category>(CATEGORY_ENDPOINT, payload);
      return response;
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  },

  /**
   * Update existing category
   */
  updateCategory: async (id: number, payload: CategoryRequest): Promise<Category> => {
    try {
      const response = await apiClient.put<Category>(`${CATEGORY_ENDPOINT}/${id}`, payload);
      return response;
    } catch (error) {
      console.error(`Error updating category ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete category
   */
  deleteCategory: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`${CATEGORY_ENDPOINT}/${id}`);
    } catch (error) {
      console.error(`Error deleting category ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get products by category
   */
  getProductsByCategory: async (categoryId: number): Promise<ProductResponse[]> => {
    try {
      const response = await apiClient.get<ProductResponse[]>(
        `${PRODUCT_ENDPOINT}/category/${categoryId}`
      );
      return response;
    } catch (error) {
      console.error(`Error fetching products for category ${categoryId}:`, error);
      throw error;
    }
  },
};
