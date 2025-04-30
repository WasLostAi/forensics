"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TooltipProps {
  children: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

function Tooltip({ children, open: controlledOpen, defaultOpen = false, onOpenChange }: TooltipProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen

  const setOpen = React.useCallback(
    (open: boolean) => {
      if (controlledOpen === undefined) {
        setUncontrolledOpen(open)
      }
      onOpenChange?.(open)
    },
    [controlledOpen, onOpenChange],
  )

  return <TooltipContext.Provider value={{ open, setOpen }}>{children}</TooltipContext.Provider>
}

const TooltipContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
}>({
  open: false,
  setOpen: () => {},
})

interface TooltipProviderProps {
  children: React.ReactNode
  delayDuration?: number
}

function TooltipProvider({ children }: TooltipProviderProps) {
  return <>{children}</>
}

interface TooltipTriggerProps extends React.HTMLAttributes<HTMLElement> {
  asChild?: boolean
}

const TooltipTrigger = React.forwardRef<HTMLElement, TooltipTriggerProps>(({ asChild, children, ...props }, ref) => {
  const { setOpen } = React.useContext(TooltipContext)

  const child =
    asChild && React.isValidElement(children) ? React.Children.only(children) : <span {...props}>{children}</span>

  if (!React.isValidElement(child)) {
    return null
  }

  return React.cloneElement(child as React.ReactElement, {
    ...props,
    ref,
    onMouseEnter: (event: React.MouseEvent) => {
      child.props.onMouseEnter?.(event)
      setOpen(true)
    },
    onMouseLeave: (event: React.MouseEvent) => {
      child.props.onMouseLeave?.(event)
      setOpen(false)
    },
    onFocus: (event: React.FocusEvent) => {
      child.props.onFocus?.(event)
      setOpen(true)
    },
    onBlur: (event: React.FocusEvent) => {
      child.props.onBlur?.(event)
      setOpen(false)
    },
  })
})
TooltipTrigger.displayName = "TooltipTrigger"

interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  hidden?: boolean
}

const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ className, side = "top", align = "center", hidden = false, ...props }, ref) => {
    const { open } = React.useContext(TooltipContext)

    if (hidden || !open) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className,
        )}
        data-side={side}
        data-align={align}
        {...props}
      />
    )
  },
)
TooltipContent.displayName = "TooltipContent"

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
