"use client";

import { Download, Plus } from "lucide-react";
import { ActionButton } from "@/components/forms/ActionButton";

interface TableActionButtonsProps {
  primaryLabel?: string;
}

export function TableActionButtons({ primaryLabel = "Register" }: TableActionButtonsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <ActionButton icon={<Download className="h-4 w-4" />}>
        Download Excel
      </ActionButton>
      <ActionButton variant="dark" icon={<Plus className="h-4 w-4" />}>
        {primaryLabel}
      </ActionButton>
    </div>
  );
}
