"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

interface BlockchainLogoProps {
  className?: string
  height?: number
  showSubtitle?: boolean
  subtitle?: string
}

export function BlockchainLogo({
  className,
  height = 24,
  showSubtitle = true,
  subtitle = "Monitoring | Forensics",
}: BlockchainLogoProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // After mounting, we can safely show the logo
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className={`h-[${height}px] w-[${height * 6.5}px] bg-transparent`} />
  }

  // Calculate subtitle size proportionally to the logo text
  const subtitleFontSize = Math.max(Math.round(height * 0.6), 14) // Minimum size of 14px

  return (
    <div className={className}>
      <div className="flex flex-col items-center">
        <div className="relative">
          <div 
            className="font-bold tracking-wider text-white opacity-90"
            style={{ fontSize: `${height}px` }}
          >
            FORENSICS
          </div>
          {/* Add a subtle glow effect */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 mix-blend-overlay rounded-sm"
            style={{ filter: "blur(2px)" }}
          />
        </div>

        {showSubtitle && (
          <div
            className="text-blue-500 font-bold tracking-wider mt-1 whitespace-nowrap"
            style={{ fontSize: `${subtitleFontSize}px` }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </div>
  )
}