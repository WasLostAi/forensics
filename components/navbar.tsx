"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ConnectionStatus } from "@/components/connection-status"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ModeToggle } from "@/components/mode-toggle"
import { SolanaLogo } from "@/components/solana-logo"
import {
  Menu,
  Search,
  Tag,
  Wallet,
  FileText,
  Settings,
  BellRing,
  Layers,
  Network,
  Home,
  ChevronDown,
  AlertTriangle,
  File,
  HelpCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"

export default function Navbar() {
  const pathname = usePathname()
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const NavLink = ({
    href,
    children,
    icon: Icon,
  }: { href: string; children: React.ReactNode; icon: React.ElementType }) => {
    const isActive = pathname === href

    return (
      <Link href={href} passHref>
        <Button
          variant="ghost"
          className={cn(
            "flex items-center gap-2",
            isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Icon className="h-4 w-4" />
          {children}
        </Button>
      </Link>
    )
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center px-4">
          <div className="mr-4 flex">
            <Link href="/" className="flex items-center gap-2">
              <SolanaLogo className="h-6 w-6" />
              <span className="font-semibold hidden md:inline-block">Solana Forensics</span>
            </Link>
          </div>

          {isMobile ? (
            <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
              <Button variant="ghost" size="icon" onClick={toggleMenu}>
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
              <div className="flex items-center">
                <ConnectionStatus />
                <ModeToggle />
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-1 items-center gap-1">
                <NavLink href="/" icon={Home}>
                  Home
                </NavLink>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <Layers className="h-4 w-4" />
                      Analyze
                      <ChevronDown className="h-3 w-3 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/wallet" className="flex items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        Wallet Analysis
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/transactions" className="flex items-center gap-2">
                        <Network className="h-4 w-4" />
                        Transaction Flows
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/token" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Token Analysis
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <NavLink href="/entities" icon={Tag}>
                  Entities
                </NavLink>
                <NavLink href="/investigations" icon={File}>
                  Investigations
                </NavLink>
                <NavLink href="/monitoring" icon={AlertTriangle}>
                  Monitoring
                </NavLink>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/search">
                    <Search className="h-5 w-5" />
                    <span className="sr-only">Search</span>
                  </Link>
                </Button>

                <Button variant="ghost" size="icon" asChild>
                  <Link href="/notifications">
                    <BellRing className="h-5 w-5" />
                    <span className="sr-only">Notifications</span>
                  </Link>
                </Button>

                <ConnectionStatus />
                <ModeToggle />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Settings className="h-5 w-5" />
                      <span className="sr-only">Settings</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/settings">Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/api-keys">API Keys</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/help">
                        <HelpCircle className="mr-2 h-4 w-4" />
                        <span>Help & Documentation</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          )}
        </div>
      </header>

      {isMobile && isMenuOpen && (
        <div className="fixed inset-0 top-14 z-40 bg-background border-t">
          <nav className="container grid gap-2 p-4">
            <Link href="/" className="flex items-center gap-2 py-2" onClick={toggleMenu}>
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <Link href="/wallet" className="flex items-center gap-2 py-2" onClick={toggleMenu}>
              <Wallet className="h-4 w-4" />
              <span>Wallet Analysis</span>
            </Link>
            <Link href="/transactions" className="flex items-center gap-2 py-2" onClick={toggleMenu}>
              <Network className="h-4 w-4" />
              <span>Transaction Flows</span>
            </Link>
            <Link href="/token" className="flex items-center gap-2 py-2" onClick={toggleMenu}>
              <FileText className="h-4 w-4" />
              <span>Token Analysis</span>
            </Link>
            <Link href="/entities" className="flex items-center gap-2 py-2" onClick={toggleMenu}>
              <Tag className="h-4 w-4" />
              <span>Entities</span>
            </Link>
            <Link href="/investigations" className="flex items-center gap-2 py-2" onClick={toggleMenu}>
              <File className="h-4 w-4" />
              <span>Investigations</span>
            </Link>
            <Link href="/monitoring" className="flex items-center gap-2 py-2" onClick={toggleMenu}>
              <AlertTriangle className="h-4 w-4" />
              <span>Monitoring</span>
            </Link>
            <Link href="/search" className="flex items-center gap-2 py-2" onClick={toggleMenu}>
              <Search className="h-4 w-4" />
              <span>Search</span>
            </Link>
            <Link href="/settings" className="flex items-center gap-2 py-2" onClick={toggleMenu}>
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Link>
            <Link href="/help" className="flex items-center gap-2 py-2" onClick={toggleMenu}>
              <HelpCircle className="h-4 w-4" />
              <span>Help & Documentation</span>
            </Link>
          </nav>
        </div>
      )}
    </>
  )
}
