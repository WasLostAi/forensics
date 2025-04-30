"use client"

import { useTheme } from "next-themes"
import Image from "next/image"
import { useEffect, useState } from "react"

interface SolanaLogoProps {
  className?: string
  height?: number
  showSubtitle?: boolean
  subtitle?: string
}

export function SolanaLogo({
  className,
  height = 24,
  showSubtitle = true,
  subtitle = "Monitoring | Forensics",
}: SolanaLogoProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // After mounting, we can safely show the logo
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className={`h-[${height}px] w-[${height * 6.5}px] bg-transparent`} />
  }

  // Calculate subtitle size proportionally to the SOLANA logo
  // This ensures consistent proportions between sidebar and headline
  const subtitleFontSize = Math.max(Math.round(height * 0.6), 14) // Minimum size of 14px

  // Always use the white version of the logo with an overlay
  return (
    <div className={className}>
      <div className="flex flex-col items-center">
        <div className="relative">
          <Image
            src="/images/solana-wordmark.svg"
            alt="Solana"
            width={height * 6.5}
            height={height}
            className="h-auto w-auto brightness-0 invert opacity-90"
          />
          {/* Add a subtle glow effect */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-[#9945FF]/10 to-[#14F195]/10 mix-blend-overlay rounded-sm"
            style={{ filter: "blur(2px)" }}
          />
        </div>

        {showSubtitle && (
          <div
            className="text-[#9945FF] font-genos font-bold tracking-wider mt-1 whitespace-nowrap"
            style={{ fontSize: `${subtitleFontSize}px` }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </div>
  )
}
