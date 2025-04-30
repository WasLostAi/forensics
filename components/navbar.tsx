"use client"

import Link from "next/link"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Search, BarChart2, Network, Tag, Github, Bookmark } from "lucide-react"

export function Navbar() {
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
        </div>
      </div>
    </header>
  )
}
