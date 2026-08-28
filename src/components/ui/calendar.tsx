"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";

/**
 * Calendar styled to the admin design system rather than the shadcn defaults:
 *
 *   surfaces  #FFFFFF on #EDEDED dividers, #CED1D8 control borders
 *   text      #1E1E1E headings, #333333 days, #6b7280 muted, #9ca3af outside
 *   selection black endpoints with a #f0fce0 lime band — the same tint the
 *             product picker uses for its selected row
 *   today     a #befe35 ring, matching the sidebar/filter accent
 *   nav       28px bordered buttons, matching .pagination_btn
 */
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4", className)}
      classNames={{
        // Two months sit side by side with a hairline divider between them.
        months:
          "relative flex flex-col gap-5 sm:flex-row sm:gap-0 sm:divide-x sm:divide-[#EDEDED]",
        month: "flex flex-col gap-3 sm:px-4 sm:first:pl-0 sm:last:pr-0",

        month_caption: "flex h-7 items-center justify-center",
        caption_label: "text-sm font-semibold text-[#1E1E1E]",

        nav: "absolute inset-x-0 top-0 z-10 flex items-center justify-between",
        button_previous: cn(
          "inline-flex size-7 items-center justify-center rounded-md border",
          "border-[#CED1D8] bg-white text-[#333333]",
          "transition-colors hover:bg-[#F4F4F4] hover:text-black",
          "disabled:pointer-events-none disabled:opacity-40"
        ),
        button_next: cn(
          "inline-flex size-7 items-center justify-center rounded-md border",
          "border-[#CED1D8] bg-white text-[#333333]",
          "transition-colors hover:bg-[#F4F4F4] hover:text-black",
          "disabled:pointer-events-none disabled:opacity-40"
        ),

        month_grid: "w-max border-collapse",
        weekdays: "flex w-max",
        weekday:
          "w-9 text-center text-[0.6875rem] font-semibold tracking-wide text-[#9ca3af]",
        week: "mt-0.5 flex",

        // The cell carries the range band so it runs edge to edge between days.
        day: "relative size-9 p-0 text-center text-sm",
        day_button: cn(
          "size-9 cursor-pointer rounded-md p-0 font-normal text-[#333333]",
          "transition-colors hover:bg-[#F4F4F4] hover:text-black",
          "focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#befe35]"
        ),

        selected:
          "[&>button]:bg-black [&>button]:font-medium [&>button]:text-white [&>button]:hover:bg-black [&>button]:hover:text-white",
        range_start:
          "rounded-l-md bg-[#f0fce0] [&>button]:bg-black [&>button]:text-white [&>button]:hover:bg-black",
        range_end:
          "rounded-r-md bg-[#f0fce0] [&>button]:bg-black [&>button]:text-white [&>button]:hover:bg-black",
        range_middle:
          "bg-[#f0fce0] [&>button]:rounded-none [&>button]:bg-transparent [&>button]:text-[#1E1E1E] [&>button]:hover:bg-[#e4f8c4]",

        today:
          "[&>button]:font-semibold [&>button]:text-black [&>button]:ring-1 [&>button]:ring-[#befe35] [&>button]:ring-inset",
        outside: "[&>button]:text-[#d1d5db] [&>button]:hover:bg-transparent",
        disabled: "[&>button]:cursor-not-allowed [&>button]:text-[#d1d5db] [&>button]:hover:bg-transparent",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: chevronClassName, ...chevronProps }) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight;
          return (
            <Icon
              className={cn("size-3.5", chevronClassName)}
              {...chevronProps}
            />
          );
        },
      }}
      {...props}
    />
  );
}

export { Calendar };
