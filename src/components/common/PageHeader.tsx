"use client";

import { ReactNode } from "react";
import { BreadcrumbItem, Breadcrumbs } from "@/components/common/Breadcrumbs";
import { SidebarCollapseTrigger } from "@/components/layout/SidebarCollapseTrigger";

interface PageHeaderProps {
  title: string;
  breadcrumbs: BreadcrumbItem[];
  rightSlot?: ReactNode;
}

export function PageHeader({ title, breadcrumbs, rightSlot }: PageHeaderProps) {
  return (
    <div className="page_header">
      <div className="header_top_row">
        <div className="header_breadcrumb_row">
          <SidebarCollapseTrigger />
          <Breadcrumbs items={breadcrumbs} />
        </div>
        {rightSlot}
      </div>
      <h1 className="page_title">{title}</h1>
    </div>
  );
}
