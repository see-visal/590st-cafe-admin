"use client";

import { ReactNode } from "react";
import { BreadcrumbItem, Breadcrumbs } from "@/components/shared/breadcrumbs";
import { SidebarCollapseTrigger } from "@/components/layout/sidebar-collapse-trigger";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  breadcrumbs: BreadcrumbItem[];
  rightSlot?: ReactNode;
  titleAction?: ReactNode;
}

export function PageHeader({ title, breadcrumbs, rightSlot, titleAction }: PageHeaderProps) {
  return (
    <>
      <div className="page_header">
        <div className="header_top_row">
          <div className="header_breadcrumb_row">
            <SidebarCollapseTrigger />
            <Breadcrumbs items={breadcrumbs} />
          </div>
          {rightSlot}
        </div>
      </div>
      <div className={cn("page_title_row", titleAction && "has_action")}>
        <h1 className="page_title">{title}</h1>
        {titleAction}
      </div>
    </>
  );
}
