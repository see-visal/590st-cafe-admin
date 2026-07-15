"use client"

import * as React from "react"
import { DayPicker, type DayPickerProps } from "react-day-picker"
import { cn } from "@/lib/utils"
import "react-day-picker/dist/style.css"

function Calendar({ className, classNames, ...props }: DayPickerProps) {
  return (
    <DayPicker
      className={cn("rounded-md border p-3 [&_button]:outline-none", className)}
      classNames={{
        months: "flex flex-col gap-4 sm:flex-row",
        month: "space-y-4",
        caption: "flex items-center justify-between pt-1 mb-2",
        caption_label: "text-sm font-medium text-muted-foreground",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md border border-border bg-background px-2 py-1 text-[0.65rem] font-medium uppercase",
        row: "flex w-full mt-2",
        cell: "p-0",
        day: "h-10 w-10 rounded-md bg-transparent text-center font-medium transition hover:bg-muted hover:text-foreground focus:z-20 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        day_selected: "bg-primary text-primary-foreground",
        day_today: "bg-muted",
        day_outside: "text-muted-foreground",
        day_disabled: "text-muted-foreground/50",
        ...classNames,
      }}
      {...props}
    />
  )
}

export { Calendar }
