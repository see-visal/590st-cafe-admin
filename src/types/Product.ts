/**
 * Product types and interfaces for the admin dashboard
 */

export type ProductStatus = "ACTIVE" | "INACTIVE";
export type CategoryStatus = "ACTIVE" | "INACTIVE";

export interface Category {
  id: number;
  name: string;
  status: CategoryStatus;
  items?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CategoryRequest {
  name: string;
  status?: CategoryStatus;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  categoryId: number;
  category?: Category | string; // Can be category object or just name
  status: ProductStatus;
  imageUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductRequest {
  name: string;
  price: number;
  categoryId: number;
  status?: ProductStatus;
  imageUrl?: string;
}

export interface ProductResponse {
  id: number;
  name: string;
  price: number;
  categoryId: number;
  category?: string; // Category name
  status: ProductStatus;
  imageUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}
