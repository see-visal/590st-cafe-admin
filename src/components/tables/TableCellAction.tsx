"use client";

import { Eye, Pencil, Trash2 } from "lucide-react";

export function TableCellAction() {
  return (
    <div className="flex items-center gap-2">
      <button className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-white">
        <Eye className="h-3.5 w-3.5" />
      </button>
      <button className="flex h-7 w-7 items-center justify-center rounded-full bg-lime-300 text-black">
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-600">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
