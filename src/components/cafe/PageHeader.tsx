"use client";

import { ReactNode } from "react";
import { BreadcrumbItem, Breadcrumbs } from "@/components/cafe/Breadcrumbs";

interface PageHeaderProps {
  title: string;
  breadcrumbs: BreadcrumbItem[];
  rightSlot?: ReactNode;
}

export function PageHeader({ title, breadcrumbs, rightSlot }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-gray-200 pb-4">
      <div className="flex items-center justify-between">
        <Breadcrumbs items={breadcrumbs} />
        {rightSlot}
      </div>
      <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
    </div>
  );
}
