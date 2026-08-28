"use client";

import { useId, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * Labelled auth input with an optional leading icon, an optional trailing
 * control (e.g. the password reveal toggle) and inline error text.
 */
export function AuthField({
  label,
  error,
  leadingIcon,
  trailing,
  className,
  ...props
}: React.ComponentProps<"input"> & {
  label: string;
  error?: string;
  leadingIcon?: ReactNode;
  trailing?: ReactNode;
}) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div>
      <Label htmlFor={id} className="text-xs font-medium text-gray-700">
        {label}
      </Label>
      <div className="relative mt-1.5">
        {leadingIcon && (
          <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-gray-400">
            {leadingIcon}
          </span>
        )}
        <Input
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "h-9 rounded-md border-gray-300 text-xs",
            leadingIcon && "pl-10",
            trailing && "pr-10",
            error && "border-red-400 focus-visible:border-red-500",
            className
          )}
          {...props}
        />
        {trailing && (
          <span className="absolute top-1/2 right-3.5 -translate-y-1/2 text-gray-400">
            {trailing}
          </span>
        )}
      </div>
      {error && (
        <p id={errorId} className="mt-1 text-[11px] leading-tight text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
