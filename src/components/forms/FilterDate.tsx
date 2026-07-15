"use client"

import * as React from "react"
import { addDays, format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { type DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function DatePickerWithRange() {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), 0, 20),
    to: addDays(new Date(new Date().getFullYear(), 0, 20), 20),
  })
  const [tempDate, setTempDate] = React.useState<DateRange | undefined>(date)
  const [open, setOpen] = React.useState(false)

  const handleApply = () => {
    setDate(tempDate)
    setOpen(false)
  }

  const handleCancel = () => {
    setTempDate(date)
    setOpen(false)
  }

  React.useEffect(() => {
    if (open) {
      setTempDate(date)
    }
  }, [open, date])

  return (
    <Field className="w-full">
      <FieldLabel htmlFor="date-picker-range">Orders Date Range</FieldLabel>
      <div className="mt-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger onClick={() => setOpen(!open)}>
            <Button
              variant="outline"
              id="date-picker-range"
              className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 pr-10 text-left text-sm text-gray-900 shadow-sm"
            >
              <span className="flex w-full items-center justify-between gap-2 text-sm text-gray-900">
                <span className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "LLL dd, y")} - {" "}
                        {format(date.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(date.from, "LLL dd, y")
                    )
                  ) : (
                    <span className="text-sm text-gray-500">Start Date - End Date</span>
                  )}
                </span>
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-4" align="start">
            <Calendar
              mode="range"
              defaultMonth={tempDate?.from}
              selected={tempDate}
              onSelect={setTempDate}
              numberOfMonths={2}
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="px-4 py-2 text-sm"
              >
                Cancel
              </Button>
              <Button
                onClick={handleApply}
                className="bg-black text-white hover:bg-gray-800 px-4 py-2 text-sm"
              >
                Apply
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </Field>
  )
}
