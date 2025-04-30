"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

// Admin wallet address - this is the only wallet that can access admin panel
const ADMIN_WALLET = "AuwUfiwsXA6VibDjR579HWLhDUUoa5s6T7i7KPyLUa9F"

export function AuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated
    const walletAddress = localStorage.getItem("wallet_address")
    const authToken = localStorage.getItem("auth_token")

    // Public routes that don't require authentication
    const publicRoutes = ["/login"]
    const isPublicRoute = publicRoutes.some((route) => pathname?.startsWith(route))

    // Admin routes that require admin wallet
    const adminRoutes = ["/admin"]
    const isAdminRoute = adminRoutes.some((route) => pathname?.startsWith(route))

    if (isAdminRoute && walletAddress !== ADMIN_WALLET) {
      // Redirect to home if trying to access admin route without admin wallet
      router.push("/")
      return
    }

    if (!authToken && !isPublicRoute) {
      // Redirect to login if not authenticated and not on a public route
      router.push("/login")
    } else {
      setIsAuthenticated(!!authToken)
      setIsLoading(false)
    }
  }, [pathname, router])

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  // Render children if authenticated
  return <>{children}</>
}
