export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SelectOption<TValue extends string | number = string> {
  label: string;
  value: TValue;
}

export type FormatInput = number | string | null | undefined;
