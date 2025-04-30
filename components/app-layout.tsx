"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { Search, BarChart2, Network, Tag, Github, Bookmark, Home, Wallet, History, FileText, Settings, Users, HelpCircle, LogOut, Database } from 'lucide-react'
import { useMediaQuery } from "@/hooks/use-media-query"
import { SolanaLogo } from "@/components/solana-logo"
import { ConnectionStatus } from "@/components/connection-status"
import { useAuth } from "@/contexts/auth-context"
import { Navbar } from "@/components/navbar"
import { MockModeBanner } from "@/components/mock-mode-banner"

// Enable mock mode for development/preview environments
const ENABLE_MOCK_MODE = true // Set to false in production

// List of routes that don't need the app layout (auth pages)
const authRoutes = [
  "/auth/sign-in",
  "/auth/sign-up",
  "/auth/forgot-password",
  "/auth/reset-password",
]

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { isLoading } = useAuth()

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

  // Check if current path is an auth route
  const isAuthRoute = authRoutes.some(route => pathname?.startsWith(route))

  // If it's an auth route, don't show the app layout
  if (isAuthRoute) {
    return <>{children}</>
  }

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Show the full app layout for authenticated routes
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
