"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number[]
  min?: number
  max?: number
  step?: number
  onValueChange?: (value: number[]) => void
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ className, value = [0], min = 0, max = 100, step = 1, onValueChange, ...props }, ref) => {
    const [localValue, setLocalValue] = React.useState(value)
    const [isDragging, setIsDragging] = React.useState(false)
    const sliderRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
      setLocalValue(value)
    }, [value])

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
      setIsDragging(true)
      handlePointerMove(event)
    }

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging && event.type !== "pointerdown") return

      const slider = sliderRef.current
      if (!slider) return

      const rect = slider.getBoundingClientRect()
      const percent = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1)
      const rawValue = min + percent * (max - min)
      const steppedValue = Math.round(rawValue / step) * step
      const clampedValue = Math.min(Math.max(steppedValue, min), max)

      const newValue = [clampedValue]
      setLocalValue(newValue)
      onValueChange?.(newValue)
    }

    const handlePointerUp = () => {
      setIsDragging(false)
    }

    React.useEffect(() => {
      if (isDragging) {
        document.addEventListener("pointermove", handlePointerMove as any)
        document.addEventListener("pointerup", handlePointerUp)
        return () => {
          document.removeEventListener("pointermove", handlePointerMove as any)
          document.removeEventListener("pointerup", handlePointerUp)
        }
      }
    }, [isDragging])

    const percent = ((localValue[0] - min) / (max - min)) * 100

    return (
      <div ref={ref} className={cn("relative w-full touch-none select-none", className)} {...props}>
        <div
          ref={sliderRef}
          className="relative h-2 w-full rounded-full bg-secondary"
          onPointerDown={handlePointerDown}
        >
          <div className="absolute h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
          <div
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 border-primary bg-background"
            style={{ left: `${percent}%` }}
          />
        </div>
      </div>
    )
  },
)
Slider.displayName = "Slider"

export { Slider }
