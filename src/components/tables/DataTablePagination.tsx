"use client";

import { PaginationInline } from "@/components/tables/PaginationInline";
import { MiniSelect } from "@/components/forms/MiniSelect";

export function TablePaginationRow() {
  return (
    <div className="flex flex-col gap-3 border-t border-gray-100 pt-3 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span>Show Per Page:</span>
        <MiniSelect options={["5", "10", "20"]} />
      </div>
      <PaginationInline />
    </div>
  );
}
