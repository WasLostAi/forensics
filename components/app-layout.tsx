"use client"

import { type ReactNode, useState, useEffect } from "react"
import { Navbar } from "./navbar"
import { ConnectionStatus } from "./connection-status"
import { MockModeBanner } from "./mock-mode-banner"

interface AppLayoutProps {
  children: ReactNode
  showNavbar?: boolean
  showConnectionStatus?: boolean
  useMockData?: boolean
}

export function AppLayout({
  children,
  showNavbar = true,
  showConnectionStatus = true,
  useMockData = false,
}: AppLayoutProps) {
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      {useMockData && <MockModeBanner />}
      {showNavbar && <Navbar />}
      {showConnectionStatus && <ConnectionStatus />}
      <main className="flex-1 container mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
