"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  count?: number;
  variant?: "text" | "circle" | "rect";
  height?: string;
  width?: string;
}

/**
 * Generic skeleton loader component
 */
export function Skeleton({
  count = 1,
  variant = "text",
  height = "h-4",
  width = "w-full",
  className,
  ...props
}: SkeletonProps) {
  const baseClasses = "bg-gray-200 animate-pulse rounded";

  const variantClasses = {
    text: "h-4 w-full rounded",
    circle: "h-10 w-10 rounded-full",
    rect: "h-20 w-full rounded-lg",
  };

  const skeletons = Array.from({ length: count }).map((_, i) => (
    <div
      key={i}
      className={cn(
        baseClasses,
        variantClasses[variant],
        height !== "h-4" && height,
        width !== "w-full" && width,
        className,
        i < count - 1 && "mb-3"
      )}
      {...props}
    />
  ));

  return count === 1 ? skeletons[0] : <div className="space-y-2">{skeletons}</div>;
}

/**
 * Skeleton for table rows
 */
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex gap-3">
          {Array.from({ length: cols }).map((_, colIdx) => (
            <Skeleton key={colIdx} width={`w-${(colIdx + 1) * 10}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton for card grid
 */
export function CardGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg p-4 space-y-3">
          <Skeleton variant="text" height="h-6" />
          <Skeleton variant="text" height="h-8" width="w-1/2" />
          <Skeleton variant="text" height="h-4" />
        </div>
      ))}
    </div>
  );
}

/**
 * Loading spinner component
 */
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
}

export function LoadingSpinner({ size = "md", fullScreen = false }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const spinner = (
    <div
      className={cn(
        sizeClasses[size],
        "border-4 border-gray-200 border-t-lime-600 rounded-full animate-spin"
      )}
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/50 z-50">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      {spinner}
    </div>
  );
}
