"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "relative flex flex-col gap-4 sm:flex-row",
        month: "flex flex-col gap-4",
        month_caption: "flex h-8 items-center justify-center relative px-8",
        caption_label: "text-sm font-medium text-[#333333]",
        nav: "absolute inset-x-0 top-0 flex items-center justify-between px-1 z-10",
        button_previous:
          "inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#CED1D8] bg-white text-[#333333] hover:bg-gray-50 disabled:opacity-50",
        button_next:
          "inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#CED1D8] bg-white text-[#333333] hover:bg-gray-50 disabled:opacity-50",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "w-9 text-[0.75rem] font-medium text-[#6b7280] text-center",
        week: "mt-1 flex w-full",
        day: "relative h-9 w-9 p-0 text-center text-sm",
        day_button:
          "h-9 w-9 rounded-md p-0 font-normal text-[#333333] hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#befe35]",
        selected:
          "[&>button]:bg-black [&>button]:text-white [&>button]:hover:bg-black [&>button]:hover:text-white",
        range_start:
          "rounded-l-md bg-[#f3f4f6] [&>button]:bg-black [&>button]:text-white",
        range_end:
          "rounded-r-md bg-[#f3f4f6] [&>button]:bg-black [&>button]:text-white",
        range_middle:
          "bg-[#f3f4f6] [&>button]:bg-transparent [&>button]:text-[#333333] [&>button]:rounded-none",
        today: "[&>button]:border [&>button]:border-[#befe35]",
        outside: "[&>button]:text-[#9ca3af] [&>button]:opacity-60",
        disabled: "[&>button]:text-[#9ca3af] [&>button]:opacity-40",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: chevronClassName, ...chevronProps }) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight;
          return (
            <Icon className={cn("h-4 w-4", chevronClassName)} {...chevronProps} />
          );
        },
      }}
      {...props}
    />
  );
}

export { Calendar };
