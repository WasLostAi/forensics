"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

export function AuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("auth_token")

    // Public routes that don't require authentication
    const publicRoutes = ["/login"]
    const isPublicRoute = publicRoutes.some((route) => pathname?.startsWith(route))

    if (!token && !isPublicRoute) {
      // Redirect to login if not authenticated and not on a public route
      router.push("/login")
    } else if (token && isPublicRoute) {
      // Redirect to home if authenticated and on a public route
      router.push("/")
    } else {
      setIsAuthenticated(!!token)
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

  // If on a public route or authenticated, render children
  return <>{children}</>
}
