"use client"

import * as React from "react"
import { DayPicker, type DayPickerProps } from "react-day-picker"
import { cn } from "@/lib/utils"
import "react-day-picker/dist/style.css"

function Calendar({ className, classNames, ...props }: DayPickerProps) {
  return (
    <DayPicker
      className={cn("calendar-root", className)}
      classNames={{
        months: "months",
        month: "month",
        captions: "captions",
        caption_label: "caption_label",
        table: "table",
        head_row: "head_row",
        head_cell: "head_cell",
        row: "row_calendar",
        cell: "cell_calendar",
        day: "day",
        day_selected: "day_selected",
        day_today: "day_today",
        day_outside: "day_outside",
        day_disabled: "day_disabled",
        ...classNames,
      }}
      {...props}
    />
  )
}

export { Calendar }
