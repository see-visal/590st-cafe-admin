"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type PopoverContextValue = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  rootRef: React.RefObject<HTMLDivElement | null>
}

const PopoverContext = React.createContext<PopoverContextValue | null>(null)

function usePopoverContext() {
  const context = React.useContext(PopoverContext)
  if (!context) {
    throw new Error("Popover components must be used within a Popover")
  }
  return context
}

function Popover({
  children,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
}: React.PropsWithChildren<{ defaultOpen?: boolean; open?: boolean; onOpenChange?: (open: boolean) => void }>) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = (value: boolean) => {
    if (controlledOpen === undefined) {
      setInternalOpen(value)
    }
    onOpenChange?.(value)
  }
  const rootRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  return (
    <PopoverContext.Provider value={{ open, setOpen, rootRef }}>
      <div ref={rootRef} className="relative inline-block">
        {children}
      </div>
    </PopoverContext.Provider>
  )
}

type PopoverTriggerProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  children: React.ReactNode
}

function PopoverTrigger({ children, ...props }: PopoverTriggerProps) {
  const { open, setOpen } = usePopoverContext()

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setOpen(!open)
    if (props.onClick) {
      props.onClick(event)
    }
  }

  if (React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      ...props,
      onClick: handleClick,
    })
  }

  return (
    <button type="button" onClick={handleClick} {...props}>
      {children}
    </button>
  )
}

function PopoverContent({
  className,
  align = "start",
  children,
  ...props
}: React.PropsWithChildren<{
  className?: string
  align?: "start" | "center" | "end"
}>) {
  const { open } = usePopoverContext()

  if (!open) {
    return null
  }

  const alignment =
    align === "end"
      ? "right-0"
      : align === "center"
      ? "left-1/2 -translate-x-1/2"
      : "left-0"

  return (
    <div
      className={cn(
        "absolute z-50 mt-2 w-auto rounded-lg border border-border bg-popover p-0 text-popover-foreground shadow-lg",
        alignment,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function PopoverArrow({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  return <div className={cn("absolute h-2 w-2 rotate-45 bg-popover", className)} {...props} />
}

function PopoverClose({ ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { setOpen } = usePopoverContext()
  return (
    <button type="button" onClick={() => setOpen(false)} {...props} />
  )
}

export { Popover, PopoverTrigger, PopoverContent, PopoverArrow, PopoverClose }
