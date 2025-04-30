"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { useMediaQuery } from "@/hooks/use-media-query"
import { MockModeBanner } from "@/components/mock-mode-banner"
import { useAuth } from "@/contexts/auth-context"
import { Navbar } from "@/components/navbar"

// Enable mock mode for development/preview environments
const ENABLE_MOCK_MODE = true // Set to false in production

// List of routes that don't need the full app layout
const specialRoutes = ["/login", "/auth/sign-in", "/auth/sign-up", "/auth/forgot-password", "/auth/reset-password"]

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { isLoading, user, userRole } = useAuth()

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      // This would be handled by the sidebar component internally
    }
  }, [pathname, isMobile])
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Use proper Next.js navigation
      window.location.href = `/wallet/${searchQuery.trim()}`
    }
  }

  // Check if current route is a special route
  const isSpecialRoute = specialRoutes.some((route) => pathname?.startsWith(route))

  // If it's a special route, render without the app layout
  if (isSpecialRoute) {
    return <>{children}</>
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  // If not authenticated and not on a special route, this shouldn't happen
  // because middleware should redirect, but just in case
  if (!user && !["judge", "admin"].includes(userRole)) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Authentication Required</h1>
          <p className="mt-2">Please log in to access this page.</p>
        </div>
      </div>
    )
  }

  // Render the full app layout
  return (
    <div className="flex min-h-screen flex-col">
      <MockModeBanner />
      <Navbar />
      <main className="flex-1 p-4 md:p-6">{children}</main>
    </div>
  )
}
