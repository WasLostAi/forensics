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
import {
  Search,
  BarChart2,
  Network,
  Tag,
  Github,
  Bookmark,
  Home,
  Wallet,
  History,
  FileText,
  Settings,
  Users,
  HelpCircle,
  LogOut,
  Database,
  Shield,
} from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { SolanaLogo } from "@/components/solana-logo"
import { ConnectionStatus } from "@/components/connection-status"
import { MockModeBanner } from "@/components/mock-mode-banner"
import { AuthCheck } from "@/components/auth-check"

// Admin wallet address
const ADMIN_WALLET = "AuwUfiwsXA6VibDjR579HWLhDUUoa5s6T7i7KPyLUa9F"

// Enable mock mode for development/preview environments
const ENABLE_MOCK_MODE = true // Set to false in production

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname()
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [searchQuery, setSearchQuery] = useState("")
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  // Check if current route is login
  const isLoginRoute = pathname === "/login"

  useEffect(() => {
    // Get wallet address from localStorage
    const storedWalletAddress = localStorage.getItem("wallet_address")
    setWalletAddress(storedWalletAddress)

    // Check if admin
    setIsAdmin(storedWalletAddress === ADMIN_WALLET)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Use proper Next.js navigation
      window.location.href = `/wallet/${searchQuery.trim()}`
    }
  }

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("wallet_address")
    localStorage.removeItem("user_role")
    window.location.href = "/login"
  }

  // If it's the login route, just render the children without the app layout
  if (isLoginRoute) {
    return <AuthCheck>{children}</AuthCheck>
  }

  // Otherwise, render the full app layout
  return (
    <AuthCheck>
      <SidebarProvider>
        <div className="flex min-h-screen">
          <Sidebar variant="inset" className="border-r border-border/30">
            <SidebarHeader>
              <div className="flex items-center justify-center px-4 py-4">
                <SolanaLogo height={28} subtitle="Monitoring | Forensics" />
              </div>
              <form onSubmit={handleSearch} className="px-2 pt-2 pb-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search wallet address..."
                    className="w-full pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </form>
            </SidebarHeader>

            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel className="font-genos">Main</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={pathname === "/"}>
                        <Link href="/">
                          <Home className="mr-2 h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={pathname.startsWith("/wallet")}>
                        <Link href="/wallet">
                          <Wallet className="mr-2 h-4 w-4" />
                          <span>Wallet Analysis</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === "/transactions" || pathname.startsWith("/transaction/")}
                      >
                        <Link href="/transactions">
                          <History className="mr-2 h-4 w-4" />
                          <span>Transactions</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={pathname === "/investigations"}>
                        <Link href="/investigations">
                          <Bookmark className="mr-2 h-4 w-4" />
                          <span>Investigations</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarSeparator />

              <SidebarGroup>
                <SidebarGroupLabel className="font-genos">Analysis</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={false}>
                        <Link href="/wallet?tab=flow">
                          <Network className="mr-2 h-4 w-4 text-[#14F195]" />
                          <span>Transaction Flow</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={pathname === "/monitoring"}>
                        <Link href="/monitoring">
                          <BarChart2 className="mr-2 h-4 w-4 text-[#14F195]" />
                          <span>Monitoring</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={pathname.startsWith("/entities")}>
                        <Link href="/entities/management">
                          <Tag className="mr-2 h-4 w-4 text-[#9945FF]" />
                          <span>Entity Management</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={pathname === "/network-explorer"}>
                        <Link href="/network-explorer">
                          <Database className="mr-2 h-4 w-4 text-[#9945FF]" />
                          <span>Network Explorer</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={pathname === "/reports"}>
                        <Link href="/reports">
                          <FileText className="mr-2 h-4 w-4" />
                          <span>Reports</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={false}>
                        <Link href="/wallet?tab=funding">
                          <BarChart2 className="mr-2 h-4 w-4 text-[#14F195]" />
                          <span>Analytics</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    {isAdmin && (
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={pathname === "/admin"}>
                          <Link href="/admin">
                            <Shield className="mr-2 h-4 w-4 text-amber-500" />
                            <span className="text-amber-500">Admin Panel</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarSeparator />

              <SidebarGroup>
                <SidebarGroupLabel className="font-genos">Team</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={pathname === "/collaborators"}>
                        <Link href="/collaborators">
                          <Users className="mr-2 h-4 w-4" />
                          <span>Collaborators</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/settings"}>
                    <Link href="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/help"}>
                    <Link href="/">
                      <HelpCircle className="mr-2 h-4 w-4" />
                      <span>Help & Documentation</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>

              <SidebarSeparator />

              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{walletAddress ? "W" : "U"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {walletAddress
                          ? `${walletAddress.substring(0, 4)}...${walletAddress.substring(walletAddress.length - 4)}`
                          : "User"}
                        {isAdmin && <span className="ml-1 text-amber-500">(Admin)</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">{isAdmin ? "Admin" : "User"}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    <span className="sr-only">Log out</span>
                  </Button>
                </div>
              </div>
            </SidebarFooter>
          </Sidebar>

          <SidebarInset>
            <header className="flex h-16 items-center gap-4 border-b border-border/30 px-6 backdrop-blur-sm">
              <SidebarTrigger />
              <ConnectionStatus />
              <div className="flex-1" />
              <div className="flex items-center gap-2">
                <Link href="https://github.com/username/solana-forensics" target="_blank">
                  <Button variant="outline" size="icon">
                    <Github className="h-4 w-4" />
                    <span className="sr-only">GitHub</span>
                  </Button>
                </Link>
                <ModeToggle />
              </div>
            </header>
            <main className="flex-1 overflow-auto p-6 gradient-background">
              {ENABLE_MOCK_MODE && <MockModeBanner />}
              {children}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </AuthCheck>
  )
}
