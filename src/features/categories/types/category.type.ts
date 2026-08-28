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
