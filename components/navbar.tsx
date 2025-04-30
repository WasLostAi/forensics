"use client"

import Link from "next/link"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Search, BarChart2, Network, Tag, Github, Bookmark, User, LogOut } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Navbar() {
  const { user, signOut, isLoading } = useAuth()

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl flex items-center gap-2">
          <Network className="h-5 w-5" />
          <span>SolanaForensics</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium">
            <Search className="h-4 w-4" />
            <span>Search</span>
          </Link>
          <Link href="/transactions" className="flex items-center gap-2 text-sm font-medium">
            <BarChart2 className="h-4 w-4" />
            <span>Transactions</span>
          </Link>
          <Link href="/entities" className="flex items-center gap-2 text-sm font-medium">
            <Tag className="h-4 w-4" />
            <span>Entities</span>
          </Link>
          <Link href="/investigations" className="flex items-center gap-2 text-sm font-medium">
            <Bookmark className="h-4 w-4" />
            <span>Investigations</span>
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="https://github.com/username/solana-forensics" target="_blank">
            <Button variant="outline" size="icon">
              <Github className="h-4 w-4" />
              <span className="sr-only">GitHub</span>
            </Button>
          </Link>
          <ModeToggle />

          {!isLoading && (
            <>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <User className="h-4 w-4" />
                      <span className="sr-only">User menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings">Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild>
                  <Link href="/auth/sign-in">Sign in</Link>
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  )
}
