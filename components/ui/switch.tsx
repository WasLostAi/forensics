"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, onCheckedChange, checked, defaultChecked, ...props }, ref) => {
    const [isChecked, setIsChecked] = React.useState(checked || defaultChecked || false)

    React.useEffect(() => {
      if (checked !== undefined) {
        setIsChecked(checked)
      }
    }, [checked])

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newChecked = event.target.checked
      if (checked === undefined) {
        setIsChecked(newChecked)
      }
      onCheckedChange?.(newChecked)
    }

    return (
      <label className={cn("inline-flex items-center cursor-pointer", className)}>
        <input
          type="checkbox"
          className="sr-only"
          ref={ref}
          checked={isChecked}
          defaultChecked={defaultChecked}
          onChange={handleChange}
          {...props}
        />
        <div
          className={cn(
            "relative w-11 h-6 bg-gray-200 rounded-full transition-colors",
            isChecked ? "bg-primary" : "bg-input",
          )}
        >
          <div
            className={cn(
              "absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform",
              isChecked ? "transform translate-x-5" : "",
            )}
          />
        </div>
      </label>
    )
  },
)
Switch.displayName = "Switch"

export { Switch }
