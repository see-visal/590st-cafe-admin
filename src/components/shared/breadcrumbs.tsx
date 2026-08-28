"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex min-w-0 items-center gap-2 text-xs text-gray-500", className)}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div
            key={`${item.label}-${index}`}
            className={cn(
              "items-center gap-2",
              // Only the current page survives on a phone; the ancestors would
              // otherwise push the header actions off screen.
              isLast ? "flex min-w-0" : "hidden sm:flex"
            )}
          >
            {item.href && !isLast ? (
              <Link href={item.href} className="hover:text-gray-800">
                {item.label}
              </Link>
            ) : (
              <span className={cn("truncate", isLast && "text-gray-900")}>
                {item.label}
              </span>
            )}
            {!isLast && (
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            )}
          </div>
        );
      })}
    </nav>
  );
}
