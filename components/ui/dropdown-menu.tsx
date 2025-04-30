"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const DropdownMenuContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
  onSelect: () => void
}>({
  open: false,
  setOpen: () => {},
  onSelect: () => {},
})

function DropdownMenu({
  children,
  open,
  defaultOpen,
  onOpenChange,
}: {
  children: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen || false)

  const openState = open !== undefined ? open : internalOpen

  const setOpen = React.useCallback(
    (open: boolean) => {
      if (open !== undefined) {
        setInternalOpen(open)
        onOpenChange?.(open)
      }
    },
    [onOpenChange],
  )

  const handleSelect = React.useCallback(() => {
    setOpen(false)
  }, [setOpen])

  return (
    <DropdownMenuContext.Provider value={{ open: openState, setOpen, onSelect: handleSelect }}>
      {children}
    </DropdownMenuContext.Provider>
  )
}

const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ className, asChild, children, ...props }, ref) => {
  const { open, setOpen } = React.useContext(DropdownMenuContext)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setOpen(!open)
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement, {
      ref,
      onClick: handleClick,
      "aria-expanded": open,
      "aria-haspopup": true,
      ...props,
    })
  }

  return (
    <button
      ref={ref}
      className={className}
      onClick={handleClick}
      aria-expanded={open}
      aria-haspopup={true}
      type="button"
      {...props}
    >
      {children}
    </button>
  )
})
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    align?: "start" | "center" | "end"
    side?: "top" | "right" | "bottom" | "left"
    sideOffset?: number
    alignOffset?: number
  }
>(({ className, align = "center", side = "bottom", children, ...props }, ref) => {
  const { open } = React.useContext(DropdownMenuContext)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !open) {
    return null
  }

  return (
    <div
      ref={ref}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className,
      )}
      data-side={side}
      data-align={align}
      {...props}
    >
      {children}
    </div>
  )
})
DropdownMenuContent.displayName = "DropdownMenuContent"

const DropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    inset?: boolean
    disabled?: boolean
    onSelect?: (event: React.MouseEvent | React.KeyboardEvent) => void
  }
>(({ className, children, inset, disabled, onSelect, ...props }, ref) => {
  const { onSelect: contextOnSelect } = React.useContext(DropdownMenuContext)

  const handleSelect = (event: React.MouseEvent | React.KeyboardEvent) => {
    if (disabled) return

    onSelect?.(event)
    contextOnSelect()
  }

  const handleClick = (event: React.MouseEvent) => {
    handleSelect(event)
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      handleSelect(event)
    }
  }

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        inset && "pl-8",
        className,
      )}
      role="menuitem"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      data-disabled={disabled ? "" : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {children}
    </div>
  )
})
DropdownMenuItem.displayName = "DropdownMenuItem"

const DropdownMenuSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("-mx-1 my-1 h-px bg-muted", className)} role="separator" {...props} />
  ),
)
DropdownMenuSeparator.displayName = "DropdownMenuSeparator"

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator }
