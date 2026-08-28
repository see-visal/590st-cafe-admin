"use client";

import { useEffect, useMemo, useState } from "react";

export const PAGE_SIZE_OPTIONS = [5, 10, 25, 50] as const;

/**
 * Client-side pagination over an already-filtered list.
 *
 * Resets to page 1 whenever the row count changes, so narrowing a filter can
 * never strand the user on a page that no longer exists.
 */
export function usePagination<T>(rows: readonly T[], initialPageSize = 10) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);

  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    setPage(1);
  }, [total, pageSize]);

  const pageRows = useMemo(
    () => rows.slice((page - 1) * pageSize, page * pageSize),
    [rows, page, pageSize]
  );

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return {
    page,
    pageSize,
    total,
    totalPages,
    pageRows,
    from,
    to,
    setPage: (next: number) => setPage(Math.min(Math.max(1, next), totalPages)),
    setPageSize,
  };
}

export type Pagination<T> = ReturnType<typeof usePagination<T>>;
